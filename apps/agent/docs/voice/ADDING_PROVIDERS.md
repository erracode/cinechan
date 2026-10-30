# Agregar Nuevo Proveedor TTS/STT

Esta guía explica cómo agregar nuevos proveedores de Text-to-Speech (TTS) o Speech-to-Text (STT) al sistema de Cinechan.

## 📋 Prerrequisitos

- TypeScript 5.8+
- Conocimiento de TypeScript interfaces
- Entendimiento de los patrones de diseño utilizados

## 🎯 Estructura de Directorio

```
src/voice/providers/
├── kokoro/          # Kokoro TTS (implementado)
├── whisper/         # Whisper STT (implementado)
└── [nuevo-proveedor]/  # Tu nuevo proveedor
    ├── [NombreProveedor]TTS.ts  # Para TTS
    ├── [NombreProveedor]Config.ts
    ├── voices.ts               # Lista de voces (solo TTS)
    └── index.ts
```

## 🚀 Paso 1: Crear Implementación

### Para TTS

```typescript
// src/voice/providers/nuevo-proveedor/NuevoTTS.ts
import type {
  TTSProvider,
  TTSConfig,
  TTSResult,
  VoiceInfo,
} from "../../core/interfaces/ITTS.js";

export class NuevoTTS implements TTSProvider {
  readonly name = "nuevo";
  readonly supportedLanguages = ["en", "es"]; // Idiomas soportados
  readonly supportedVoices = ["voice1", "voice2"]; // Voces disponibles

  private model: any = null;
  private config: TTSConfig = {};

  async initialize(config: TTSConfig): Promise<void> {
    this.config = {
      voice: config.voice || "voice1",
      speed: config.speed || 1.0,
      language: config.language || "en",
      ...config,
    };

    try {
      console.log(`🎤 Loading ${this.name} TTS model...`);
      this.model = await this.loadModel(this.config);
      console.log(`✅ ${this.name} TTS model loaded`);
    } catch (error) {
      console.error(`❌ Error loading ${this.name}:`, error);
      throw error;
    }
  }

  async synthesize(
    text: string,
    config?: Partial<TTSConfig>,
  ): Promise<TTSResult> {
    if (!this.model) {
      throw new Error(`${this.name} TTS not initialized`);
    }

    const mergedConfig = { ...this.config, ...config };

    console.log(`🔊 Generating audio with voice: ${mergedConfig.voice}`);
    const audioData = await this.generateAudio(text, mergedConfig);

    return {
      audio: audioData,
      metadata: {
        format: this.getAudioFormat(),
        sampleRate: this.getSampleRate(),
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
    return {
      id: voiceId,
      name: voiceId,
      language: "en",
      gender: "female",
      description: `Voice ${voiceId}`,
    };
  }

  // Métodos específicos del proveedor
  private async loadModel(config: TTSConfig): Promise<any> {
    throw new Error("Implement loadModel");
  }

  private async generateAudio(
    text: string,
    config: TTSConfig,
  ): Promise<Buffer> {
    throw new Error("Implement generateAudio");
  }

  private getAudioFormat(): AudioFormat {
    return "wav";
  }

  private getSampleRate(): number {
    return 24000;
  }
}
```

### Para STT

```typescript
// src/voice/providers/nuevo-proveedor/NuevoSTT.ts
import type {
  STTProvider,
  STTConfig,
  STTResult,
} from "../../core/interfaces/ISTT.js";

export class NuevoSTT implements STTProvider {
  readonly name = "nuevo";
  readonly supportedLanguages = ["en", "es"];

  private model: any = null;
  private config: STTConfig = {};

  async initialize(config: STTConfig): Promise<void> {
    this.config = {
      language: config.language || "en",
      model: config.model || "model-name",
      ...config,
    };

    try {
      console.log(`🎤 Loading ${this.name} STT model...`);
      this.model = await this.loadModel(this.config);
      console.log(`✅ ${this.name} STT model loaded`);
    } catch (error) {
      console.error(`❌ Error loading ${this.name}:`, error);
      throw error;
    }
  }

  async transcribe(
    audio: Buffer,
    config?: Partial<STTConfig>,
  ): Promise<STTResult> {
    if (!this.model) {
      throw new Error(`${this.name} STT not initialized`);
    }

    const mergedConfig = { ...this.config, ...config };

    const result = await this.transcribeAudio(audio, mergedConfig);

    return {
      text: result.text,
      language: mergedConfig.language,
      confidence: result.confidence,
    };
  }

  isReady(): boolean {
    return this.model !== null;
  }

  // Métodos específicos del proveedor
  private async loadModel(config: STTConfig): Promise<any> {
    throw new Error("Implement loadModel");
  }

  private async transcribeAudio(
    audio: Buffer,
    config: STTConfig,
  ): Promise<STTResult> {
    throw new Error("Implement transcribeAudio");
  }
}
```

## 🎭 Paso 2: Crear Lista de Voces (Solo TTS)

```typescript
// src/voice/providers/nuevo-proveedor/voices.ts
export const NUEVO_VOICES: Record<string, VoiceInfo> = {
  voice1: {
    id: "voice1",
    name: "Voice 1",
    language: "en",
    gender: "female",
    description: "First voice description",
  },
  voice2: {
    id: "voice2",
    name: "Voice 2",
    language: "en",
    gender: "male",
    description: "Second voice description",
  },
};
```

## 🔌 Paso 3: Crear Export

```typescript
// src/voice/providers/nuevo-proveedor/index.ts
export * from "./NuevoTTS.js";
export * from "./voices.js"; // Solo para TTS
```

## 🏭 Paso 4: Registrar en Factory

```typescript
// src/voice/core/factory/TTSFactory.ts (para TTS)
import { NuevoTTS } from "../../providers/nuevo-proveedor/NuevoTTS.js";

TTSFactory.register("nuevo", NuevoTTS);

// src/voice/core/factory/STTFactory.ts (para STT)
import { NuevoSTT } from "../../providers/nuevo-proveedor/NuevoSTT.js";

STTFactory.register("nuevo", NuevoSTT);
```

## ⚙️ Paso 5: Agregar a Configuración

```typescript
// src/voice/config/voice.config.ts
export interface VoiceConfig {
  tts: {
    provider: "kokoro" | "qwen3" | "elevenlabs" | "deepgram" | "nuevo"; // Agregar tu provider
    // ...
    providers: {
      // ...
      nuevo?: TTSConfig; // Agregar config específica
    };
  };
  // ...
}

export const defaultVoiceConfig: VoiceConfig = {
  tts: {
    provider: "nuevo", // Cambiar a 'nuevo' cuando quieras usarlo
    defaultVoice: "voice1",
    defaultLanguage: "en",
    providers: {
      nuevo: {
        voice: "voice1",
        speed: 1.0,
        // ... config específica
      },
    },
  },
  // ...
};
```

## 🌍 Paso 6: Agregar a .env.example

```bash
# .env.example
TTS_PROVIDER=nuevo
LANGUAGE=en
DEFAULT_VOICE=voice1

# Nuevo TTS Configuration
NUEVO_VOICE=voice1
NUEVO_SPEED=1.0
```

## 🧪 Paso 7: Escribir Tests

### Unit Tests (TTS)

```typescript
// tests/unit/voice/providers/nuevo.test.ts
import { NuevoTTS } from "../../../src/voice/providers/nuevo-proveedor/NuevoTTS.js";

describe("NuevoTTS", () => {
  it("should initialize provider", async () => {
    const tts = new NuevoTTS();
    await tts.initialize({ voice: "voice1" });
    expect(tts.isReady()).toBe(true);
  });

  it("should synthesize text to audio", async () => {
    const tts = new NuevoTTS();
    await tts.initialize({ voice: "voice1" });

    const result = await tts.synthesize("Hello world");
    expect(result.audio).toBeInstanceOf(Buffer);
    expect(result.metadata.format).toBe("wav");
    expect(result.metadata.sampleRate).toBe(24000);
  });

  it("should list available voices", () => {
    const tts = new NuevoTTS();
    const voices = tts.listVoices();
    expect(voices).toContain("voice1");
    expect(voices).toContain("voice2");
  });

  it("should get voice info", () => {
    const tts = new NuevoTTS();
    const voiceInfo = tts.getVoiceInfo("voice1");
    expect(voiceInfo).toEqual({
      id: "voice1",
      name: "Voice 1",
      language: "en",
      gender: "female",
      description: "First voice description",
    });
  });
});
```

### Unit Tests (STT)

```typescript
// tests/unit/voice/providers/nuevo-stt.test.ts
import { NuevoSTT } from "../../../src/voice/providers/nuevo-proveedor/NuevoSTT.js";

describe("NuevoSTT", () => {
  it("should initialize provider", async () => {
    const stt = new NuevoSTT();
    await stt.initialize({ language: "en" });
    expect(stt.isReady()).toBe(true);
  });

  it("should transcribe audio to text", async () => {
    const stt = new NuevoSTT();
    await stt.initialize({ language: "en" });

    const audioBuffer = Buffer.from([
      /* audio data */
    ]);
    const result = await stt.transcribe(audioBuffer);

    expect(result.text).toBeDefined();
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.language).toBe("en");
  });

  it("should support multiple languages", () => {
    const stt = new NuevoSTT();
    expect(stt.supportedLanguages).toContain("en");
    expect(stt.supportedLanguages).toContain("es");
  });
});
```

## 📚 Paso 8: Documentar

Crea documentación específica para tu proveedor:

````markdown
# Nombre del Proveedor

## Features

- Feature 1
- Feature 2

## Configuration

| Variable         | Description  | Default  |
| ---------------- | ------------ | -------- |
| `PROVIDER_VOICE` | Voice ID     | `voice1` |
| `PROVIDER_SPEED` | Speech speed | `1.0`    |

## Examples

```typescript
import { PipelineBuilder } from "./voice/pipeline.js";

const pipeline = await PipelineBuilder.build();
const audio = await pipeline.process(audioBuffer);
```
````

## Migration Guide

See `MIGRATION.md` for instructions on migrating from Kokoro to this provider.

````

## ✅ Checklist

- [ ] Implementar la interfaz `TTSProvider` o `STTProvider`
- [ ] Crear archivos de implementación
- [ ] Crear lista de voces (si es TTS)
- [ ] Registrar en Factory
- [ ] Agregar a configuración
- [ ] Agregar a .env.example
- [ ] Escribir tests unitarios
- [ ] Escribir tests de integración
- [ ] Documentar en README
- [ ] Agregar a documentación principal

## 🚀 Habilitar el Proveedor

Para usar tu nuevo proveedor, simplemente cambia la configuración:

```bash
# En .env
TTS_PROVIDER=nuevo
LANGUAGE=en
DEFAULT_VOICE=voice1
````

O en código:

```typescript
import { getVoiceConfig } from "./voice/config/voice.config.js";

const config = getVoiceConfig();
config.tts.provider = "nuevo";
config.tts.defaultVoice = "voice1";

const pipeline = await PipelineBuilder.build(config);
```

## 🐛 Troubleshooting

### Provider not found error

```typescript
// Error: TTS provider 'nuevo' not supported
```

**Solución:** Asegúrate de haber registrado el proveedor en la factory:

```typescript
TTSFactory.register("nuevo", NuevoTTS);
```

### Model loading error

**Solución:** Verifica que el modelo esté disponible y las credenciales sean correctas. Revisa los logs para más detalles.

### Audio format mismatch

**Solución:** Implementa correctamente los métodos `getAudioFormat()` y `getSampleRate()`.

## 📚 Recursos Adicionales

- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
- [API Reference](./API.md)
