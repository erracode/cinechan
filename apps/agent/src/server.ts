/**
 * Local Node entry point for development (`pnpm dev`).
 * Production runs on Cloudflare Workers via src/worker.ts.
 */
import "dotenv/config";
import { serve } from "@hono/node-server";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3003;
const app = createApp();

serve({ port: PORT, fetch: app.fetch }, (info) => {
  console.log(`🎬 Cinechan agent en http://localhost:${info.port}`);
  console.log("   POST /api/chat       chat con IA");
  console.log("   POST /api/tts        text-to-speech (Aura-2 ES)");
  console.log("   GET  /api/movies     cartelera");
  console.log("   GET  /api/showtimes  horarios");
  console.log("   GET  /api/cinemas    cines");
  console.log("   GET  /api/promotions promociones");
  console.log("   GET  /api/tickets    tipos de boleto");
  console.log("   GET  /api/concessions confitería");
  console.log("   GET  /api/seats/:cinemaId/:screenNumber asientos");
});
