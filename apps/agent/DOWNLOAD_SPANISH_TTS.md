# Descargar Modelo de TTS en Español

## 📥 Instrucciones

El modelo de TTS en español (es_MX-cortanav3-high) no está disponible públicamente y requiere autenticación en HuggingFace.

### Opción 1: Descarga Manual (Recomendado)

1. **Crear cuenta en HuggingFace** (si no tienes):
   - Visita: https://huggingface.co/join
   - Regístrate con tu email

2. **Obtener token de acceso**:
   - Visita: https://huggingface.co/settings/tokens
   - Crear nuevo token (tipo: Read)
   - Copiar el token

3. **Descargar modelos**:

```bash
# Crear directorio
mkdir -p apps/agent/models/es_MX-cortanav3-high

# Ir al directorio
cd apps/agent/models/es_MX-cortanav3-high

# Descargar modelo con autenticación
wget --header="Authorization: Bearer TU_TOKEN_AQUI" \
  "https://huggingface.co/HirCoir/Piper-TTS-Spanish/resolve/main/es_MX-cortanav3-high.onnx"

# Descargar configuración
wget --header="Authorization: Bearer TU_TOKEN_AQUI" \
  "https://huggingface.co/HirCoir/Piper-TTS-Spanish/resolve/main/es_MX-cortanav3-high.onnx.json"

# Verificar archivos
ls -lh
```

4. **Actualizar configuración en `.env`**:

```bash
# apps/agent/.env
TTS_MODEL_PATH=models/es_MX-cortanav3-high
```

### Opción 2: Usar modelo actual (MeloTTS)

Si no quieres autenticarte, usa el modelo actual que ya está descargado:

```bash
# apps/agent/.env (ya configurado)
TTS_MODEL_PATH=models/en-us-voice-medium
```

Este modelo soporta chino e inglés.

---

## 📊 Tamaños de Modelos

| Modelo        | Tamaño  | Soporte                        |
| ------------- | ------- | ------------------------------ |
| Whisper STT   | 245 MB  | Multilingual (incluye español) |
| MeloTTS       | 183 MB  | Chinese + English              |
| Piper Spanish | 63.1 MB | Español                        |

---

## 🚀 Probar Voice Pipeline

Una vez que tengas el modelo de español descargado:

```bash
# Terminal 1: Iniciar server
cd apps/agent && pnpm tsx src/server.ts

# Terminal 2: Probar chat
curl -X POST http://localhost:3003/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hola"}'

# Terminal 3: Probar voice pipeline
curl -X POST http://localhost:3003/api/voice \
  -H "Content-Type: application/json" \
  -d '{"audio":"base64_audio_data"}'
```

---

## ⚠️ Nota Importante

- El modelo de español requiere token de HuggingFace
- Los archivos son de 63.1 MB + 7.1 KB
- Sin autenticación, no se pueden descargar
- Alternativa: Usar modelo actual (MeloTTS)
