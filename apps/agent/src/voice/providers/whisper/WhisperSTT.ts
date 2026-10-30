import { pipeline, env } from "@huggingface/transformers";
import type {
  STTProvider,
  STTConfig,
  STTResult,
} from "../../core/interfaces/ISTT.js";

env.allowLocalModels = true;

export class WhisperSTT implements STTProvider {
  readonly name = "whisper";
  readonly supportedLanguages = [
    "en",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "ru",
    "zh",
    "ja",
    "ko",
  ];

  private pipeline: any = null;
  private config: STTConfig = {};

  async initialize(config: STTConfig): Promise<void> {
    this.config = {
      language: config.language || "en",
      model: config.model || "Xenova/whisper-tiny",
      ...config,
    };

    try {
      console.log("🎤 Loading Whisper STT model...");
      this.pipeline = await pipeline(
        "automatic-speech-recognition",
        this.config.model as string,
      );
      console.log("✅ Whisper STT model loaded");
    } catch (error) {
      console.error("❌ Error loading Whisper:", error);
      throw error;
    }
  }

  async transcribe(
    audio: Buffer,
    config?: Partial<STTConfig>,
  ): Promise<STTResult> {
    if (!this.pipeline) {
      throw new Error("Whisper STT not initialized");
    }

    const mergedConfig = { ...this.config, ...config };

    // Convert Buffer to Float32Array
    const float32Array = new Float32Array(
      audio.buffer,
      audio.byteOffset,
      audio.byteLength / 4,
    );

    const result = await this.pipeline(float32Array, {
      language: mergedConfig.language,
      task: "transcribe",
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    const text =
      Array.isArray(result) && result.length > 0 ? result[0]?.text || "" : "";

    return {
      text,
      language: mergedConfig.language,
    };
  }

  isReady(): boolean {
    return this.pipeline !== null;
  }
}
