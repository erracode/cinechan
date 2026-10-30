import * as v from "valibot";
import { toJsonSchema, type JsonSchema } from "@valibot/to-json-schema";
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
import type { ScreenFormat, Language } from "@cinechan/shared";

/**
 * Single source of truth for the agent's tools.
 *
 * Schemas are authored with Valibot and converted to JSON Schema for
 * Workers AI's native function-calling format (`{ name, description,
 * parameters }`). See ADR 0001.
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: JsonSchema;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

const FORMATS = ["2D", "3D", "XD", "DBOX", "PREMIUM"] as const;

export const tools: ToolDefinition[] = [
  {
    name: "get_movies",
    description:
      "Películas en cartelera. Filtros opcionales: ciudad, formato, idioma, estreno, género.",
    parameters: toJsonSchema(
      v.object({
        city: v.optional(v.string()),
        format: v.optional(v.picklist(FORMATS)),
        language: v.optional(v.picklist(["Doblada", "Subtitulada"])),
        is_premiere: v.optional(v.boolean()),
        genre: v.optional(v.string()),
      }),
    ),
    execute: async (a) =>
      JSON.stringify(
        await getMovies(
          a.city as string | undefined,
          a.format as ScreenFormat | undefined,
          a.language as Language | undefined,
          a.is_premiere as boolean | undefined,
          a.genre as string | undefined,
        ),
      ),
  },
  {
    name: "get_showtimes",
    description: "Horarios de funciones. Filtros: película, cine, fecha, formato, idioma.",
    parameters: toJsonSchema(
      v.object({
        movie_id: v.optional(v.string()),
        cinema_id: v.optional(v.string()),
        date: v.optional(v.string()),
        format: v.optional(v.picklist(FORMATS)),
        language: v.optional(v.picklist(["Doblada", "Subtitulada"])),
      }),
    ),
    execute: async (a) =>
      JSON.stringify(
        await getShowtimes(
          a.movie_id as string | undefined,
          a.cinema_id as string | undefined,
          a.date as string | undefined,
          a.format as ScreenFormat | undefined,
          a.language as Language | undefined,
        ),
      ),
  },
  {
    name: "get_cinemas",
    description: "Lista de cines, opcionalmente filtrada por ciudad.",
    parameters: toJsonSchema(v.object({ city: v.optional(v.string()) })),
    execute: async (a) => JSON.stringify(await getCinemas(a.city as string | undefined)),
  },
  {
    name: "get_promotions",
    description: "Promociones activas. Filtros: tipo (discount, bank, loyalty) o BIN de tarjeta.",
    parameters: toJsonSchema(
      v.object({
        type: v.optional(v.picklist(["discount", "bank", "loyalty"])),
        bank_bin: v.optional(v.string()),
      }),
    ),
    execute: async (a) =>
      JSON.stringify(
        await getPromotions(
          a.type as "discount" | "bank" | "loyalty" | undefined,
          a.bank_bin as string | undefined,
        ),
      ),
  },
  {
    name: "get_recommendations",
    description: "Recomendaciones de películas, opcionalmente por género.",
    parameters: toJsonSchema(v.object({ genre: v.optional(v.string()) })),
    execute: async (a) =>
      JSON.stringify(await getRecommendations(a.genre as string | undefined)),
  },
  {
    name: "get_movie_details",
    description: "Detalles completos de una película por su ID.",
    parameters: toJsonSchema(v.object({ movie_id: v.string() })),
    execute: async (a) => JSON.stringify(await getMovieDetails(a.movie_id as string)),
  },
  {
    name: "get_seat_layout",
    description: "Mapa de asientos de una sala de un cine.",
    parameters: toJsonSchema(
      v.object({ cinema_id: v.string(), screen_number: v.number() }),
    ),
    execute: async (a) =>
      JSON.stringify(await getSeats(a.cinema_id as string, a.screen_number as number)),
  },
  {
    name: "get_ticket_types",
    description: "Tipos de boleto y precios, opcionalmente por formato.",
    parameters: toJsonSchema(
      v.object({
        cinema_id: v.optional(v.string()),
        format: v.optional(v.picklist(FORMATS)),
      }),
    ),
    execute: async (a) =>
      JSON.stringify(
        await getTicketTypes(
          a.cinema_id as string | undefined,
          a.format as ScreenFormat | undefined,
        ),
      ),
  },
  {
    name: "get_concessions",
    description: "Productos de confitería. Categorías: combos, palomitas, bebidas, complementos.",
    parameters: toJsonSchema(v.object({ category: v.optional(v.string()) })),
    execute: async (a) =>
      JSON.stringify(await getConcessions(a.category as string | undefined)),
  },
];

export const toolsByName = new Map(tools.map((t) => [t.name, t]));
