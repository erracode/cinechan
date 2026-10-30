import { spawn, execSync } from "node:child_process";
import { writeFile, unlink, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type {
  TTSProvider,
  TTSConfig,
  TTSResult,
  VoiceInfo,
} from "../../core/interfaces/ITTS.js";

const EDGE_VOICES: Record<string, { name: string; gender: string; locale: string }> = {
  "es-VE-PaolaNeural": { name: "Paola", gender: "female", locale: "es-VE" },
  "es-VE-SebastianNeural": { name: "Sebastián", gender: "male", locale: "es-VE" },
  "es-MX-DaliaNeural": { name: "Dalia", gender: "female", locale: "es-MX" },
  "es-MX-JorgeNeural": { name: "Jorge", gender: "male", locale: "es-MX" },
  "es-ES-ElviraNeural": { name: "Elvira", gender: "female", locale: "es-ES" },
  "es-ES-AlvaroNeural": { name: "Álvaro", gender: "male", locale: "es-ES" },
  "es-ES-XimenaNeural": { name: "Ximena", gender: "female", locale: "es-ES" },
  "es-AR-ElenaNeural": { name: "Elena", gender: "female", locale: "es-AR" },
  "es-CO-SalomeNeural": { name: "Salomé", gender: "female", locale: "es-CO" },
  "es-CL-CatalinaNeural": { name: "Catalina", gender: "female", locale: "es-CL" },
  "en-US-AriaNeural": { name: "Aria", gender: "female", locale: "en-US" },
  "en-US-JennyNeural": { name: "Jenny", gender: "female", locale: "en-US" },
  "en-US-EmmaMultilingualNeural": { name: "Emma", gender: "female", locale: "en-US" },
  "en-GB-SoniaNeural": { name: "Sonia", gender: "female", locale: "en-GB" },
};

export class EdgeTTS implements TTSProvider {
  readonly name = "edgetts";
  readonly supportedLanguages = ["es", "en", "fr", "de", "it", "pt", "ja", "ko", "zh", "ar", "hi", "nl"];
  readonly supportedVoices = Object.keys(EDGE_VOICES);

  private config: TTSConfig = {};
  private ready = false;

  async initialize(config: TTSConfig): Promise<void> {
    this.config = {
      voice: config.voice || "es-VE-PaolaNeural",
      speed: config.speed || 1.0,
      ...config,
    };

    try {
      execSync("edge-tts --version", { stdio: "pipe", timeout: 10000 });
      this.ready = true;
    } catch {
      throw new Error("edge-tts not found. Install with: pip install edge-tts");
    }
  }

  async synthesize(text: string, config?: Partial<TTSConfig>): Promise<TTSResult> {
    if (!this.ready) {
      throw new Error("EdgeTTS not initialized");
    }

    const mergedConfig = { ...this.config, ...config };
    const voice = (mergedConfig.voice as string) || "es-VE-PaolaNeural";
    const speed = mergedConfig.speed || 1.0;
    const ratePercent = Math.round((speed - 1) * 100);
    const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

    const textFile = join(tmpdir(), `${randomUUID()}.txt`);
    const outputFile = join(tmpdir(), `${randomUUID()}.wav`);

    try {
      await writeFile(textFile, text, "utf-8");

      await new Promise<void>((resolve, reject) => {
        const proc = spawn("edge-tts", [
          "-v", voice,
          "-f", textFile,
          "--write-media", outputFile,
          "--rate", rateStr,
        ], { stdio: ["ignore", "pipe", "pipe"] });

        let stderr = "";
        proc.stderr!.on("data", (d: Buffer) => { stderr += d.toString(); });

        proc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`edge-tts exited ${code}: ${stderr}`));
        });
        proc.on("error", reject);
      });

      const audio = await readFile(outputFile);

      return {
        audio,
        metadata: {
          format: "wav",
          sampleRate: 24000,
          channels: 1,
        },
      };
    } finally {
      await unlink(textFile).catch(() => {});
      await unlink(outputFile).catch(() => {});
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  listVoices(): string[] {
    return this.supportedVoices;
  }

  getVoiceInfo(voiceId: string): VoiceInfo | undefined {
    const v = EDGE_VOICES[voiceId];
    if (!v) return;
    return {
      id: voiceId,
      name: v.name,
      language: v.locale,
      gender: v.gender as any,
      description: `${v.name} (${v.locale}) - Microsoft Edge Neural TTS`,
    };
  }
}
