# Arquitectura del Sistema de Voice Pipeline

## 📋 Overview

El sistema de voice pipeline de Cinechan está diseñado con una arquitectura escalable que permite fácil intercambio de proveedores de STT/TTS sin modificar el código existente.

## 🏗️ Patrones de Diseño

### 1. **Strategy Pattern**

- Permite intercambiar implementaciones de TTS/STT en tiempo de ejecución
- Cada proveedor implementa la misma interfaz

### 2. **Factory Pattern**

- Crea instancias de proveedores de forma centralizada
- Maneja la inicialización y configuración

### 3. **Dependency Injection**

- El pipeline recibe proveedores como dependencias
- Facilita el testing y la modularidad

### 4. **Adapter Pattern**

- Normaliza interfaces de diferentes proveedores
- Abstrae diferencias entre implementaciones

### 5. **Configuration-Driven**

- Todo se configura vía archivos de configuración
- Cambios sin necesidad de recompilar

## 📁 Estructura de Archivos

```
src/voice/
├── core/
│   ├── interfaces/
│   │   ├── ITTS.ts          # Interface común para TTS
│   │   ├── ISTT.ts          # Interface común para STT
│   │   └── types.ts         # Tipos compartidos
│   └── factory/
│       ├── TTSFactory.ts    # Factory para crear TTS
│       └── STTFactory.ts    # Factory para crear STT
│
├── providers/
│   ├── kokoro/
│   │   ├── KokoroTTS.ts     # Implementación Kokoro
│   │   └── voices.ts        # Lista de voces
│   ├── qwen3/               # Futuro: Qwen3-TTS
│   │   ├── Qwen3TTS.ts
│   │   └── Qwen3Config.ts
│   └── whisper/
│       └── WhisperSTT.ts    # Implementación Whisper
│
├── pipeline/
│   ├── VoicePipeline.ts     # Pipeline con DI
│   └── PipelineBuilder.ts   # Builder para configurar
│
└── config/
    └── voice.config.ts      # Configuración centralizada
```

## 🔌 Interfaces

### ITTS (Text-to-Speech)

```typescript
interface TTSProvider {
  readonly name: string;
  readonly supportedLanguages: string[];
  readonly supportedVoices: string[];

  initialize(config: TTSConfig): Promise<void>;
  synthesize(text: string, config?: Partial<TTSConfig>): Promise<TTSResult>;
  synthesizeStream?(
    text: string,
    onChunk: (chunk: Buffer) => void,
  ): Promise<void>;
  isReady(): boolean;
  listVoices(): string[];
  getVoiceInfo(voiceId: string): VoiceInfo | undefined;
}
```

### ISTT (Speech-to-Text)

```typescript
interface STTProvider {
  readonly name: string;
  readonly supportedLanguages: string[];

  initialize(config: STTConfig): Promise<void>;
  transcribe(audio: Buffer, config?: Partial<STTConfig>): Promise<STTResult>;
  transcribeStream?(audioChunk: Buffer): Promise<STTResult>;
  isReady(): boolean;
}
```

## 🚀 Uso Básico

### Crear Pipeline

```typescript
import { PipelineBuilder } from "./voice/pipeline.js";

const pipeline = await PipelineBuilder.build();
const audio = await pipeline.process(audioBuffer);
```

### Usar Configuración desde Environment

```typescript
import { getVoiceConfig } from "./voice/config/voice.config.js";

const config = getVoiceConfig();
const pipeline = await PipelineBuilder.build(config);
```

## 🔄 Agregar Nuevo Proveedor

### 1. Crear Interface

```typescript
// src/voice/providers/nuevo/NuevoTTS.ts
import type { TTSProvider } from "../../core/interfaces/ITTS.js";

export class NuevoTTS implements TTSProvider {
  readonly name = "nuevo";
  readonly supportedLanguages = ["en", "es"];
  readonly supportedVoices = ["voice1", "voice2"];

  async initialize(config: TTSConfig): Promise<void> {
    // Inicializar proveedor
  }

  async synthesize(
    text: string,
    config?: Partial<TTSConfig>,
  ): Promise<TTSResult> {
    // Implementar síntesis
  }

  isReady(): boolean {
    // Verificar estado
  }

  listVoices(): string[] {
    return this.supportedVoices;
  }

  getVoiceInfo(voiceId: string): VoiceInfo | undefined {
    return {
      id: voiceId,
      name: voiceId,
      language: "en",
    };
  }
}
```

### 2. Registrar en Factory

```typescript
// src/voice/core/factory/TTSFactory.ts
import { NuevoTTS } from "../../providers/nuevo/NuevoTTS.js";

TTSFactory.register("nuevo", NuevoTTS);
```

### 3. Usar en Configuración

```typescript
// src/voice/config/voice.config.ts
export const voiceConfig: VoiceConfig = {
  tts: {
    provider: "nuevo",
    defaultVoice: "voice1",
    defaultLanguage: "en",
    providers: {
      nuevo: {
        // Config específica
      },
    },
  },
  // ...
};
```

### 4. Cambiar en .env

```bash
TTS_PROVIDER=nuevo
```

## 📊 Flujo de Datos

```
Audio Buffer
    ↓
[STT Provider] → Texto
    ↓
[LLM Provider] → Respuesta
    ↓
[TTS Provider] → Audio Buffer
    ↓
[HTTP Response]
```

## 🧪 Testing

### Unit Tests

```typescript
import { KokoroTTS } from "./providers/kokoro/KokoroTTS.js";
import type { TTSConfig } from "./core/interfaces/ITTS.js";

describe("KokoroTTS", () => {
  it("should synthesize text to audio", async () => {
    const tts = new KokoroTTS();
    await tts.initialize({ voice: "af_heart" });

    const result = await tts.synthesize("Hello world");
    expect(result.audio).toBeInstanceOf(Buffer);
    expect(result.metadata.format).toBe("wav");
  });

  it("should list available voices", () => {
    const tts = new KokoroTTS();
    const voices = tts.listVoices();
    expect(voices).toContain("af_heart");
    expect(voices).toContain("am_michael");
  });
});
```

### Integration Tests

```typescript
describe("VoicePipeline", () => {
  it("should process complete pipeline", async () => {
    const pipeline = await PipelineBuilder.build();
    const audio = await pipeline.process(audioBuffer);

    expect(audio).toBeInstanceOf(Buffer);
  });
});
```

## 🔧 Configuración

### Variables de Environment

| Variable        | Descripción        | Default               |
| --------------- | ------------------ | --------------------- |
| `TTS_PROVIDER`  | Proveedor TTS      | `kokoro`              |
| `LANGUAGE`      | Idioma por defecto | `en`                  |
| `DEFAULT_VOICE` | Voz por defecto    | `af_heart`            |
| `KOKORO_VOICE`  | Voz Kokoro         | `af_heart`            |
| `KOKORO_SPEED`  | Velocidad Kokoro   | `1.0`                 |
| `KOKORO_DTYPE`  | Dtype Kokoro       | `q8`                  |
| `WHISPER_MODEL` | Modelo Whisper     | `Xenova/whisper-tiny` |

## 📚 Recursos Adicionales

- [Agregar Proveedor TTS](./ADDING_PROVIDERS.md)
- [Configuración de Kokoro](./KOKORO_SETUP.md)
- [Migración a Qwen3](./QWEN3_MIGRATION.md)
- [API Reference](./API.md)

## 🤝 Contributing

Para agregar un nuevo proveedor:

1. Seguir la estructura de `providers/kokoro/`
2. Implementar la interfaz `TTSProvider` o `STTProvider`
3. Registrar en la factory correspondiente
4. Agregar configuración en `voice.config.ts`
5. Agregar tests unitarios
6. Documentar en esta guía
