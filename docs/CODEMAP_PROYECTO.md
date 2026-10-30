# 🗺️ Codemap del Proyecto Cinechan

## 📐 Arquitectura General

```
CINECHAN
├── apps/agent/     (Backend - Agent Server - Port 3003)
└── apps/web/       (Frontend - React App - Port 3000)
```

---

## 🔌 Conexiones entre Servicios

```
Frontend (Port 3000)
    ↓ HTTP/JSON
Agent Server (Port 3003)
    ↓ WebSocket
LiveKit Cloud (wss://yt-test-upfzxp04.livekit.cloud)
    ↓ WebSocket
AI Models (Whisper, Kokoro, Qwen3)
```

---

## 📊 Flujo de Datos - Voice Pipeline

```
Usuario (Habla)
    ↓
Micrófono (LiveKitControl)
    ↓
LiveKit Cloud
    ↓
POST /api/voice (Agent Server)
    ↓
STT: Whisper → Texto
    ↓
LLM: Qwen3 → Respuesta
    ↓
TTS: Kokoro → Audio
    ↓
Frontend → Live2D Character
```

---

## 🎯 Componentes Principales

### 1. LiveKitControl
- **Archivo:** apps/web/src/components/livekit-control.tsx
- **Responsabilidad:** Control de micrófono
- **Estado:** ✅ Funcional

### 2. AudioVisualizer
- **Archivo:** apps/web/src/components/audio-visualizer.tsx
- **Responsabilidad:** Visualización de audio
- **Estado:** ⚠️ Botón vacío

### 3. Live2DCharacter
- **Archivo:** apps/web/src/components/live2d-character.tsx
- **Responsabilidad:** Renderizado Live2D
- **Estado:** ✅ Funcional

### 4. AIInputV2
- **Archivo:** apps/web/src/components/ai-input-v2.tsx
- **Responsabilidad:** Chat interface
- **Estado:** ✅ Funcional

---

## 📡 Endpoints Agent Server

```
POST /api/chat              - Chat de texto
POST /api/voice/token       - Generar JWT Token
POST /api/voice             - Voice Pipeline (STT→LLM→TTS)
GET /api/movies             - Datos de películas
GET /api/showtimes          - Horarios
GET /api/cinemas            - Cines
GET /api/promotions         - Promociones
GET /api/voice/config       - Configuración pipeline
GET /api/voice/voices       - Voces disponibles
```

---

## 🚀 Scripts de Ejecución

```bash
# Terminal 1: Agent Server
cd apps/agent && npm run dev

# Terminal 2: Web App
cd apps/web && npm run dev
```

---

**Última actualización:** 10 de Marzo 2026
