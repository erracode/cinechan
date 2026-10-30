import { useState } from "react";
import { useTicketTypes } from "#/lib/hooks/useCinemaData";
import { useCinemaStore } from "#/store/cinema";
import { Loader2, Minus, Plus, Info, ChevronRight } from "lucide-react";
import { cn } from "#/lib/utils";
import { nextStep } from "#/lib/checkout-machine";
import type { CartItem } from "#/store/cinema";

const TICKET_DESCRIPTIONS: Record<string, string> = {
  general: "Boleto estándar para cualquier persona. Incluye acceso a la sala y formato seleccionado.",
  child: "Para niños de 2 a 11 años. Requiere acompañante adulto.",
  senior: "Para adultos mayores de 60 años. Presentar documento de identidad.",
  gold: "Precio especial para miembros Cine Club Gold. Beneficios adicionales incluidos.",
  pro: "Precio exclusivo para miembros PRO. Hasta 50% de descuento todos los días.",
};

export function TicketSelector() {
  const { data, isLoading } = useTicketTypes();
  const addTicket = useCinemaStore((s) => s.addTicket);
  const cart = useCinemaStore((s) => s.cart);
  const setCheckoutStep = useCinemaStore((s) => s.setCheckoutStep);
  const setAgentCommentary = useCinemaStore((s) => s.setAgentCommentary);

  const ticketTypes = (data?.ticketTypes as any[]) || [];
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const totalTickets = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = ticketTypes.reduce((sum, t) => sum + (t.price || 0) * (quantities[t.id] || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(20, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleContinue = () => {
    ticketTypes.forEach((t) => {
      const qty = quantities[t.id] || 0;
      if (qty > 0) {
        addTicket({
          ticketTypeId: t.id,
          ticketTypeName: t.name,
          quantity: qty,
          price: t.price || 0,
        });
      }
    });
    setAgentCommentary(
      `${totalTickets} boleta(s) agregada(s). Ahora selecciona tus asientos en la sala. Los asientos del centro son los más populares.`,
    );
    setCheckoutStep(nextStep("ticket-select"));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <h2 className="text-sm font-bold text-white">Selecciona Boletas</h2>
        <p className="text-[10px] text-white/40 mt-0.5">Elige el tipo y cantidad de boletas</p>
      </div>

      {/* Agent Info */}
      <div className="px-4 py-3">
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                <span className="text-blue-400 font-semibold">Tipos de boleta:</span>
              </p>
              <ul className="text-[10px] text-white/50 mt-1 space-y-0.5">
                <li>• <span className="text-white/70">General:</span> Acceso estándar</li>
                <li>• <span className="text-white/70">Niño (2-11):</span> Con acompañante</li>
                <li>• <span className="text-white/70">Adulto Mayor (60+):</span> Con ID</li>
                <li>• <span className="text-white/70">Gold:</span> Miembros Cine Club</li>
                <li>• <span className="text-white/70">PRO:</span> Membresía premium, hasta 50% off</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Types */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 space-y-2">
        {ticketTypes.map((t) => (
          <div
            key={t.id}
            className={cn(
              "p-3 rounded-xl border transition-all",
              t.isLoyaltyOnly
                ? "bg-purple-500/5 border-purple-500/10"
                : "bg-white/5 border-white/10",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                  {t.isLoyaltyOnly && (
                    <span className="text-[9px] font-bold text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">
                      Membresía
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/40 mt-0.5">{TICKET_DESCRIPTIONS[t.id] || t.description}</p>
              </div>
              <div className="text-right ml-3">
                <p className="text-sm font-bold text-primary">${(t.price || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-[10px] text-white/30">Cantidad</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(t.id, -1)}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5 text-white/60" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">{quantities[t.id] || 0}</span>
                <button
                  onClick={() => handleQuantityChange(t.id, 1)}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-white/60" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {totalTickets > 0 && (
        <div className="px-4 py-3 border-t border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/50">{totalTickets} boleta(s)</span>
            <span className="text-lg font-bold text-white">${totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Continuar a Asientos
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
