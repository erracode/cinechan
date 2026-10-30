import { useCinemaStore } from "#/store/cinema";
import { STEP_LABELS } from "#/lib/checkout-machine";
import { ChevronRight, ArrowLeft, Trash2, Ticket, Popcorn, Armchair } from "lucide-react";
import { cn } from "#/lib/utils";
import { nextStep, prevStep } from "#/lib/checkout-machine";
import { Card } from "#/components/ui/card";

export function PanelCheckout() {
  const checkoutStep = useCinemaStore((s) => s.checkoutStep);
  const cart = useCinemaStore((s) => s.cart);
  const selectedSeats = useCinemaStore((s) => s.selectedSeats);
  const setCheckoutStep = useCinemaStore((s) => s.setCheckoutStep);
  const removeTicket = useCinemaStore((s) => s.removeTicket);
  const removeConcession = useCinemaStore((s) => s.removeConcession);

  const ticketCount = cart.tickets.reduce((s, t) => s + t.quantity, 0);
  const concessionCount = cart.concessions.reduce((s, c) => s + c.quantity, 0);

  const stepIcons: Record<string, React.ReactNode> = {
    "movie-info": <Ticket className="w-3.5 h-3.5" />,
    "showtime-select": <Ticket className="w-3.5 h-3.5" />,
    "ticket-select": <Ticket className="w-3.5 h-3.5" />,
    "seat-select": <Armchair className="w-3.5 h-3.5" />,
    concessions: <Popcorn className="w-3.5 h-3.5" />,
    payment: <Ticket className="w-3.5 h-3.5" />,
  };

  return (
    <Card className="w-full h-full flex flex-col pointer-events-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
        <button
          onClick={() => {
            if (checkoutStep === "movie-info") {
              setCheckoutStep("idle");
            } else {
              setCheckoutStep(prevStep(checkoutStep));
            }
          }}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          {stepIcons[checkoutStep]}
          <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
            {STEP_LABELS[checkoutStep]}
          </h3>
        </div>
        <div className="w-7" />
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 px-5 py-2.5 border-b border-white/5 shrink-0">
        {(["movie-info", "showtime-select", "ticket-select", "seat-select", "concessions", "payment"] as const).map(
          (step) => {
            const stepIdx = ["movie-info", "showtime-select", "ticket-select", "seat-select", "concessions", "payment"].indexOf(step);
            const currentIdx = ["movie-info", "showtime-select", "ticket-select", "seat-select", "concessions", "payment"].indexOf(checkoutStep);
            const isActive = step === checkoutStep;
            const isComplete = stepIdx < currentIdx;

            return (
              <div
                key={step}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  isActive && "bg-primary scale-125",
                  isComplete && "bg-green-500",
                  !isActive && !isComplete && "bg-white/10",
                )}
              />
            );
          },
        )}
      </div>

      {/* Summary Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-3">
        {cart.tickets.length > 0 && (
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Boletas</h4>
            <div className="space-y-1.5">
              {cart.tickets.map((t) => (
                <div key={t.ticketTypeId} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-xs text-white/80 font-medium">{t.ticketTypeName}</p>
                    <p className="text-[10px] text-white/40">x{t.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">${(t.price * t.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeTicket(t.ticketTypeId)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-white/20 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSeats.length > 0 && (
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Asientos</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedSeats.map((s) => (
                <span key={s} className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {cart.concessions.length > 0 && (
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Confitería</h4>
            <div className="space-y-1.5">
              {cart.concessions.map((c) => (
                <div key={c.itemId} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-xs text-white/80 font-medium">{c.itemName}</p>
                    <p className="text-[10px] text-white/40">x{c.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">${(c.price * c.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeConcession(c.itemId)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-white/20 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ticketCount === 0 && selectedSeats.length === 0 && concessionCount === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-white/30">Aún no has agregado nada</p>
          </div>
        )}
      </div>

      {/* Total Footer */}
      {cart.total > 0 && (
        <div className="px-5 py-4 border-t border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/50">Total</span>
            <span className="text-lg font-black text-white">${cart.total.toFixed(2)}</span>
          </div>
          {checkoutStep !== "payment" && checkoutStep !== "success" && (
            <button
              onClick={() => setCheckoutStep(nextStep(checkoutStep))}
              className="w-full py-2.5 rounded-xl bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition-colors flex items-center justify-center gap-1"
            >
              Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
