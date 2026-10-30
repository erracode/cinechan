import { useCinemaStore } from "#/store/cinema";
import { CheckCircle, Download, Ticket, ArrowLeft } from "lucide-react";

export function SuccessPlaceholder() {
  const cart = useCinemaStore((s) => s.cart);
  const resetCheckout = useCinemaStore((s) => s.resetCheckout);

  const orderId = `CH-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>

      <h2 className="text-lg font-bold text-white mb-1">¡Compra Exitosa!</h2>
      <p className="text-xs text-white/50 mb-6">Tu pedido ha sido procesado correctamente</p>

      <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40">Orden</span>
          <span className="text-xs font-bold text-white font-mono">{orderId}</span>
        </div>

        {cart.tickets.length > 0 && (
          <div className="flex items-center justify-between py-1.5 border-t border-white/5">
            <span className="text-xs text-white/60">Boletas</span>
            <span className="text-xs font-semibold text-white">
              {cart.tickets.reduce((s, t) => s + t.quantity, 0)} unidades
            </span>
          </div>
        )}

        {cart.seats.length > 0 && (
          <div className="flex items-center justify-between py-1.5 border-t border-white/5">
            <span className="text-xs text-white/60">Asientos</span>
            <span className="text-xs font-semibold text-white">{cart.seats.join(", ")}</span>
          </div>
        )}

        <div className="flex items-center justify-between py-1.5 border-t border-white/5 mt-2">
          <span className="text-sm font-bold text-white">Total pagado</span>
          <span className="text-lg font-black text-green-400">${cart.total.toFixed(2)}</span>
        </div>
      </div>

      {/* QR Placeholder */}
      <div className="w-32 h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <div className="text-center">
          <Ticket className="w-8 h-8 text-white/20 mx-auto mb-1" />
          <p className="text-[9px] text-white/30">QR Placeholder</p>
        </div>
      </div>

      <div className="w-full space-y-2">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-semibold hover:bg-white/10 transition-colors">
          <Download className="w-4 h-4" />
          Descargar Factura
        </button>

        <button
          onClick={resetCheckout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}
