import { TTSFactory } from "../core/factory/TTSFactory.js";
import { STTFactory } from "../core/factory/STTFactory.js";
import { EdgeTTS } from "../providers/edge-tts/EdgeTTS.js";
import { WhisperSTT } from "../providers/whisper/WhisperSTT.js";

/**
 * Initialize all TTS and STT providers on demand
 * This function registers all available providers with their factories
 */
export async function initializeProvidersIfNeeded() {
  const registeredTTS = TTSFactory.getSupportedProviders();
  const registeredSTT = STTFactory.getSupportedProviders();

  if (registeredTTS.length === 0 || registeredSTT.length === 0) {
    console.log("🔧 Initializing providers...");
    TTSFactory.register("edgetts", EdgeTTS);
    STTFactory.register("whisper", WhisperSTT);
    console.log("✅ Providers initialized");
    console.log("   TTS Providers:", TTSFactory.getSupportedProviders());
    console.log("   STT Providers:", STTFactory.getSupportedProviders());
  } else {
    console.log("✅ Providers already initialized");
    console.log("   TTS Providers:", registeredTTS);
    console.log("   STT Providers:", registeredSTT);
  }
}
