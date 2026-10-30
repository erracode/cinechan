/**
 * Cinechan agent — LLM layer.
 *
 * Primary path: Cloudflare Workers AI via the `AI` binding (`env.AI.run`).
 * No external API keys, inference stays inside Cloudflare's network.
 * See docs/adr/0001-cloudflare-workers-ai-migration.md
 *
 * gpt-oss-20b speaks the OpenAI chat-completions shape:
 *   - tools must be nested: { type: "function", function: { name, ... } }
 *   - tool_calls arrive under choices[0].message.tool_calls
 *   - each call's `arguments` is a JSON *string*
 * Verified against the live binding, not just the docs.
 */

import { tools, toolsByName } from "./tools.js";

export const DEFAULT_MODEL = "@cf/openai/gpt-oss-20b";
const MAX_STEPS = 4;

/**
 * Workers AI defaults completion tokens to 256, which truncates mid-list
 * (finish_reason "length") on catalogue-sized answers. 1024 measured enough
 * for the largest reply with headroom.
 */
const MAX_TOKENS = 1024;

/**
 * Persona + behaviour. Kept deliberately short: the tool catalogue is
 * already sent as JSON Schema, so re-listing it here only burned tokens.
 */
export const CINECHAN_SYSTEM_PROMPT = `Eres Cinechan, asistente de cine de Cinemark. Respondes siempre en español, con tono cercano y entusiasta, breve (2-4 frases).

Usa las herramientas para obtener datos reales: nunca inventes películas, horarios, precios ni promociones. Si falta un dato, llama a la herramienta correspondiente.

Cuando menciones una película, escribe \`[movie:ID]\` justo después del título para que la UI renderice la tarjeta. Ejemplo: "Te recomiendo [movie:dune-part-2]".

IDs válidos: mortal-kombat-2, las-ovejas-detectives, billie-eilish-tour-3d, iron-maiden, michael, diablo-viste-a-la-moda-2, super-mario-galaxy, la-posesion-de-la-momia, the-amazing-digital-circus, txt-moa-con-in-japan, the-mandalorian-and-grogu, top-gun-40, top-gun-maverick-re`;

/** Minimal shape of the Workers AI binding. */
export interface AiBinding {
  run: (model: string, input: Record<string, unknown>) => Promise<any>;
}

interface WireMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: unknown[];
  tool_call_id?: string;
}

interface WireToolCall {
  id: string;
  type?: string;
  function: { name: string; arguments: string | Record<string, unknown> };
}

/** Workers AI rejects nulls for omitted args, and the model emits them. */
function normalizeArgs(raw: unknown): Record<string, unknown> {
  let parsed: unknown = raw;

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {};
    }
  }

  if (!parsed || typeof parsed !== "object") return {};

  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).filter(([, v]) => v !== null && v !== undefined),
  );
}

function toolSchemas() {
  return tools.map(({ name, description, parameters }) => ({
    type: "function" as const,
    function: { name, description, parameters },
  }));
}

/**
 * Runs the model with tool calling until it produces a final answer or
 * MAX_STEPS is reached.
 */
export async function chat(
  message: string,
  ai: AiBinding,
  model = DEFAULT_MODEL,
): Promise<string> {
  const messages: WireMessage[] = [
    { role: "system", content: CINECHAN_SYSTEM_PROMPT },
    { role: "user", content: message },
  ];
  const schemas = toolSchemas();

  for (let step = 0; step < MAX_STEPS; step++) {
    const result: any = await ai.run(model, { messages, tools: schemas, max_tokens: MAX_TOKENS });
    const assistant = result?.choices?.[0]?.message;
    const calls: WireToolCall[] = assistant?.tool_calls ?? [];

    if (calls.length === 0) {
      return String(assistant?.content ?? "").trim();
    }

    // The assistant turn must echo the calls so the model can match results.
    messages.push({
      role: "assistant",
      content: typeof assistant?.content === "string" ? assistant.content : "",
      tool_calls: calls,
    });

    for (const call of calls) {
      const name = call.function?.name ?? "";
      const tool = toolsByName.get(name);
      const output = tool
        ? await tool.execute(normalizeArgs(call.function?.arguments))
        : JSON.stringify({ error: `unknown tool: ${name}` });

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: output,
      });
    }
  }

  // Step budget exhausted: one last plain turn, no tools, so the user
  // always gets an answer instead of an error.
  const fallback: any = await ai.run(model, { messages, max_tokens: MAX_TOKENS });
  return String(fallback?.choices?.[0]?.message?.content ?? "").trim();
}

/** Local-dev adapter: Workers AI over its REST endpoint. */
export function createRestBinding(
  accountId: string,
  apiToken: string,
): AiBinding {
  return {
    async run(model, input) {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        },
      );

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Workers AI ${res.status}: ${body.slice(0, 300)}`);
      }

      const json: any = await res.json();
      return json.result ?? json;
    },
  };
}
