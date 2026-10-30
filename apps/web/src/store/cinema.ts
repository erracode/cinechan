import { create } from "zustand";

export type CheckoutStep =
  | "idle"
  | "movie-info"
  | "showtime-select"
  | "ticket-select"
  | "seat-select"
  | "concessions"
  | "payment"
  | "success";

export interface CartItem {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  price: number;
}

export interface ConcessionItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

export interface Cart {
  tickets: CartItem[];
  seats: string[];
  concessions: ConcessionItem[];
  showtimeId: string | null;
  cinemaId: string | null;
  screenNumber: number | null;
  format: string | null;
  total: number;
}

interface CinemaStore {
  selectedMovieId: string | null;
  selectedShowtimeId: string | null;
  selectedSeats: string[];
  selectedCity: string | null;
  selectedCinemaId: string | null;
  checkoutStep: CheckoutStep;
  cart: Cart;

  setSelectedMovie: (id: string | null) => void;
  setSelectedShowtime: (id: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  setSelectedCinema: (cinemaId: string | null) => void;
  setCheckoutStep: (step: CheckoutStep) => void;
  toggleSeat: (id: string) => void;
  addTicket: (item: CartItem) => void;
  removeTicket: (ticketTypeId: string) => void;
  updateTicketQuantity: (ticketTypeId: string, quantity: number) => void;
  addConcession: (item: ConcessionItem) => void;
  removeConcession: (itemId: string) => void;
  updateConcessionQuantity: (itemId: string, quantity: number) => void;
  recalculateTotal: () => void;
  clearCart: () => void;
  clearSelection: () => void;
  resetCheckout: () => void;
}

const emptyCart: Cart = {
  tickets: [],
  seats: [],
  concessions: [],
  showtimeId: null,
  cinemaId: null,
  screenNumber: null,
  format: null,
  total: 0,
};

export const useCinemaStore = create<CinemaStore>()((set, get) => ({
  selectedMovieId: null,
  selectedShowtimeId: null,
  selectedSeats: [],
  selectedCity: null,
  selectedCinemaId: null,
  checkoutStep: "idle",
  cart: { ...emptyCart },

  setSelectedMovie: (id) =>
    set({
      selectedMovieId: id,
      selectedShowtimeId: null,
      selectedSeats: [],
      checkoutStep: id ? "movie-info" : "idle",
      cart: { ...emptyCart },
    }),

  setSelectedShowtime: (id) => {
    set({ selectedShowtimeId: id });
    const cart = get().cart;
    if (id && cart.showtimeId !== id) {
      set({ cart: { ...cart, showtimeId: id } });
    }
  },

  setSelectedCity: (city) => set({ selectedCity: city, selectedCinemaId: null }),

  setSelectedCinema: (cinemaId) => {
    set({ selectedCinemaId: cinemaId });
    const cart = get().cart;
    if (cinemaId) {
      set({ cart: { ...cart, cinemaId } });
    }
  },

  setCheckoutStep: (step) => set({ checkoutStep: step }),

  toggleSeat: (id) =>
    set((state) => {
      const seats = state.selectedSeats.includes(id)
        ? state.selectedSeats.filter((s) => s !== id)
        : [...state.selectedSeats, id];
      return {
        selectedSeats: seats,
        cart: { ...state.cart, seats },
      };
    }),

  addTicket: (item) =>
    set((state) => {
      const existing = state.cart.tickets.find((t) => t.ticketTypeId === item.ticketTypeId);
      let tickets: CartItem[];
      if (existing) {
        tickets = state.cart.tickets.map((t) =>
          t.ticketTypeId === item.ticketTypeId
            ? { ...t, quantity: t.quantity + item.quantity }
            : t,
        );
      } else {
        tickets = [...state.cart.tickets, item];
      }
      const total = calculateTotal(tickets, state.cart.concessions);
      return { cart: { ...state.cart, tickets, total } };
    }),

  removeTicket: (ticketTypeId) =>
    set((state) => {
      const tickets = state.cart.tickets.filter((t) => t.ticketTypeId !== ticketTypeId);
      const total = calculateTotal(tickets, state.cart.concessions);
      return { cart: { ...state.cart, tickets, total } };
    }),

  updateTicketQuantity: (ticketTypeId, quantity) =>
    set((state) => {
      const tickets = state.cart.tickets
        .map((t) =>
          t.ticketTypeId === ticketTypeId ? { ...t, quantity } : t,
        )
        .filter((t) => t.quantity > 0);
      const total = calculateTotal(tickets, state.cart.concessions);
      return { cart: { ...state.cart, tickets, total } };
    }),

  addConcession: (item) =>
    set((state) => {
      const existing = state.cart.concessions.find((c) => c.itemId === item.itemId);
      let concessions: ConcessionItem[];
      if (existing) {
        concessions = state.cart.concessions.map((c) =>
          c.itemId === item.itemId
            ? { ...c, quantity: c.quantity + item.quantity }
            : c,
        );
      } else {
        concessions = [...state.cart.concessions, item];
      }
      const total = calculateTotal(state.cart.tickets, concessions);
      return { cart: { ...state.cart, concessions, total } };
    }),

  removeConcession: (itemId) =>
    set((state) => {
      const concessions = state.cart.concessions.filter((c) => c.itemId !== itemId);
      const total = calculateTotal(state.cart.tickets, concessions);
      return { cart: { ...state.cart, concessions, total } };
    }),

  updateConcessionQuantity: (itemId, quantity) =>
    set((state) => {
      const concessions = state.cart.concessions
        .map((c) =>
          c.itemId === itemId ? { ...c, quantity } : c,
        )
        .filter((c) => c.quantity > 0);
      const total = calculateTotal(state.cart.tickets, concessions);
      return { cart: { ...state.cart, concessions, total } };
    }),

  recalculateTotal: () =>
    set((state) => {
      const total = calculateTotal(state.cart.tickets, state.cart.concessions);
      return { cart: { ...state.cart, total } };
    }),

  clearCart: () => set({ cart: { ...emptyCart } }),

  clearSelection: () =>
    set({
      selectedMovieId: null,
      selectedShowtimeId: null,
      selectedSeats: [],
      selectedCity: null,
      selectedCinemaId: null,
      checkoutStep: "idle",
      cart: { ...emptyCart },
    }),

  resetCheckout: () =>
    set({
      selectedMovieId: null,
      selectedShowtimeId: null,
      selectedSeats: [],
      checkoutStep: "idle",
      cart: { ...emptyCart },
    }),
}));

function calculateTotal(tickets: CartItem[], concessions: ConcessionItem[]): number {
  const ticketsTotal = tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const concessionsTotal = concessions.reduce((sum, c) => sum + c.price * c.quantity, 0);
  return Math.round((ticketsTotal + concessionsTotal) * 100) / 100;
}
