# Cinechan

Asistente de cine conversacional con IA, personaje Live2D animado y voz en español.

[![CI](https://github.com/erracode/cinechan/actions/workflows/ci.yml/badge.svg)](https://github.com/erracode/cinechan/actions/workflows/ci.yml)

## Qué hace

Un avatar Live2D que conversa sobre cartelera, horarios, asientos, precios, promociones
y confitería. Responde con texto y voz, y mueve la boca sincronizada con el audio real.

El modelo no inventa datos: consulta el catálogo a través de *function calling*.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + TanStack Router + Tailwind CSS 4 |
| Avatar | Live2D Cubism + pixi-live2d-display |
| Backend | Hono (Cloudflare Worker / Node) |
| LLM | Cloudflare Workers AI · `@cf/openai/gpt-oss-20b` |
| TTS | Cloudflare Workers AI · `@cf/deepgram/aura-2-es` |
| STT | Web Speech API (navegador) |
| Monorepo | pnpm + Turborepo |

## Estructura

```
cinechan/
├── apps/
│   ├── agent/     # API: chat, TTS, catálogo
│   └── web/       # UI React + avatar Live2D
└── packages/
    └── shared/    # Tipos compartidos
```

## Requisitos

- Node.js 22+
- pnpm 10+

## Instalación

```bash
pnpm install
```

## Desarrollo

```bash
# ambas apps
pnpm dev

# solo el agent
pnpm --filter @cinechan/agent dev

# solo el frontend
pnpm --filter @cinechan/web dev
```

El agent queda en `http://localhost:3003` y el frontend en `http://localhost:3000`.

### Configuración del agent

Copiá `apps/agent/.env.example` a `apps/agent/.env` y completá las credenciales
de Workers AI. En producción el Worker usa el binding `AI` y no necesita claves.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/chat` | Conversación con tool calling |
| `POST` | `/api/tts` | Texto a voz |
| `GET` | `/api/movies` | Cartelera |
| `GET` | `/api/showtimes` | Horarios |
| `GET` | `/api/cinemas` | Cines |
| `GET` | `/api/promotions` | Promociones |
| `GET` | `/api/tickets` | Tipos de boleto |
| `GET` | `/api/concessions` | Confitería |
| `GET` | `/api/seats/:cinemaId/:screenNumber` | Mapa de asientos |

## Sobre los datos

Todos los datos de cines, películas, precios y promociones son **ficticios y
determinísticos**, generados con semilla para que dos ejecuciones produzcan el
mismo resultado. No hay conexión con ningún servicio real.

## Licencia

MIT
