import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { AccessToken } from "livekit-server-sdk";
import { chat } from "./llm/index.js";
import { PipelineBuilder } from "./voice/pipeline/index.js";
import { initializeProvidersIfNeeded } from "./voice/providers/index.js";
import { VoicePipeline } from "./voice/pipeline/VoicePipeline.js";
import {
  movies, cinemas, promotions,
  getSeatLayout, generateShowtimes,
  ticketTypes, ticketPackages, calculatePrice,
  concessionCategories,
} from "./mock/cinemark-data.js";
import { writeFile, unlink } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import ffmpegStatic from "ffmpeg-static";
import type { ScreenFormat, Language } from "@cinechan/shared";

// Clean markdown/emojis/asterisks from text before TTS
function cleanForTTS(text: string): string {
  return text
    .replace(/[*_~`#>|]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "*",
    credentials: true,
  }),
);

const PORT = Number(process.env.PORT) || 3003;

// Global pipeline instance (initialized on first request)
let voicePipeline: Awaited<ReturnType<typeof PipelineBuilder.build>> | null =
  null;

async function getPipeline(): Promise<
  Awaited<ReturnType<typeof PipelineBuilder.build>>
> {
  await initializeProvidersIfNeeded();

  if (!voicePipeline) {
    voicePipeline = await PipelineBuilder.build();
  }
  return voicePipeline;
}

// Chat endpoint (texto)
app.post("/api/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { message } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const response = await chat(message) ?? "Lo siento, no pude generar una respuesta.";
    return c.json({ response, audio_text: cleanForTTS(response) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Chat error:", msg);
    const isOllama = msg.includes("ECONNREFUSED") || msg.includes("11434");
    if (isOllama) {
      return c.json({ response: "🎬 Ollama no está corriendo. Iniciá Ollama con `ollama serve` o configurá OPENAI_API_KEY en .env para usar OpenAI como fallback." });
    }
    return c.json({ error: "Error processing message" }, 500);
  }
});

function decodeWebMToPCM(webmBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputPath = join(tmpdir(), `${randomUUID()}.webm`);
    const outputPath = join(tmpdir(), `${randomUUID()}.raw`);

    writeFile(inputPath, webmBuffer)
      .then(() => {
        const ffmpegPath = (ffmpegStatic as unknown as string) || "ffmpeg";
        const ffmpeg = spawn(ffmpegPath, [
          "-y",
          "-i", inputPath,
          "-f", "f32le",
          "-acodec", "pcm_f32le",
          "-ar", "16000",
          "-ac", "1",
          outputPath,
        ], { stdio: ["ignore", "ignore", "pipe"] });

        let stderr = "";
        ffmpeg.stderr!.on("data", (data: Buffer) => { stderr += data.toString(); });

        ffmpeg.on("close", async (code: number | null) => {
          await unlink(inputPath).catch(() => {});
          if (code !== 0) {
            await unlink(outputPath).catch(() => {});
            reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
            return;
          }
          const { readFile } = await import("node:fs/promises");
          const pcm = await readFile(outputPath);
          await unlink(outputPath).catch(() => {});
          resolve(pcm);
        });

        ffmpeg.on("error", (err: Error) => {
          unlink(inputPath).catch(() => {});
          reject(err);
        });
      })
      .catch(reject);
  });
}

app.post("/api/voice", async (c) => {
  try {
    const body = await c.req.json();
    const { audio } = body;

    if (!audio || typeof audio !== "string") {
      return c.json({ error: "Audio data is required" }, 400);
    }

    console.log("🎤 Processing voice request...");
    console.log("📊 Audio base64 length:", audio.length);

    const pipeline = await getPipeline();
    const audioBuffer = Buffer.from(audio, "base64");
    const pcmBuffer = await decodeWebMToPCM(audioBuffer);
    const result = await pipeline.process(pcmBuffer);

    const audioBase64 = result.audio.toString("base64");

    return c.json({ audio: audioBase64, text: result.text });
  } catch (error) {
    console.error("Voice pipeline error:", error);
    return c.json({ error: "Error processing voice request" }, 500);
  }
});

app.get("/api/movies", (c) => {
  const city = c.req.query("city")
  const format = c.req.query("format") as ScreenFormat | undefined
  const language = c.req.query("language") as Language | undefined
  const isPremiere = c.req.query("isPremiere")
  const genre = c.req.query("genre")

  let filtered = movies
  if (city) {
    const ids = new Set(cinemas.filter(ci => ci.city.toLowerCase() === city.toLowerCase()).map(ci => ci.id))
    const playing = new Set(generateShowtimes().filter(s => ids.has(s.cinemaId)).map(s => s.movieId))
    filtered = filtered.filter(m => playing.has(m.id))
  }
  if (format) filtered = filtered.filter(m => m.formats.includes(format))
  if (language) filtered = filtered.filter(m => m.languages.includes(language))
  if (isPremiere) filtered = filtered.filter(m => m.isPremiere === (isPremiere === "true"))
  if (genre) filtered = filtered.filter(m => m.genre.toLowerCase() === genre.toLowerCase())

  return c.json({
    movies: filtered.map(m => ({
      id: m.id, title: m.title, rating: m.rating, genre: m.genre,
      duration: m.duration, formats: m.formats, languages: m.languages,
      isPremiere: m.isPremiere, isReRelease: m.isReRelease,
      releaseDate: m.releaseDate, posterUrl: m.posterUrl,
      director: m.director, actors: m.actors.slice(0, 3),
    })),
  })
})

app.get("/api/showtimes", (c) => {
  const movieId = c.req.query("movieId")
  const cinemaId = c.req.query("cinemaId")
  const date = c.req.query("date")
  const format = c.req.query("format") as ScreenFormat | undefined
  const language = c.req.query("language") as Language | undefined

  const results = generateShowtimes(movieId, cinemaId, date, format, language)

  return c.json({
    showtimes: results.map(s => {
      const movie = movies.find(m => m.id === s.movieId)
      const cinema = cinemas.find(c => c.id === s.cinemaId)
      return { ...s, movieTitle: movie?.title, cinemaName: cinema?.name }
    }),
  })
})

app.get("/api/cinemas", (c) => {
  const city = c.req.query("city")
  let filtered = cinemas
  if (city) filtered = filtered.filter(c => c.city.toLowerCase() === city.toLowerCase())
  return c.json({ cinemas: filtered })
})

app.get("/api/promotions", (c) => {
  const type = c.req.query("type")
  const bankBin = c.req.query("bankBin")
  let filtered = promotions
  if (type) filtered = filtered.filter(p => p.type === type)
  return c.json({ promotions: filtered })
})

app.get("/api/movies/:movieId", (c) => {
  const movie = movies.find(m => m.id === c.req.param("movieId"))
  if (!movie) return c.json({ error: "Película no encontrada" }, 404)
  return c.json(movie)
})

app.get("/api/seats/:cinemaId/:screenNumber", (c) => {
  const cinemaId = c.req.param("cinemaId")
  const screenNumber = Number(c.req.param("screenNumber"))
  const layout = getSeatLayout(cinemaId, screenNumber)
  return c.json(layout)
})

app.get("/api/tickets", (c) => {
  const format = c.req.query("format") as ScreenFormat | undefined
  const types = ticketTypes
  if (format) {
    const surcharge = calculatePrice(format, "general") / calculatePrice("2D", "general")
    return c.json({
      ticketTypes: types.map(t => ({ ...t, price: Math.round(t.price * surcharge * 100) / 100 })),
      ticketPackages,
    })
  }
  return c.json({ ticketTypes: types, ticketPackages })
})

app.get("/api/concessions", (c) => {
  const category = c.req.query("category")
  let cats = concessionCategories
  if (category) cats = cats.filter(c => c.id === category)
  return c.json({ categories: cats })
})

// Pipeline management endpoints
app.get("/api/voice/config", async (c) => {
  try {
    const pipeline = await getPipeline();

    return c.json({
      tts: {
        provider: pipeline.config.tts.name,
        voices: pipeline.config.tts.listVoices(),
        ready: pipeline.config.tts.isReady(),
      },
      stt: {
        provider: pipeline.config.stt.name,
        languages: pipeline.config.stt.supportedLanguages,
        ready: pipeline.config.stt.isReady(),
      },
    });
  } catch (error) {
    console.error("Config error:", error);
    return c.json({ error: "Error getting pipeline config" }, 500);
  }
});

app.get("/api/voice/voices", async (c) => {
  try {
    const pipeline = await getPipeline();
    const ttsVoices = pipeline.config.tts.listVoices();
    const voicesInfo = ttsVoices.map((voiceId: string) =>
      pipeline.config.tts.getVoiceInfo(voiceId),
    );

    return c.json({
      provider: pipeline.config.tts.name,
      voices: voicesInfo,
    });
  } catch (error) {
    console.error("Voices error:", error);
    return c.json({ error: "Error getting voices" }, 500);
  }
});

// TTS endpoint (text → audio)
app.post("/api/tts", async (c) => {
  try {
    const body = await c.req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return c.json({ error: "Text is required" }, 400);
    }

    const cleanText = cleanForTTS(text);
    const pipeline = await getPipeline();
    const result = await pipeline.config.tts.synthesize(cleanText);
    const audioBase64 = result.audio.toString("base64");

    return c.json({ audio: audioBase64, format: result.metadata.format });
  } catch (error) {
    console.error("TTS error:", error);
    return c.json({ error: "Error synthesizing speech" }, 500);
  }
});

// Generate LiveKit token
app.post("/api/voice/token", async (c) => {
  try {
    const body = await c.req.json();
    const { name } = body;

    if (!name) {
      return c.json({ error: "Name is required" }, 400);
    }

    const livekitApiKey = process.env.LIVEKIT_API_KEY;
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitApiKey || !livekitApiSecret) {
      console.error("LiveKit credentials not configured");
      return c.json({ error: "LiveKit credentials not configured" }, 500);
    }

    const at = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: name,
    });

    at.addGrant({ roomJoin: true, room: "cinechan-voice" });

    const token = await at.toJwt();

    return c.json({ token });
  } catch (error) {
    console.error("Token generation error:", error);
    return c.json({ error: "Error generating token" }, 500);
  }
});

export type AppType = typeof app;

console.log("🎬 Cinechan Agent server corriendo en puerto", PORT);
console.log("📡 Endpoints:");
console.log("   POST /api/chat      - Chat con IA");
console.log("   POST /api/tts       - Text-to-Speech");
console.log("   POST /api/voice     - Voice pipeline (STT→LLM→TTS)");
console.log("   GET  /api/movies    - Películas (filtros: city, format, language, isPremiere, genre)");
console.log("   GET  /api/showtimes - Horarios (filtros: movieId, cinemaId, date, format, language)");
console.log("   GET  /api/cinemas   - Cines (filtro: city)");
console.log("   GET  /api/promotions- Promociones (filtros: type, bankBin)");
console.log("   GET  /api/tickets   - Tipos de boleto (filtro: format)");
console.log("   GET  /api/concessions- Confitería (filtro: category)");
console.log("   GET  /api/seats/:cinemaId/:screenNumber - Mapa de asientos");
console.log("   GET  /api/voice/config - Config del pipeline");
console.log("   GET  /api/voice/voices - Voces disponibles");

serve({ port: PORT, fetch: app.fetch }, (info) => {
  console.log(`\n✅ Server listening on port ${info.port}...`);
  console.log(`   🎵 Voice pipeline ready to process audio`);
});
