import type { TTSProvider } from "../core/interfaces/ITTS.js";
import type { STTProvider } from "../core/interfaces/ISTT.js";
import { chat } from "../../llm/index.js";

export interface VoicePipelineConfig {
  stt: STTProvider;
  tts: TTSProvider;
}

export class VoicePipeline {
  constructor(public config: VoicePipelineConfig) {}

  async process(audioBuffer: Buffer): Promise<{ audio: Buffer; text: string }> {
    try {
      console.log("🎤 Transcribing audio...");
      const sttResult = await this.config.stt.transcribe(audioBuffer);
      console.log("📝 Text recognized:", sttResult.text);

      console.log("🤖 Generating response...");
      const response = await chat(sttResult.text);
      if (!response) {
        throw new Error("LLM returned empty response");
      }
      console.log("💬 Response generated:", response);

      const cleanText = response
        .replace(/[*_~`#>|]/g, "")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\p{Extended_Pictographic}/gu, "")

      console.log("🔊 Synthesizing speech...");
      const ttsResult = await this.config.tts.synthesize(cleanText);
      console.log("✅ Audio generated");

      return { audio: ttsResult.audio, text: response };
    } catch (error) {
      console.error("Error in voice pipeline:", error);
      throw error;
    }
  }

  async processText(text: string): Promise<{ audio: Buffer; text: string }> {
    try {
      console.log("🤖 Generating response...");
      const response = await chat(text);
      if (!response) {
        throw new Error("LLM returned empty response");
      }
      console.log("💬 Response generated:", response);

      const cleanText = response
        .replace(/[*_~`#>|]/g, "")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\p{Extended_Pictographic}/gu, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      console.log("🔊 Synthesizing speech...");
      const ttsResult = await this.config.tts.synthesize(cleanText);
      console.log("✅ Audio generated");

      return { audio: ttsResult.audio, text: response };
    } catch (error) {
      console.error("❌ Error in voice pipeline:", error);
      throw error;
    }
  }
}
