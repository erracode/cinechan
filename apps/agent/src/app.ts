import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { chat, createRestBinding, DEFAULT_MODEL, type AiBinding } from "./llm/index.js";
import {
  movies, cinemas, promotions,
  getSeatLayout, generateShowtimes,
  ticketTypes, ticketPackages, calculatePrice,
  concessionCategories,
} from "./mock/cinemark-data.js";
import type { ScreenFormat, Language } from "@cinechan/shared";

const TTS_MODEL = "@cf/deepgram/aura-2-es";
const DEFAULT_VOICE = "carina";

export interface Env {
  AI?: AiBinding;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  WORKERS_AI_MODEL?: string;
  TTS_VOICE?: string;
}

/** Strip markdown/emoji so the avatar does not read punctuation aloud. */
export function cleanForTTS(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[movie:[^\]]*\]/g, "")
    .replace(/[*_~`#>|]/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function createApp(env: Env = {}) {
  const app = new Hono();

  app.use("/*", cors({ origin: "*", credentials: true }));

  /** Workers binding in production, REST adapter for local dev. */
  function resolveAi(): AiBinding {
    if (env.AI) return env.AI;

    const accountId = env.CLOUDFLARE_ACCOUNT_ID ?? process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = env.CLOUDFLARE_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !token) {
      throw new Error(
        "Workers AI is not configured. Bind `AI` in wrangler, or set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN for local dev.",
      );
    }
    return createRestBinding(accountId, token);
  }

  function resolveModel(): string {
    return env.WORKERS_AI_MODEL ?? process.env.WORKERS_AI_MODEL ?? DEFAULT_MODEL;
  }

  app.get("/api/health", (c) => c.json({ ok: true, model: resolveModel() }));

  app.post("/api/chat", async (c) => {
    try {
      const { message } = await c.req.json();

      if (!message || typeof message !== "string") {
        return c.json({ error: "Message is required" }, 400);
      }

      const response = (await chat(message, resolveAi(), resolveModel())) ||
        "No pude generar una respuesta.";
      return c.json({ response, audio_text: cleanForTTS(response) });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Chat error:", msg);
      return c.json({ error: "Error processing message", detail: msg }, 500);
    }
  });

  // ─── TTS (Workers AI / Deepgram Aura-2 ES) ────────────────────

  app.post("/api/tts", async (c) => {
    try {
      const { text } = await c.req.json();

      if (!text || typeof text !== "string") {
        return c.json({ error: "Text is required" }, 400);
      }

      const cleanText = cleanForTTS(text);
      if (!cleanText) {
        return c.json({ error: "Nothing to synthesize" }, 400);
      }

      const audio: any = await resolveAi().run(TTS_MODEL, {
        text: cleanText.slice(0, 2000),
        speaker: env.TTS_VOICE ?? process.env.TTS_VOICE ?? DEFAULT_VOICE,
        encoding: "mp3",
      });

      const buffer = audio instanceof ArrayBuffer
        ? Buffer.from(audio)
        : audio?.audio
          ? Buffer.from(audio.audio)
          : Buffer.from(JSON.stringify(audio ?? ""));

      return c.json({ audio: buffer.toString("base64"), format: "mp3" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("TTS error:", msg);
      return c.json({ error: "Error synthesizing speech", detail: msg }, 500);
    }
  });

  // ─── Catalogue ────────────────────────────────────────────────

  app.get("/api/movies", (c) => {
    const city = c.req.query("city");
    const format = c.req.query("format") as ScreenFormat | undefined;
    const language = c.req.query("language") as Language | undefined;
    const isPremiere = c.req.query("isPremiere");
    const genre = c.req.query("genre");

    let filtered = movies;
    if (city) {
      const ids = new Set(
        cinemas.filter((ci) => ci.city.toLowerCase() === city.toLowerCase()).map((ci) => ci.id),
      );
      const playing = new Set(
        generateShowtimes().filter((s) => ids.has(s.cinemaId)).map((s) => s.movieId),
      );
      filtered = filtered.filter((m) => playing.has(m.id));
    }
    if (format) filtered = filtered.filter((m) => m.formats.includes(format));
    if (language) filtered = filtered.filter((m) => m.languages.includes(language));
    if (isPremiere) filtered = filtered.filter((m) => m.isPremiere === (isPremiere === "true"));
    if (genre) filtered = filtered.filter((m) => m.genre.toLowerCase() === genre.toLowerCase());

    return c.json({
      movies: filtered.map((m) => ({
        id: m.id, title: m.title, rating: m.rating, genre: m.genre,
        duration: m.duration, formats: m.formats, languages: m.languages,
        isPremiere: m.isPremiere, isReRelease: m.isReRelease,
        releaseDate: m.releaseDate, posterUrl: m.posterUrl,
        director: m.director, actors: m.actors.slice(0, 3),
      })),
    });
  });

  app.get("/api/showtimes", (c) => {
    const results = generateShowtimes(
      c.req.query("movieId"),
      c.req.query("cinemaId"),
      c.req.query("date"),
      c.req.query("format") as ScreenFormat | undefined,
      c.req.query("language") as Language | undefined,
    );

    return c.json({
      showtimes: results.map((s) => {
        const movie = movies.find((m) => m.id === s.movieId);
        const cinema = cinemas.find((ci) => ci.id === s.cinemaId);
        return { ...s, movieTitle: movie?.title, cinemaName: cinema?.name };
      }),
    });
  });

  app.get("/api/cinemas", (c) => {
    const city = c.req.query("city");
    const filtered = city
      ? cinemas.filter((ci) => ci.city.toLowerCase() === city.toLowerCase())
      : cinemas;
    return c.json({ cinemas: filtered });
  });

  app.get("/api/promotions", (c) => {
    const type = c.req.query("type");
    const filtered = type ? promotions.filter((p) => p.type === type) : promotions;
    return c.json({ promotions: filtered });
  });

  app.get("/api/movies/:movieId", (c) => {
    const movie = movies.find((m) => m.id === c.req.param("movieId"));
    if (!movie) return c.json({ error: "Película no encontrada" }, 404);
    return c.json(movie);
  });

  app.get("/api/seats/:cinemaId/:screenNumber", (c) => {
    const layout = getSeatLayout(
      c.req.param("cinemaId"),
      Number(c.req.param("screenNumber")),
    );
    return c.json(layout);
  });

  app.get("/api/tickets", (c) => {
    const format = c.req.query("format") as ScreenFormat | undefined;
    if (format) {
      const surcharge = calculatePrice(format, "general") / calculatePrice("2D", "general");
      return c.json({
        ticketTypes: ticketTypes.map((t) => ({
          ...t,
          price: Math.round(t.price * surcharge * 100) / 100,
        })),
        ticketPackages,
      });
    }
    return c.json({ ticketTypes, ticketPackages });
  });

  app.get("/api/concessions", (c) => {
    const category = c.req.query("category");
    const cats = category
      ? concessionCategories.filter((ci) => ci.id === category)
      : concessionCategories;
    return c.json({ categories: cats });
  });

  return app;
}

export type AppType = ReturnType<typeof createApp>;
