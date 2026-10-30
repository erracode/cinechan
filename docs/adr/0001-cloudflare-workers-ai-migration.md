# ADR 0001 — Migración a Cloudflare Workers AI

- **Estado:** Aceptado
- **Fecha:** 2026-10-30
- **Decisores:** Jesús (owner), asistencia técnica AI
- **Reemplaza:** la arquitectura documentada en `README.md`, `docs/CODEMAP_PROYECTO.md` y `apps/agent/VOICE_PIPELINE.md`

## Contexto

Cinechan nació como un asistente de cine en español con avatar Live2D, pensado para correr
localmente con LiveKit + Ollama + Kokoro. La arquitectura documentada nunca coincidió con el
código: el "LiveKit Agents worker" es en realidad un servidor HTTP con Hono, y LiveKit solo
se usaba para mintear un JWT que nadie consumía.

El objetivo ahora es distinto: convertir Cinechan en una **demo pública de portafolio**,
desplegable a **costo $0 USD**, con la **menor latencia posible**, accesible por URL para que
cualquier reclutador la pruebe, y con un repositorio limpio y open source en GitHub.

Eso impone restricciones que la arquitectura anterior no podía cumplir:

1. **No puede requerir procesos persistentes.** Un servidor que spawnea binarios o mantiene
   estado en memoria no encaja en un modelo serverless a costo cero.
2. **No puede requerir Python.** El TTS actual (`edge-tts`) es un CLI de Python invocado con
   `execSync`/`spawn`. Eso descarta Cloudflare Workers, que no ejecuta procesos.
3. **No puede depender de binarios nativos.** `ffmpeg-static` (~70 MB) y
   `@huggingface/transformers` con modelos ONNX (538 MB en `apps/agent/models/`) no son
   viables en un runtime de isolate con límites de tamaño de bundle.
4. **No puede depender de un scraping frágil.** EdgeTTS consume el servicio de lectura de
   Microsoft sin API oficial ni ToS que lo ampare. Desde IPs de datacenter es candidato
   directo a bloqueo — inaceptable para una demo que debe estar siempre disponible.
5. **Los límites de rate compartidos son un riesgo de producto.** Los límites de Groq aplican
   a nivel organización, no por usuario: todos los visitantes de la demo consumirían la misma
   cuota.

### Hallazgos que motivaron el descarte

| Componente | Problema verificado |
| --- | --- |
| `llama-3.1-8b-instant` (sugerido inicialmente) | Deprecado el 2026-08-16. Devuelve error en cuentas free y developer. |
| `llama-3.3-70b-versatile` (default en el código) | Deprecado el 2026-08-16, mismo caso. |
| `gpt-oss-20b` en Groq free | 8K TPM. Con ~2.000 tokens de input por request más tool calling, equivale a ~1 request por minuto. |
| `node-edge-tts` | Depende de `ws` (WebSocket de Node), no disponible en Workers. Además hereda el riesgo de scraping de EdgeTTS. |
| `edge-tts-universal` | Licencia AGPL-3.0 — incompatible con un repositorio MIT. |
| `@andresaya/edge-tts` | Licencia GPL-3.0 y requiere Bun. |
| `@huggingface/transformers` + ONNX | 538 MB de modelos; no referenciados por el código actual. |
| `ffmpeg-static` | Binario nativo; solo lo usaba `/api/voice`. |

## Decisión

Se adopta **Cloudflare Workers AI** como único proveedor de inferencia, invocado mediante
**bindings internos** (`env.AI.run`), para las dos capacidades del producto:

- **LLM:** `@cf/openai/gpt-oss-20b`
- **TTS:** `@cf/deepgram/aura-2-es` (10 voces en español)

Y se descarta por completo:

- **Python** y el CLI `edge-tts`
- **`node-edge-tts`** y cualquier librería de EdgeTTS (dependencia de `ws` no soportada en
  Workers, más riesgo de bloqueo por scraping)
- **LiveKit / WebRTC** (`livekit-server-sdk`, `livekit-client`, `/api/voice/token`,
  `/api/voice`)
- **Whisper** (`@huggingface/transformers`, `WhisperSTT`, endpoint `/api/voice`)
- **Kokoro** (`kokoro-js`, `KokoroTTS`, `voices.ts`)
- **`ffmpeg-static`** y todo el pipeline WebM → PCM

El STT se resuelve en el cliente con la **Web Speech API** nativa (`webkitSpeechRecognition`,
`es-MX`), que ya era el camino realmente en uso.

`xsai` se conserva: Workers AI expone endpoints **OpenAI-compatibles**, por lo que la lógica
de tools con Valibot no requiere reescritura — solo cambia el `baseURL` y la credencial.

## Consecuencias

### Positivas

- **Cero API keys externas.** Ni Groq, ni OpenAI, ni LiveKit. El binding `env.AI` se autentica
  a nivel de cuenta de Cloudflare; no hay secreto que rotar ni filtrar.
- **Latencia en milisegundos.** La inferencia no sale a internet: el Worker llama a Workers AI
  dentro de la red de Cloudflare.
- **Costo $0 real.** Free tier de Workers: 100.000 requests/día, sin cargo por duración.
  Workers AI incluido dentro de la cuota de neurons.
- **Empaquetado 100% nativo.** Hono + Wrangler. Un solo `wrangler deploy`. Sin Docker, sin
  binarios, sin procesos, sin Python.
- **Elimina la deuda técnica de raíz.** Desaparecen tres caminos de voz paralelos; queda uno
  (Web Speech API en cliente, `/api/tts` en servidor).
- **Superficie de ataque mínima.** Sin secretos en el repo no hay nada que rotar por
  incidente.
- **TTS con licencia y SLA.** `aura-2-es` es un modelo de partner (Deepgram) con términos
  comerciales, a diferencia del scraping de Microsoft Edge.

### Negativas / trade-offs aceptados

- **Vendor lock-in en Cloudflare.** El LLM y el TTS quedan atados a Workers AI. Mitigación: la
  capa `pickProvider()` se conserva detrás de una interfaz, de modo que cambiar de proveedor
  sea un cambio de una función, no una reescritura.
- **Calidad de TTS sujeta a Deepgram.** Si `aura-2-es` no satisface, el fallback es otro modelo
  de Workers AI o volver a un proveedor externo con key — decisión que requeriría un ADR nuevo.
- **`gpt-oss-20b` es más chico que los modelos previos.** Puede degradar el seguimiento de
  instrucciones multi-step. Mitigación: recorte de prompt/tools y `maxSteps` acotado.

### Acciones derivadas

1. **Recorte de tokens.** El system prompt duplicaba la descripción de las 9 tools que ya
   viajan en el schema JSON. Se elimina esa duplicación y se recorta la personalidad,
   apuntando a bajar de ~2.000 a ~1.200 tokens de input por request.
2. **Mocks deterministas.** `generateShowtimes()` usaba `Math.random()` y `new Date()`, lo que
   hacía que la cartelera cambiara en cada request e impedía demos reproducibles. Pasa a
   datos fijos.
3. **Limpieza de código muerto.** `avatarMood` y `agentCommentary` se escribían pero nunca se
   leían; se eliminan del store y de sus 6 consumidores.
4. **Sanitización previa del repositorio.** Ver ADR 0002 (repo único, `.gitignore`, rotación de
   credenciales).

## Referencias

- [Workers AI — Modelos](https://developers.cloudflare.com/workers-ai/models/)
- [Workers AI — Endpoints OpenAI-compatibles](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/)
- [Workers AI — Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Workers — Pricing y free tier](https://developers.cloudflare.com/workers/platform/pricing/)
- [Groq — Deprecaciones](https://console.groq.com/docs/deprecations)
