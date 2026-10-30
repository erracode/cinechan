import { useCinemaStore } from "#/store/cinema";
import { CreditCard, Wallet, Ticket, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "#/lib/utils";
import { useState } from "react";

export function PaymentCard() {
  const cart = useCinemaStore((s) => s.cart);
  const selectedSeats = useCinemaStore((s) => s.selectedSeats);
  const setCheckoutStep = useCinemaStore((s) => s.setCheckoutStep);

  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [processing, setProcessing] = useState(false);

  const ticketTotal = cart.tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const concessionTotal = cart.concessions.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const grandTotal = ticketTotal + concessionTotal;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCheckoutStep("success");
    }, 2000);
  };

  const paymentMethods = [
    { id: "card", name: "Tarjeta de Crédito/Débito", icon: <CreditCard className="w-5 h-5" /> },
    { id: "pse", name: "PSE", icon: <Wallet className="w-5 h-5" /> },
    { id: "cineclub", name: "Cine Club", icon: <Ticket className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <h2 className="text-sm font-bold text-white">Pago</h2>
        <p className="text-[10px] text-white/40 mt-0.5">Revisa tu pedido y selecciona método de pago</p>
      </div>

      {/* Order Summary */}
      <div className="px-4 py-3 space-y-3">
        {cart.tickets.length > 0 && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Boletas</h3>
            {cart.tickets.map((t) => (
              <div key={t.ticketTypeId} className="flex items-center justify-between py-1">
                <span className="text-xs text-white/70">{t.quantity}x {t.ticketTypeName}</span>
                <span className="text-xs font-semibold text-white">${(t.price * t.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {selectedSeats.length > 0 && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Asientos</h3>
            <div className="flex flex-wrap gap-1">
              {selectedSeats.map((s) => (
                <span key={s} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {cart.concessions.length > 0 && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Confitería</h3>
            {cart.concessions.map((c) => (
              <div key={c.itemId} className="flex items-center justify-between py-1">
                <span className="text-xs text-white/70">{c.quantity}x {c.itemName}</span>
                <span className="text-xs font-semibold text-white">${(c.price * c.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
          <span className="text-sm font-bold text-white">Total</span>
          <span className="text-xl font-black text-primary">${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-4 py-3">
        <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Método de Pago</h3>
        <div className="space-y-1.5">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
                paymentMethod === method.id
                  ? "bg-primary/10 border-primary/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10",
              )}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", paymentMethod === method.id ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40")}>
                {method.icon}
              </div>
              <span className="text-xs font-semibold text-white">{method.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pay Button */}
      <div className="px-4 py-3 mt-auto">
        <button
          onClick={handlePay}
          disabled={processing}
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
            processing
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90",
          )}
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Pagar ${grandTotal.toFixed(2)}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
