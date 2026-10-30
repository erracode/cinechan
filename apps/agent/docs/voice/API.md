# API Reference - Cinechan Voice Pipeline

## Overview

La API de Cinechan proporciona endpoints para chat de texto y voice pipeline completo (STT → LLM → TTS).

## Base URL

```
http://localhost:3003
```

## Endpoints

### POST /api/chat

Chat de texto con Cinechan.

**Request:**

```json
{
  "message": "Hola, ¿qué películas hay en cartelera?"
}
```

**Response:**

```json
{
  "response": "¡Hola! 🎬 Hoy tenemos algunas películas increíbles en cartelera..."
}
```

**Status Codes:**

- `200 OK` - Respuesta exitosa
- `400 Bad Request` - Mensaje requerido
- `500 Internal Server Error` - Error en procesamiento

---

### POST /api/voice

Voice pipeline completo (STT → LLM → TTS).

**Request:**

```json
{
  "audio": "base64_encoded_audio_data"
}
```

**Response:**

```json
{
  "audio": "base64_encoded_audio_output",
  "text": "Audio generated successfully"
}
```

**Status Codes:**

- `200 OK` - Audio generado exitosamente
- `400 Bad Request` - Audio data requerido
- `500 Internal Server Error` - Error en pipeline

---

### GET /api/voice/config

Obtener configuración actual del pipeline.

**Response:**

```json
{
  "tts": {
    "provider": "kokoro",
    "voices": ["af_bella", "af_heart", "af_jessica", ...],
    "ready": true
  },
  "stt": {
    "provider": "whisper",
    "languages": ["en", "es", "fr", ...],
    "ready": true
  }
}
```

---

### GET /api/voice/voices

Obtener lista de voces disponibles del proveedor TTS actual.

**Response:**

```json
{
  "provider": "kokoro",
  "voices": [
    {
      "id": "af_bella",
      "name": "Bella",
      "language": "en",
      "gender": "female",
      "description": "Bright, slightly edgy young female voice"
    },
    {
      "id": "af_heart",
      "name": "Heart",
      "language": "en",
      "gender": "female",
      "description": "Warm, gentle female voice"
    }
  ]
}
```

---

### GET /api/movies

Obtener películas en cartelera.

**Response:**

```json
{
  "movies": [
    {
      "id": "1",
      "title": "Dune 2",
      "rating": "4.8",
      "genres": ["Ciencia Ficción", "Aventura"],
      "duration": "166",
      "formats": ["2D", "3D", "IMAX"]
    }
  ]
}
```

---

### GET /api/showtimes

Obtener horarios de películas.

**Response:**

```json
{
  "showtimes": [
    {
      "movieId": "1",
      "cinemaId": "1",
      "cinemaName": "Cinepolis Polanco",
      "date": "2026-03-06",
      "times": ["14:00", "17:30", "21:00"]
    }
  ]
}
```

---

### GET /api/cinemas

Obtener cines disponibles.

**Response:**

```json
{
  "cinemas": [
    {
      "id": "1",
      "name": "Cinepolis Polanco",
      "location": "Av. Paseo de la Reforma 550",
      "phone": "555-1234"
    }
  ]
}
```

---

### GET /api/promotions

Obtener promociones activas.

**Response:**

```json
{
  "promotions": [
    {
      "id": "1",
      "title": "2x1 en Viernes",
      "description": "Compra 1 boleto y recibe otro gratis los viernes",
      "validUntil": "2026-03-31"
    }
  ]
}
```

## Headers

### CORS

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

## Environment Variables

| Variable         | Description      | Default                     |
| ---------------- | ---------------- | --------------------------- |
| `PORT`           | Server port      | `3003`                      |
| `TTS_PROVIDER`   | TTS provider     | `kokoro`                    |
| `LANGUAGE`       | Default language | `en`                        |
| `DEFAULT_VOICE`  | Default voice    | `af_heart`                  |
| `OLLAMA_URL`     | Ollama API URL   | `http://127.0.0.1:11434/v1` |
| `OLLAMA_MODEL`   | Ollama model     | `qwen3:8b`                  |
| `OLLAMA_API_KEY` | Ollama API key   | `ollama`                    |

## Voice Pipeline Configuration

### Kokoro TTS Configuration

| Variable       | Description  | Default    |
| -------------- | ------------ | ---------- |
| `KOKORO_VOICE` | Kokoro voice | `af_heart` |
| `KOKORO_SPEED` | Speech speed | `1.0`      |
| `KOKORO_DTYPE` | Kokoro dtype | `q8`       |

### Whisper STT Configuration

| Variable        | Description   | Default               |
| --------------- | ------------- | --------------------- |
| `WHISPER_MODEL` | Whisper model | `Xenova/whisper-tiny` |

### Qwen3-TTS Configuration (Futuro)

| Variable          | Description      | Default  |
| ----------------- | ---------------- | -------- |
| `QWEN3_MODEL`     | Qwen3 model      | `1.7B`   |
| `QWEN3_VOICE`     | Qwen3 voice      | `Vivian` |
| `QWEN3_STREAMING` | Enable streaming | `false`  |

### ElevenLabs Configuration (Futuro)

| Variable              | Description         | Default |
| --------------------- | ------------------- | ------- |
| `ELEVENLABS_API_KEY`  | ElevenLabs API key  | -       |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID | -       |

### Deepgram Configuration (Futuro)

| Variable           | Description      | Default |
| ------------------ | ---------------- | ------- |
| `DEEPGRAM_API_KEY` | Deepgram API key | -       |

## Error Responses

### 400 Bad Request

```json
{
  "error": "Message is required"
}
```

### 500 Internal Server Error

```json
{
  "error": "Error processing message"
}
```

### TTS Provider Error

```json
{
  "error": "TTS provider 'invalid_provider' not supported"
}
```

### STT Provider Error

```json
{
  "error": "STT provider 'invalid_provider' not supported"
}
```

## Rate Limiting

No rate limiting actual en esta versión. Se recomienda implementar en producción.

## Webhook Support

Actualmente no hay webhooks. Los endpoints son REST.

## WebSocket Support

No hay WebSocket en esta versión. Se recomienda implementar en producción.

## Authentication

No hay autenticación en esta versión. Se recomienda implementar en producción.

## Caching

No hay caching en esta versión. Se recomienda implementar en producción.

## Logging

Todos los endpoints registran errores en el console. En producción, implementar logging centralizado.

## Testing

### Test de Chat

```bash
curl -X POST http://localhost:3003/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola"}'
```

### Test de Voice Pipeline

```bash
curl -X POST http://localhost:3003/api/voice \
  -H "Content-Type: application/json" \
  -d '{"audio":"base64_data"}'
```

### Test de Configuración

```bash
curl http://localhost:3003/api/voice/config
```

### Test de Voces

```bash
curl http://localhost:3003/api/voice/voices
```

## Migration Guide

### Migrar a Qwen3-TTS

1. Instalar `qwen-tts`:

```bash
npm install qwen-tts
```

2. Actualizar `.env`:

```bash
TTS_PROVIDER=qwen3
LANGUAGE=zh
DEFAULT_VOICE=Vivian
```

3. Reiniciar servidor

Ver [QWEN3_MIGRATION.md](./QWEN3_MIGRATION.md) para más detalles.

## Troubleshooting

### Error: "TTS provider not supported"

Asegúrate de haber registrado el proveedor en `TTSFactory`.

### Error: "Model not initialized"

El modelo puede tardar unos segundos en cargar. Espera unos segundos y reintenta.

### Error: "Audio data is required"

Verifica que el audio esté codificado en base64.

### Pipeline muy lento

- Verificar que el modelo esté cargado
- Reducir el tamaño del modelo (usar whisper-tiny en lugar de whisper-small)
- Verificar la velocidad de tu CPU/GPU

## Performance

- **Chat Endpoint**: ~100ms (sin TTS)
- **Voice Pipeline**: ~500-1000ms (con STT → LLM → TTS)
- **TTS Generation**: ~100-200ms (Kokoro)
- **STT Transcription**: ~200-400ms (Whisper)

## Next Steps

- [ ] Implementar rate limiting
- [ ] Agregar autenticación
- [ ] Implementar caching
- [ ] Agregar webhooks
- [ ] Implementar WebSocket
- [ ] Agregar metrics
- [ ] Implementar logging centralizado
