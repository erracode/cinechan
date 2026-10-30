# 🚀 Guía de Inicio Rápido - Cinechan

## ✅ **Prerrequisitos**

- ✅ Node.js 22+ instalado
- ✅ pnpm instalado
- ✅ Ollama corriendo (Docker o local)

---

## 📋 **Pasos para Iniciar Cinechan**

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Iniciar Docker Desktop
# (Abre Docker Desktop desde tu escritorio)

# 2. Iniciar Ollama
docker run -d -p 11434:11434 --name ollama ollama/ollama:latest

# 3. Descargar modelo de LLM
ollama pull qwen2.5:7b

# 4. Instalar dependencias
pnpm install

# 5. Iniciar servicios
cd apps/agent && npm run dev
```

### Opción 2: Con Ollama Local (Sin Docker)

```bash
# 1. Descargar e instalar Ollama desde https://ollama.com/download
# 2. Instalar dependencias
pnpm install

# 3. Descargar modelo
ollama pull qwen2.5:7b

# 4. Iniciar servicios
cd apps/agent && npm run dev
```

---

## 🎬 **Iniciar Todos los Servicios Simultáneamente**

### Con Script (Linux/Mac)

```bash
chmod +x start.sh
./start.sh
```

### Manualmente (2 terminales)

**Terminal 1 - Agent Server:**

```bash
cd apps/agent
npm run dev
```

**Terminal 2 - Web Frontend:**

```bash
cd apps/web
npm run dev
```

---

## ✅ **Verificar que Todo Funciona**

### 1. Test Agent Server

```bash
# Verificar configuración
curl http://localhost:3003/api/voice/config

# Verificar voces disponibles
curl http://localhost:3003/api/voice/voices

# Test chat
curl -X POST http://localhost:3003/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola, ¿qué películas hay en cartelera?"}'
```

### 2. Test Frontend

Abre tu navegador en: http://localhost:3000

---

## 🔧 **Solución de Problemas**

### Problema: "Ollama no está disponible"

```bash
# Verificar si Ollama está corriendo
curl http://localhost:11434/api/tags

# Si no está, iniciar Ollama
docker start ollama
# o
ollama serve
```

### Problema: Puerto 3003 ya en uso

```bash
# Matar proceso que usa puerto 3003
netstat -ano | findstr :3003
taskkill //F //PID <PID>

# O usar puerto diferente
PORT=3004 npm run dev
```

### Problema: Dependencias no instaladas

```bash
# Limpiar y reinstalar
rm -rf node_modules
rm -rf apps/*/node_modules
pnpm install

# O reinstalar solo web
cd apps/web
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problema: Rollup error

```bash
cd apps/web
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📊 **Status de Servicios**

### Agent Server (http://localhost:3003)

- ✅ STT: Whisper (WhisperSTT)
- ✅ TTS: Kokoro-82M (KokoroTTS)
- ✅ LLM: Ollama (qwen3:8b)
- ✅ API Endpoints: 8 endpoints disponibles
- ✅ Chat funcional con Markdown render

### Web Frontend (http://localhost:3000)

- ✅ Next.js 15 instalado
- ✅ shadcn/ui configurado
- ✅ Chat interface completada
- ⚠️ Pendiente: Configuración de Live2D

---

## 🎯 **Próximos Pasos Inmediatos**

### 1. Iniciar Ollama

```bash
# Si tienes Docker Desktop:
docker run -d -p 11434:11434 --name ollama ollama/ollama:latest

# Si instalaste Ollama local:
ollama serve
```

### 2. Verificar Ollama

```bash
curl http://localhost:11434/api/tags
```

### 3. Iniciar Agent Server

```bash
cd apps/agent
npm run dev
```

### 4. Testear Chat

```bash
curl -X POST http://localhost:3003/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola, ¿qué películas hay en cartelera?"}'
```

### 5. Testear Frontend

Abre tu navegador en: http://localhost:3000

---

## 📝 **Endpoints Disponibles**

| Endpoint            | Método | Descripción                           |
| ------------------- | ------ | ------------------------------------- |
| `/api/chat`         | POST   | Chat de texto con Cinechan            |
| `/api/voice`        | POST   | Voice pipeline completo (STT→LLM→TTS) |
| `/api/voice/config` | GET    | Configuración del pipeline            |
| `/api/voice/voices` | GET    | Voces disponibles                     |
| `/api/movies`       | GET    | Películas en cartelera                |
| `/api/showtimes`    | GET    | Horarios de películas                 |
| `/api/cinemas`      | GET    | Cines disponibles                     |
| `/api/promotions`   | GET    | Promociones activas                   |

---

## 🎬 **Configuración de Voces Kokoro**

Voces disponibles:

- `af_bella` - Bright, slightly edgy young female voice
- `af_heart` - Warm, gentle female voice
- `af_jessica` - Cheerful American female voice
- `af_nova` - Energetic, youthful female voice
- `am_michael` - American male voice, warm and friendly
- `bf_emma` - British female voice, clear and engaging
- `ef_dora` - European female voice, soft and gentle

Cambia la voz en `.env`:

```bash
DEFAULT_VOICE=af_heart
KOKORO_VOICE=af_heart
```

---

## 🚀 **Ready to Start!**

Cuando estés listo:

```bash
# 1. Iniciar Ollama
docker run -d -p 11434:11434 --name ollama ollama/ollama:latest

# 2. Instalar dependencias
pnpm install

# 3. Iniciar Agent Server
cd apps/agent && npm run dev
```

¡Y listo! 🎉

---

## 📞 **Necesitas Ayuda?**

Revisa:

- [Implementación Checklist](../IMPLEMENTATION_CHECKLIST.md)
- [Documentación de Voice](../apps/agent/docs/voice/ARCHITECTURE.md)
- [API Reference](../apps/agent/docs/voice/API.md)
- [Ejemplos de Uso](../apps/agent/docs/voice/EXAMPLES.md)
