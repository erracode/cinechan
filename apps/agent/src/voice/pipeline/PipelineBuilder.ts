import { VoicePipeline } from "./VoicePipeline.js";
import { TTSFactory } from "../core/factory/TTSFactory.js";
import { STTFactory } from "../core/factory/STTFactory.js";
import { getVoiceConfig } from "../config/voice.config.js";
import type { VoiceConfig } from "../config/voice.config.js";

export class PipelineBuilder {
  static async build(config?: VoiceConfig): Promise<VoicePipeline> {
    const voiceConfig = config || getVoiceConfig();

    console.log("🔧 Building voice pipeline...");
    console.log(`  TTS Provider: ${voiceConfig.tts.provider}`);
    console.log(`  STT Provider: ${voiceConfig.stt.provider}`);

    const tts = await TTSFactory.create(
      voiceConfig.tts.provider,
      voiceConfig.tts.providers[voiceConfig.tts.provider] || {},
    );

    const stt = await STTFactory.create(
      voiceConfig.stt.provider,
      voiceConfig.stt.providers[voiceConfig.stt.provider] || {},
    );

    console.log("✅ Pipeline built successfully");

    return new VoicePipeline({ stt, tts });
  }
}
