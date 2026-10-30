/**
 * Cloudflare Workers entry point.
 *
 * The `AI` binding is declared in wrangler.toml, which authenticates at the
 * account level — no API keys in the code or the repo.
 */
import { createApp, type Env } from "./app.js";

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return createApp(env).fetch(request, env, ctx);
  },
};
