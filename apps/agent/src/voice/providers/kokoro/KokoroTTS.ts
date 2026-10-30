import { KokoroTTS as KokoroLib } from "kokoro-js";
import type {
  TTSProvider,
  TTSConfig,
  TTSResult,
  VoiceInfo,
} from "../../core/interfaces/ITTS.js";
import type { VoiceInfo as VoiceInfoType } from "../../core/interfaces/types.js";
import { KOKORO_VOICES } from "./voices.js";

export class KokoroTTS implements TTSProvider {
  readonly name = "kokoro";
  readonly supportedLanguages = ["en"];
  readonly supportedVoices = Object.keys(KOKORO_VOICES);

  private model: KokoroLib | null = null;
  private config: TTSConfig = {};

  async initialize(config: TTSConfig): Promise<void> {
    this.config = {
      voice: config.voice || "af_heart",
      speed: config.speed || 1.0,
      dtype: config.dtype || "q8",
      ...config,
    };

    try {
      console.log("🎤 Loading Kokoro TTS model...");

      // Configurar para usar modelos locales si están disponibles
      const KokoroLibModule = await import("kokoro-js");

      this.model = await KokoroLibModule.KokoroTTS.from_pretrained(
        "onnx-community/Kokoro-82M-ONNX",
        {
          dtype: this.config.dtype as any,
          device: "cpu",
        },
      );

      console.log("✅ Kokoro TTS model loaded");
    } catch (error) {
      console.error("❌ Error loading Kokoro:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async synthesize(
    text: string,
    config?: Partial<TTSConfig>,
  ): Promise<TTSResult> {
    if (!this.model) {
      throw new Error("Kokoro TTS not initialized");
    }

    const mergedConfig = { ...this.config, ...config };

    console.log(`🔊 Generating audio with voice: ${mergedConfig.voice}`);
    const rawAudio = await this.model.generate(text, {
      voice: mergedConfig.voice as any,
      speed: mergedConfig.speed || 1.0,
    });

    const wavBuffer = rawAudio.toWav();

    return {
      audio: Buffer.from(wavBuffer),
      metadata: {
        format: "wav",
        sampleRate: 24000,
        channels: 1,
      },
    };
  }

  isReady(): boolean {
    return this.model !== null;
  }

  listVoices(): string[] {
    return this.supportedVoices;
  }

  getVoiceInfo(voiceId: string): VoiceInfoType | undefined {
    return KOKORO_VOICES[voiceId];
  }
}
