# Cinechan - Voice Assistant with Live2D

## Cleanup Complete - May 11 2026

### What was done

#### Deleted Dead Code (37 source files)
**Agent (19 files):**
- Legacy pipeline duplicates: `pipeline.ts`, `stt.ts`, `tts.ts`
- Dead barrels: `voice/index.ts`, `voice/config/index.ts`, `voice/core/index.ts`, `voice/core/factory/index.ts`, `providers/kokoro/index.ts`, `providers/whisper/index.ts`
- Test/debug scripts (8 files): `server-simple.ts`, `test-chat.ts`, `test-chat-simple.ts`, `test-kokoro.ts`, `test-providers.ts`, `test-voice-pipeline.ts`, `debug-pipeline*.ts`
- Unused type declarations (2): `whisper-onnx-speech-to-text.d.ts`, `sherpa-onnx.d.ts`
- Empty qwen3 provider directory
- `dist/` directory (will be rebuilt)

**Web (16 source files):**
- Components: `Chat.tsx`, `Header.tsx`, `Footer.tsx`, `voice-integration.tsx`, `VoiceSettings.tsx`, `audio-visualizer.tsx`, `bar-visualizer.tsx`, `livekit-audio.tsx`
- All `ui/` shadcn components (7 files): avatar, button, card, input, progress, scroll-area, select
- Hooks: `useAgentState.ts`, `useLipSync.ts`, `useLiveKitAudioStream.ts`
- Asset: `public/lib/live2d.min.js` (never loaded)

#### Fixed Haru Model
- Removed references to 18 missing assets from `Haru.model3.json` (8 expressions, 6 motions, 4 sounds — none existed on disk)
- Model still loads as static character with physics, pose, textures

#### Deleted Unused Assets
- Kei model (`public/models/kei/`, 33 files, ~80MB) — never loaded by any live route
- All 30 transient docs (kept 5 key ones)
- Empty docker/, packages/ directories, stray root files

#### Fixed `/api/voice` Endpoint
- Now actually decodes WebM audio → PCM via ffmpeg → Whisper STT → LLM → Kokoro TTS
- Returns base64-encoded WAV audio response
- Installed `fluent-ffmpeg` + `ffmpeg-static`

#### Verified
- Agent: TypeScript compiles clean (`tsc --noEmit` passes)
- Web: Vite build succeeds
- Both builds passing

### What's left (optional)
- Wire `useLipSync` hook to `Live2DCharacter` component for mouth animation
- LiveKit audio streaming is functional (MediaRecorder + HTTP POST)
