import { useState } from "react";
import { useConcessions } from "#/lib/hooks/useCinemaData";
import { useCinemaStore } from "#/store/cinema";
import { Loader2, Minus, Plus, Popcorn, Coffee, Candy, Sandwich, ChevronRight } from "lucide-react";
import { cn } from "#/lib/utils";
import { nextStep } from "#/lib/checkout-machine";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  combos: <Popcorn className="w-4 h-4" />,
  palomitas: <Popcorn className="w-4 h-4" />,
  bebidas: <Coffee className="w-4 h-4" />,
  complementos: <Candy className="w-4 h-4" />,
  "combos-especiales": <Sandwich className="w-4 h-4" />,
};

export function ConcessionsPicker() {
  const { data, isLoading } = useConcessions();
  const addConcession = useCinemaStore((s) => s.addConcession);
  const setCheckoutStep = useCinemaStore((s) => s.setCheckoutStep);

  const categories = (data?.categories as any[]) || [];
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const activeCat = categories.find((c) => c.id === activeCategory);
  const items = activeCat?.items || [];

  const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (quantities[item.id] || 0), 0);

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
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleContinue = () => {
    items.forEach((item: any) => {
      const qty = quantities[item.id] || 0;
      if (qty > 0) {
        addConcession({
          itemId: item.id,
          itemName: item.name,
          quantity: qty,
          price: item.price || 0,
        });
      }
    });
    setCheckoutStep(nextStep("concessions"));
  };

  // Check for active promotions
  const hasPromo = categories.some((cat: any) =>
    cat.items?.some((item: any) => item.price < 10 && item.name.toLowerCase().includes("combo")),
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <h2 className="text-sm font-bold text-white">Confitería</h2>
        <p className="text-[10px] text-white/40 mt-0.5">Combos, snacks y bebidas</p>
      </div>

      {/* Agent Commentary */}
      <div className="px-4 py-3">
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-[11px] text-white/70 leading-relaxed">
            🍿 <span className="text-amber-400 font-semibold">Cinechan sugiere:</span> Los combos son la mejor opción — ahorras hasta $3 vs comprar por separado.
            {hasPromo && " ¡Hay combos especiales disponibles!"}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setQuantities({});
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors",
                activeCategory === cat.id
                  ? "bg-primary/20 text-primary"
                  : "bg-white/5 text-white/50 hover:bg-white/10",
              )}
            >
              {CATEGORY_ICONS[cat.id]}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 space-y-2">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                <p className="text-[10px] text-white/40 mt-0.5">{item.description}</p>
              </div>
              <p className="text-sm font-bold text-primary ml-3">${(item.price || 0).toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-[10px] text-white/30">Cantidad</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5 text-white/60" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">{quantities[item.id] || 0}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, 1)}
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
      <div className="px-4 py-3 border-t border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/50">{totalItems} item(s)</span>
          <span className="text-lg font-bold text-white">${totalPrice.toFixed(2)}</span>
        </div>
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          {totalItems > 0 ? "Ir al Pago" : "Sin Confitería"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
