# Cinechan

Tu asistente de cine personal con IA. 🎬🍿

## Estructura del Proyecto

```
cinechan/
├── apps/
│   ├── web/          # Frontend (Vite + React + shadcn)
│   └── agent/        # Backend Agent (LiveKit Agents)
├── packages/
│   └── shared/       # Tipos compartidos
└── docker/           # Configuración de LiveKit Server
```

## Requisitos

- Node.js 22+
- pnpm 9+
- Ollama (para LLM local)

## Instalación

```bash
# Instalar dependencias
pnpm install

# Descargar modelo de Ollama
ollama pull qwen2.5:7b
```

## Desarrollo

```bash
# Iniciar frontend
pnpm dev

# Iniciar LiveKit Server (en otra terminal)
pnpm livekit
```

## Stack

- **Frontend:** Vite + React + Tailwind CSS
- **Backend:** LiveKit Agents (Node.js)
- **LLM:** Ollama + Qwen 2.5 7B
- **WebRTC:** LiveKit Server

## Licencia

MIT
