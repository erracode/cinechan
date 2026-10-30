# Voice Pipeline - STT → LLM → TTS

## 🎯 Descripción

Pipeline de voz completo que convierte audio a texto, genera respuesta con LLM, y convierte texto a audio.

## 📦 Modelos Descargados

### STT (Speech-to-Text)

```
whisper/
├── tiny-decoder.int8.onnx:  86 MB
├── tiny-decoder.onnx:       110 MB
├── tiny-encoder.int8.onnx:  13 MB
├── tiny-encoder.onnx:       36 MB
└── tiny-tokens.txt:         798 KB
------------------------------------------------
Total: ~245 MB
```

### TTS (Text-to-Speech)

```
en-us-voice-medium/
├── model.onnx:             163 MB
├── model.int8.onnx:         133 bytes
├── lexicon.txt:             6.6 MB
├── dict/:                   diccionario
├── date.fst, phone.fst, number.fst: ~200 KB
└── tokens.txt:              655 bytes
------------------------------------------------
Total: ~183 MB
```

**Total: ~428 MB**

⚠️ **Nota**: Este modelo soporta chino e inglés. Para español, necesitas descargar el modelo de Piper español (es_MX-cortanav3-high) de HuggingFace.

### 📥 Modelo de Español (Opcional - Requiere Autenticación)

```
es_MX-cortanav3-high/
├── es_MX-cortanav3-high.onnx: 63.1 MB
└── es_MX-cortanav3-high.onnx.json: 7.1 KB
```

**⚠️ Requiere autenticación en HuggingFace**

**Instrucciones:**

```bash
# 1. Crear cuenta en HuggingFace: https://huggingface.co/join
# 2. Obtener token: https://huggingface.co/settings/tokens
# 3. Descargar modelos:
mkdir -p apps/agent/models/es_MX-cortanav3-high
cd apps/agent/models/es_MX-cortanav3-high
wget --header="Authorization: Bearer TU_TOKEN" \
  "https://huggingface.co/HirCoir/Piper-TTS-Spanish/resolve/main/es_MX-cortanav3-high.onnx"
wget --header="Authorization: Bearer TU_TOKEN" \
  "https://huggingface.co/HirCoir/Piper-TTS-Spanish/resolve/main/es_MX-cortanav3-high.onnx.json"

# 4. Actualizar .env
# TTS_MODEL_PATH=models/es_MX-cortanav3-high
```

Ver más detalles: `DOWNLOAD_SPANISH_TTS.md`
es_MX-cortanav3-high/
├── es_MX-cortanav3-high.onnx: 63.1 MB
└── es_MX-cortanav3-high.onnx.json: 7.1 KB

````

**Descargar desde:**

```bash
cd apps/agent/models/es_MX-cortanav3-high
wget https://huggingface.co/HirCoir/Piper-TTS-Spanish/raw/main/es_MX-cortanav3-high.onnx
wget https://huggingface.co/HirCoir/Piper-TTS-Spanish/raw/main/es_MX-cortanav3-high.onnx.json
````

## 📁 Estructura

```
apps/agent/
├── src/
│   ├── voice/
│   │   ├── stt.ts           # Speech-to-Text con Whisper
│   │   ├── tts.ts           # Text-to-Speech con Piper
│   │   └── pipeline.ts      # Pipeline completo
│   └── server.ts            # Server con endpoints
├── models/                  # Modelos de IA (crear manualmente)
└── scripts/
    └── download-models.ts   # Script para descargar modelos
```

## 🚀 Endpoints

### POST /api/chat

Chat con texto (ya implementado)

**Ejemplo:**

```bash
curl -X POST http://localhost:3003/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hola"}'
```

### POST /api/voice

Voice pipeline completo

**Ejemplo:**

```bash
curl -X POST http://localhost:3003/api/voice \
  -H "Content-Type: application/json" \
  -d '{
    "audio": "base64_encoded_audio_data"
  }'
```

## 📥 Descargar Modelos

### Opción 1: Descargar manualmente

```bash
# STT (Whisper tiny español)
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-tiny-ct2-20240602.tar.bz2
tar -xjf sherpa-onnx-whisper-tiny-ct2-20240602.tar.bz2
mv whisper-tiny-ct2 models/whisper-tiny.int8

# TTS (Piper inglés)
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/piper-models/piper-en-us-medium-mbott.tar.bz2
tar -xjf piper-en-us-medium-mbott.tar.bz2
mv en-us-medium-mbott models/en-us-voice-medium
```

### Opción 2: Usar modelos precompilados

```bash
# STT
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-tiny-20250206.tar.bz2
tar -xjf sherpa-onnx-whisper-tiny-20250206.tar.bz2

# TTS
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/piper-models/piper-en_US-medium.onnx.tar.bz2
tar -xjf piper-en_US-medium.onnx.tar.bz2
```

## 🔧 Configuración

En `.env`:

```bash
# Ollama
OLLAMA_URL=http://127.0.0.1:11434/v1
OLLAMA_MODEL=qwen3:8b

# Voice Pipeline
STT_MODEL_PATH=models/whisper-tiny.int8
TTS_MODEL_PATH=models/en-us-voice-medium

PORT=3003
```

## 📝 Prueba Rápida

```bash
# Terminal 1: Iniciar server
cd apps/agent && pnpm tsx src/server.ts

# Terminal 2: Probar chat
curl -X POST http://localhost:3003/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hola"}'

# Terminal 3: Probar voice pipeline (necesita audio)
curl -X POST http://localhost:3003/api/voice \
  -H "Content-Type: application/json" \
  -d '{"audio":"base64_audio"}'
```

## ⚙️ Opciones del Pipeline

```typescript
new VoicePipeline({
  sttModelPath: "models/whisper-tiny.int8",
  ttsModelPath: "models/en-us-voice-medium",
  llmModel: "qwen3:8b",
});
```

## 🐛 Troubleshooting

### Error: Model not found

- Verificar que los modelos están en la ruta correcta
- Revisar `.env` con `STT_MODEL_PATH` y `TTS_MODEL_PATH`

### Error: STT/TTS fails

- Verificar que sherpa-onnx está instalado correctamente
- Verificar Node.js version (recomendado >= 22)

### Audio muy lento

- Usar modelos más pequeños (whisper-tiny en lugar de whisper-small)
- Verificar que GPU no está sobrecargado

## 🔄 Flujo de Trabajo

```
Audio (PCM) → STT (Whisper) → Texto
               ↓
           LLM (Ollama)
               ↓
           Respuesta (Texto)
               ↓
           TTS (Piper)
               ↓
           Audio (WAV/PCM)
```

## 📚 Referencias

- [Sherpa-ONNX](https://github.com/k2-fsa/sherpa-onnx)
- [Whisper Model](https://github.com/openai/whisper)
- [Piper TTS](https://github.com/rhasspy/piper)

## 🎯 Próximos Pasos

- [ ] Integrar con LiveKit para streaming en tiempo real
- [ ] Agregar VAD (Voice Activity Detection)
- [ ] Soporte multi-idioma
- [ ] Mejorar calidad de voz
- [ ] Agregar lip-sync con Live2D
