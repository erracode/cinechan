import type { CheckoutStep } from "#/store/cinema";

const STEP_ORDER: CheckoutStep[] = [
  "idle",
  "movie-info",
  "showtime-select",
  "ticket-select",
  "seat-select",
  "concessions",
  "payment",
  "success",
];

export function nextStep(current: CheckoutStep): CheckoutStep {
  const idx = STEP_ORDER.indexOf(current);
  if (idx < 0 || idx >= STEP_ORDER.length - 1) return current;
  return STEP_ORDER[idx + 1];
}

export function prevStep(current: CheckoutStep): CheckoutStep {
  const idx = STEP_ORDER.indexOf(current);
  if (idx <= 0) return "idle";
  return STEP_ORDER[idx - 1];
}

export function canProceed(current: CheckoutStep, context: {
  selectedMovieId: string | null;
  selectedShowtimeId: string | null;
  selectedSeats: string[];
  ticketCount: number;
}): boolean {
  switch (current) {
    case "movie-info":
      return !!context.selectedMovieId;
    case "showtime-select":
      return !!context.selectedShowtimeId;
    case "ticket-select":
      return context.ticketCount > 0;
    case "seat-select":
      return context.selectedSeats.length > 0;
    case "concessions":
      return true;
    case "payment":
      return context.ticketCount > 0;
    default:
      return false;
  }
}

export const STEP_LABELS: Record<CheckoutStep, string> = {
  idle: "Inicio",
  "movie-info": "Película",
  "showtime-select": "Horario",
  "ticket-select": "Boletas",
  "seat-select": "Asientos",
  concessions: "Confitería",
  payment: "Pago",
  success: "¡Listo!",
};
