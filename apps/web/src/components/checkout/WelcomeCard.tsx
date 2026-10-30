import { Sparkles, Ticket, Popcorn } from "lucide-react";
import { useCinemaStore } from "#/store/cinema";

export function WelcomeCard() {
  const setCheckoutStep = useCinemaStore((s) => s.setCheckoutStep);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">¡Bienvenido a Cinechan!</h2>
      <p className="text-xs text-white/50 max-w-[240px] leading-relaxed mb-6">
        Tu asistente personal de cine. Elige una película, selecciona tus asientos y disfruta la experiencia.
      </p>

      <div className="w-full space-y-2">
        <button
          onClick={() => setCheckoutStep("movie-info")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Ver Cartelera</p>
            <p className="text-[10px] text-white/40">Explora las películas en exhibición</p>
          </div>
        </button>

        <button
          onClick={() => setCheckoutStep("concessions")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Popcorn className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Confitería</p>
            <p className="text-[10px] text-white/40">Combos y snacks disponibles</p>
          </div>
        </button>
      </div>
    </div>
  );
}
