# Migración de Kokoro a Qwen3-TTS

Esta guía explica cómo migrar el sistema de TTS de Kokoro a Qwen3-TTS manteniendo la misma arquitectura.

## 📋 Overview

Qwen3-TTS es un proveedor más avanzado con:

- **Soporte multilingüe** (incluyendo español)
- **Voice design** con instrucciones naturales
- **Zero-shot voice clone** (3 segundos)
- **Streaming** con 97ms de latencia
- **Voice design + clone workflow**

## 🎯 Preparativos

### 1. Instalar Dependencias

```bash
cd apps/agent
npm install qwen-tts
```

### 2. Verificar Configuración Actual

```bash
# .env actual
TTS_PROVIDER=kokoro
LANGUAGE=en
DEFAULT_VOICE=af_heart
```

## 🚀 Paso 1: Crear Implementación de Qwen3

```typescript
// src/voice/providers/qwen3/Qwen3TTS.ts
import { Qwen3TTSModel } from "qwen-tts";
import type {
  TTSProvider,
  TTSConfig,
  TTSResult,
  VoiceInfo,
} from "../../core/interfaces/ITTS.js";
import { QWEN3_VOICES } from "./voices.js";

export class Qwen3TTS implements TTSProvider {
  readonly name = "qwen3";
  readonly supportedLanguages = [
    "zh",
    "en",
    "ja",
    "ko",
    "de",
    "fr",
    "ru",
    "pt",
    "es",
    "it",
  ];
  readonly supportedVoices = Object.keys(QWEN3_VOICES);

  private model: Qwen3TTSModel | null = null;
  private config: TTSConfig = {};

  async initialize(config: TTSConfig): Promise<void> {
    this.config = {
      voice: config.voice || "Vivian",
      speed: config.speed || 1.0,
      language: config.language || "en",
      model: config.model || "1.7B",
      ...config,
    };

    try {
      console.log("🎤 Loading Qwen3-TTS model...");
      this.model = await Qwen3TTSModel.from_pretrained(
        `Qwen/Qwen3-TTS-${this.config.model}-CustomVoice`,
        {
          device_map: "cuda:0",
          dtype: "bfloat16",
          attn_implementation: "flash_attention_2",
        },
      );
      console.log("✅ Qwen3-TTS model loaded");
    } catch (error) {
      console.error("❌ Error loading Qwen3-TTS:", error);
      throw error;
    }
  }

  async synthesize(
    text: string,
    config?: Partial<TTSConfig>,
  ): Promise<TTSResult> {
    if (!this.model) {
      throw new Error("Qwen3-TTS not initialized");
    }

    const mergedConfig = { ...this.config, ...config };

    console.log(`🔊 Generating audio with voice: ${mergedConfig.voice}`);
    const rawAudio = await this.model.generate_custom_voice(text, {
      language: mergedConfig.language,
      speaker: mergedConfig.voice,
      instruct: config?.instruct, // Para voice design
    });

    return {
      audio: Buffer.from(rawAudio[0]),
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

  getVoiceInfo(voiceId: string): VoiceInfo | undefined {
    return QWEN3_VOICES[voiceId];
  }
}
```

## 🎭 Paso 2: Crear Lista de Voces Qwen3

```typescript
// src/voice/providers/qwen3/voices.ts
export const QWEN3_VOICES: Record<string, VoiceInfo> = {
  Vivian: {
    id: "Vivian",
    name: "Vivian",
    language: "zh",
    gender: "female",
    description: "Bright, slightly edgy young female voice",
  },
  Serena: {
    id: "Serena",
    name: "Serena",
    language: "zh",
    gender: "female",
    description: "Warm, gentle young female voice",
  },
  Uncle_Fu: {
    id: "Uncle_Fu",
    name: "Uncle Fu",
    language: "zh",
    gender: "male",
    description: "Seasoned male voice with a low, mellow timbre",
  },
  Dylan: {
    id: "Dylan",
    name: "Dylan",
    language: "zh",
    gender: "male",
    description: "Youthful Beijing male voice with a clear, natural timbre",
  },
  Eric: {
    id: "Eric",
    name: "Eric",
    language: "zh",
    gender: "male",
    description: "Lively Chengdu male voice with a slightly husky brightness",
  },
  Ryan: {
    id: "Ryan",
    name: "Ryan",
    language: "en",
    gender: "male",
    description: "Dynamic male voice with strong rhythmic drive",
  },
  Aiden: {
    id: "Aiden",
    name: "Aiden",
    language: "en",
    gender: "male",
    description: "Sunny American male voice with a clear midrange",
  },
  Ono_Anna: {
    id: "Ono_Anna",
    name: "Ono Anna",
    language: "ja",
    gender: "female",
    description: "Playful Japanese female voice with a light, nimble timbre",
  },
  Sohee: {
    id: "Sohee",
    name: "Sohee",
    language: "ko",
    gender: "female",
    description: "Warm Korean female voice with rich emotion",
  },
};
```

## 🔌 Paso 3: Crear Export

```typescript
// src/voice/providers/qwen3/index.ts
export * from "./Qwen3TTS.js";
export * from "./voices.js";
```

## 🏭 Paso 4: Registrar en Factory

```typescript
// src/voice/core/factory/TTSFactory.ts
import { Qwen3TTS } from "../../providers/qwen3/Qwen3TTS.js";

TTSFactory.register("qwen3", Qwen3TTS);
```

## ⚙️ Paso 5: Agregar a Configuración

```typescript
// src/voice/config/voice.config.ts
export const defaultVoiceConfig: VoiceConfig = {
  tts: {
    provider: "qwen3", // ← Cambiar aquí
    defaultVoice: "Vivian",
    defaultLanguage: "zh",
    providers: {
      kokoro: {
        voice: "af_heart",
        speed: 1.0,
        dtype: "q8",
      },
      qwen3: {
        model: "1.7B",
        voice: "Vivian",
        streaming: true,
      },
    },
  },

  stt: {
    provider: "whisper",
    defaultLanguage: "zh",
    providers: {
      whisper: {
        model: "Xenova/whisper-tiny",
      },
    },
  },
};
```

## 🌍 Paso 6: Actualizar .env

```bash
# .env
TTS_PROVIDER=qwen3
LANGUAGE=zh
DEFAULT_VOICE=Vivian

# Qwen3 Configuration
QWEN3_MODEL=1.7B
QWEN3_VOICE=Vivian
QWEN3_STREAMING=true
```

## 🔄 Paso 7: Migrar Voces Personalizadas

### Para Voces Existentes (Kokoro → Qwen3)

```typescript
// Mapeo de voces Kokoro a Qwen3
const VOICE_MIGRATION_MAP: Record<string, string> = {
  af_bella: "Vivian", // Female, energetic
  af_heart: "Serena", // Female, warm
  af_jessica: "Ono_Anna", // Female, playful
  am_michael: "Ryan", // Male, dynamic
  bf_emma: "Aiden", // Male, sunny
};

// En tu código
const voiceId = voiceId || "Vivian";
const qwen3Voice = VOICE_MIGRATION_MAP[voiceId] || voiceId;
```

### Para Voice Design

```typescript
// Usar voice design para personalidad
const voiceDesignConfig = {
  instruct:
    "Female, 25 years old, cheerful and energetic voice, perfect for customer service",
};

const result = await tts.synthesize(text, { ...voiceDesignConfig });
```

### Para Voice Clone

```typescript
// Zero-shot voice clone con 3 segundos
const refAudio = "reference_audio.wav";
const refText = "Reference text for voice";

const clonePrompt = await model.create_voice_clone_prompt(refAudio, refText);

const result = await model.generate_voice_clone(text, {
  language: "zh",
  voice_clone_prompt: clonePrompt,
});
```

## 🧪 Paso 8: Probar

### Test Unitario

```typescript
// tests/unit/voice/providers/qwen3.test.ts
import { Qwen3TTS } from "../../../src/voice/providers/qwen3/Qwen3TTS.js";

describe("Qwen3TTS", () => {
  it("should initialize provider", async () => {
    const tts = new Qwen3TTS();
    await tts.initialize({ voice: "Vivian", model: "1.7B" });
    expect(tts.isReady()).toBe(true);
  });

  it("should synthesize multilingual text", async () => {
    const tts = new Qwen3TTS();
    await tts.initialize({ voice: "Vivian", model: "1.7B" });

    // Chinese
    const cnResult = await tts.synthesize("你好，世界！");
    expect(cnResult.audio).toBeInstanceOf(Buffer);

    // English
    const enResult = await tts.synthesize("Hello world!");
    expect(enResult.audio).toBeInstanceOf(Buffer);

    // Spanish
    const esResult = await tts.synthesize("¡Hola mundo!");
    expect(esResult.audio).toBeInstanceOf(Buffer);
  });

  it("should support voice design", async () => {
    const tts = new Qwen3TTS();
    await tts.initialize({ voice: "Vivian", model: "1.7B" });

    const result = await tts.synthesize("Hello there!", {
      instruct: "Use a cheerful, energetic female voice",
    });

    expect(result.audio).toBeInstanceOf(Buffer);
  });
});
```

### Test de Integración

```typescript
// tests/integration/voice-pipeline-qwen3.test.ts
describe("Voice Pipeline with Qwen3-TTS", () => {
  it("should process complete pipeline", async () => {
    const pipeline = await PipelineBuilder.build();
    const audio = await pipeline.process(audioBuffer);

    expect(audio).toBeInstanceOf(Buffer);
  });

  it("should handle multilingual input", async () => {
    const pipeline = await PipelineBuilder.build();

    // Test with Chinese input
    const cnAudio = await pipeline.process(chineseAudioBuffer);
    expect(cnAudio).toBeInstanceOf(Buffer);

    // Test with English input
    const enAudio = await pipeline.process(englishAudioBuffer);
    expect(enAudio).toBeInstanceOf(Buffer);
  });
});
```

## 📊 Comparativa de Características

| Característica          | Kokoro         | Qwen3-TTS         |
| ----------------------- | -------------- | ----------------- |
| **Soporte Multilingüe** | ❌ Solo inglés | ✅ 10 idiomas     |
| **Voice Design**        | ❌ No          | ✅ Sí             |
| **Voice Clone**         | ❌ No          | ✅ Zero-shot (3s) |
| **Streaming**           | ❌ No          | ✅ 97ms latency   |
| **Latencia**            | ~100ms         | ~97ms             |
| **Calidad**             | Buena          | Excelente         |
| **GPU Requerida**       | CPU            | GPU (recomendado) |

## 🎯 Best Practices

### 1. Mantener Configuración Flexible

```typescript
// Configuración por defecto
const config = getVoiceConfig();

// Opciones para cambiar
const customConfig: VoiceConfig = {
  ...config,
  tts: {
    ...config.tts,
    provider: "qwen3",
    defaultVoice: "Vivian",
    providers: {
      qwen3: {
        ...config.tts.providers.qwen3,
        streaming: true,
      },
    },
  },
};

const pipeline = await PipelineBuilder.build(customConfig);
```

### 2. Usar Voice Design para Personalidad

```typescript
// Personalidad de Cinechan con Qwen3
const voiceDesign = {
  instruct:
    "Female, 25 years old, enthusiastic cinema assistant, friendly and helpful, uses emojis like 🎬🍿",
};

const response = await chat(userMessage);
const audio = await tts.synthesize(response, {
  instruct: voiceDesign.instruct,
});
```

### 3. Implementar Fallback

```typescript
// Fallback a Kokoro si Qwen3 falla
try {
  const tts = await TTSFactory.create("qwen3", config);
  return tts.synthesize(text);
} catch (error) {
  console.warn("Qwen3-TTS failed, falling back to Kokoro");
  const fallbackTTS = await TTSFactory.create("kokoro", fallbackConfig);
  return fallbackTTS.synthesize(text);
}
```

## ✅ Checklist de Migración

- [ ] Instalar `qwen-tts`
- [ ] Crear `Qwen3TTS.ts` implementation
- [ ] Crear `voices.ts` con mapeo
- [ ] Registrar en `TTSFactory`
- [ ] Actualizar `voice.config.ts`
- [ ] Actualizar `.env`
- [ ] Migrar mapeo de voces
- [ ] Implementar voice design
- [ ] Agregar tests unitarios
- [ ] Agregar tests de integración
- [ ] Probar en staging
- [ ] Documentar cambios
- [ ] Actualizar documentación

## 🚀 Habilitar Qwen3-TTS

```bash
# En .env
TTS_PROVIDER=qwen3
LANGUAGE=zh
DEFAULT_VOICE=Vivian

# O en código
import { getVoiceConfig } from './voice/config/voice.config.js';

const config = getVoiceConfig();
config.tts.provider = 'qwen3';
config.tts.defaultVoice = 'Vivian';

const pipeline = await PipelineBuilder.build(config);
```

## 📚 Recursos Adicionales

- [Qwen3-TTS Documentation](https://github.com/QwenLM/Qwen3-TTS)
- [Voice Design Guide](https://qwen.ai/blog?id=qwen3tts-0115)
- [Voice Clone Guide](https://github.com/QwenLM/Qwen3-TTS#voice-clone)
- [Arquitectura del Sistema](./ARCHITECTURE.md)
