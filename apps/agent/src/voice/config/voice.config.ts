import type { TTSConfig, STTConfig } from "../core/interfaces/index.js";

export interface VoiceConfig {
  tts: {
    provider: "edgetts";
    defaultVoice: string;
    defaultLanguage: string;
    providers: {
      edgetts?: TTSConfig;
      kokoro?: TTSConfig;
    };
  };

  stt: {
    provider: "whisper";
    defaultLanguage: string;
    providers: {
      whisper?: STTConfig;
    };
  };
}

export const defaultVoiceConfig: VoiceConfig = {
  tts: {
    provider: "edgetts",
    defaultVoice: "es-VE-PaolaNeural",
    defaultLanguage: "es",
    providers: {
      edgetts: {
        voice: "es-VE-PaolaNeural",
        speed: 1.0,
      },
    },
  },

  stt: {
    provider: "whisper",
    defaultLanguage: "es",
    providers: {
      whisper: {
        model: "Xenova/whisper-tiny",
      },
    },
  },
};

export const getVoiceConfig = (): VoiceConfig => {
  const provider = process.env.TTS_PROVIDER || "edgetts";
  const language = process.env.LANGUAGE || "es";

  return {
    tts: {
      provider: provider as any,
      defaultVoice: process.env.DEFAULT_VOICE || "es-VE-PaolaNeural",
      defaultLanguage: language,
      providers: {
        edgetts: {
          voice: process.env.EDGETTS_VOICE || "es-VE-PaolaNeural",
          speed: parseFloat(process.env.EDGETTS_SPEED || "1.0"),
        },
      },
    },

    stt: {
      provider: "whisper",
      defaultLanguage: language,
      providers: {
        whisper: {
          model: process.env.WHISPER_MODEL || "Xenova/whisper-tiny",
        },
      },
    },
  };
};
