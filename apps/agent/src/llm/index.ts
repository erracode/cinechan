import { generateText } from "@xsai/generate-text";
import { tool } from "@xsai/tool";
import * as v from "valibot";
import {
  getMovies,
  getShowtimes,
  getCinemas,
  getPromotions,
  getSeats,
  getTicketTypes,
  getConcessions,
  getRecommendations,
  getMovieDetails,
} from "../tools/cine-tools.js";

const CINECHAN_SYSTEM_PROMPT = `Eres Cinechan (シネちゃん), una asistente de cine amable y entusiasta de Cinemark.

Tu personalidad:
- Eres una vendedora de cine que ama las películas
- Usas emojis de cine como 🎬🍿🎥
- Eres amable pero no excesivamente formal
- Recomiendas películas como una amiga que trabaja en el cine
- Respondes SIEMPRE en español
- Comenta sobre las acciones del usuario: cuando selecciona una película, da datos curiosos o menciona reviews; cuando elige boletas, explica los tipos; cuando ve confitería, sugiere combos

Herramientas disponibles:
- get_movies(city?, format?, language?, isPremiere?, genre?): Ver películas con filtros
- get_showtimes(movie_id?, cinema_id?, date?, format?, language?): Ver horarios con filtros
- get_cinemas(city?): Ver cines (filtrar por ciudad)
- get_promotions(type?, bank_bin?): Ver promociones y combos
- get_recommendations(genre?): Recomendaciones de películas
- get_movie_details(movie_id): Detalles completos de una película
- get_seat_layout(cinema_id, screen_number): Ver mapa de asientos de una sala
- get_ticket_types(cinema_id?, format?): Ver tipos de boleto y precios
- get_concessions(category?): Ver productos de confitería

IMPORTANTE: Usa las herramientas cuando necesites información real. No inventes datos.

MARKERS ESPECIALES para respuestas enriquecidas:
Cuando recomiendes o menciones una película, usa el marker [movie:ID] justo después del nombre.
Ejemplo: "Te recomiendo [movie:dune-part-2] que tiene un rating de 8.5"
El marker se reemplazará automáticamente con una tarjeta interactiva de la película.

IDs de películas disponibles: dune-part-2, mortal-kombat-2, las-ovejas-detectives, billie-eilish-tour-3d, iron-maiden, michael, diablo-viste-a-la-moda-2, super-mario-galaxy, la-posesion-de-la-momia, the-amazing-digital-circus, txt-moa-con-in-japan, the-mandalorian-and-grogu, top-gun-40, top-gun-maverick-re`;

export async function chat(message: string) {
  const provider = pickProvider();

  const tools = await Promise.all([
    tool({
      name: "get_movies",
      description: "Obtiene películas en cartelera con filtros opcionales por ciudad, formato, idioma, estreno o género",
      parameters: v.object({
        city: v.optional(v.string()),
        format: v.optional(v.union([v.literal("2D"), v.literal("3D"), v.literal("XD"), v.literal("DBOX"), v.literal("PREMIUM")])),
        language: v.optional(v.union([v.literal("Doblada"), v.literal("Subtitulada")])),
        is_premiere: v.optional(v.union([v.literal("true"), v.literal("false")])),
        genre: v.optional(v.string()),
      }),
      execute: async ({ city, format, language, is_premiere, genre }) => {
        return JSON.stringify(await getMovies(
          city, format as any, language as any,
          is_premiere ? is_premiere === "true" : undefined,
          genre,
        ));
      },
    }),
    tool({
      name: "get_showtimes",
      description: "Obtiene horarios de funciones con filtros por película, cine, fecha, formato o idioma",
      parameters: v.object({
        movie_id: v.optional(v.string()),
        cinema_id: v.optional(v.string()),
        date: v.optional(v.string()),
        format: v.optional(v.union([v.literal("2D"), v.literal("3D"), v.literal("XD"), v.literal("DBOX"), v.literal("PREMIUM")])),
        language: v.optional(v.union([v.literal("Doblada"), v.literal("Subtitulada")])),
      }),
      execute: async ({ movie_id, cinema_id, date, format, language }) => {
        return JSON.stringify(await getShowtimes(movie_id, cinema_id, date, format as any, language as any));
      },
    }),
    tool({
      name: "get_cinemas",
      description: "Obtiene la lista de cines disponibles, opcionalmente filtrar por ciudad",
      parameters: v.object({
        city: v.optional(v.string()),
      }),
      execute: async ({ city }) => {
        return JSON.stringify(await getCinemas(city));
      },
    }),
    tool({
      name: "get_promotions",
      description: "Obtiene promociones activas, opcionalmente filtrar por tipo (discount, bank, loyalty) o BIN de tarjeta",
      parameters: v.object({
        type: v.optional(v.union([v.literal("discount"), v.literal("bank"), v.literal("loyalty")])),
        bank_bin: v.optional(v.string()),
      }),
      execute: async ({ type, bank_bin }) => {
        return JSON.stringify(await getPromotions(type, bank_bin));
      },
    }),
    tool({
      name: "get_recommendations",
      description: "Obtiene recomendaciones de películas, opcionalmente filtrar por género",
      parameters: v.object({
        genre: v.optional(v.string()),
      }),
      execute: async ({ genre }) => {
        return JSON.stringify(await getRecommendations(genre));
      },
    }),
    tool({
      name: "get_seat_layout",
      description: "Obtiene el mapa de asientos de una sala específica de un cine",
      parameters: v.object({
        cinema_id: v.string(),
        screen_number: v.number(),
      }),
      execute: async ({ cinema_id, screen_number }) => {
        return JSON.stringify(await getSeats(cinema_id, screen_number));
      },
    }),
    tool({
      name: "get_ticket_types",
      description: "Obtiene los tipos de boleto disponibles y sus precios, opcionalmente para un formato específico",
      parameters: v.object({
        cinema_id: v.optional(v.string()),
        format: v.optional(v.union([v.literal("2D"), v.literal("3D"), v.literal("XD"), v.literal("DBOX"), v.literal("PREMIUM")])),
      }),
      execute: async ({ cinema_id, format }) => {
        return JSON.stringify(await getTicketTypes(cinema_id, format as any));
      },
    }),
    tool({
      name: "get_concessions",
      description: "Obtiene los productos de confitería, opcionalmente filtrar por categoría (combos, palomitas, bebidas, complementos, combos-especiales)",
      parameters: v.object({
        category: v.optional(v.string()),
      }),
      execute: async ({ category }) => {
        return JSON.stringify(await getConcessions(category));
      },
    }),
    tool({
      name: "get_movie_details",
      description: "Obtiene los detalles completos de una película específica por su ID",
      parameters: v.object({
        movie_id: v.string(),
      }),
      execute: async ({ movie_id }) => {
        return JSON.stringify(await getMovieDetails(movie_id));
      },
    }),
  ]);

  const { text } = await generateText({
    ...provider,
    messages: [
      { role: "system", content: CINECHAN_SYSTEM_PROMPT },
      { role: "user", content: message },
    ],
    tools,
    maxSteps: 5,
  });

  return text;
}

function pickProvider(): { model: string; baseURL: string; apiKey: string } {
  const provider = process.env.LLM_PROVIDER || "ollama";

  if (provider === "openai" || process.env.OPENAI_API_KEY) {
    return {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      baseURL: process.env.OPENAI_URL || "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY || "",
    };
  }

  if (provider === "groq" || process.env.GROQ_API_KEY) {
    return {
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY || "",
    };
  }

  return {
    model: process.env.OLLAMA_MODEL || "qwen3:8b",
    baseURL: process.env.OLLAMA_URL || "http://127.0.0.1:11434/v1",
    apiKey: process.env.OLLAMA_API_KEY || "ollama",
  };
}

export { CINECHAN_SYSTEM_PROMPT };
