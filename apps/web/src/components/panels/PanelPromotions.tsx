import { usePromotions } from "#/lib/hooks/useCinemaData";
import { Tag, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "#/components/ui/card";

export function PanelPromotions() {
  const { data, isLoading, error } = usePromotions();

  if (isLoading) {
    return (
      <Card className="w-full h-24 flex items-center justify-center">
        <div className="w-full h-full bg-zinc-800/50 rounded-2xl animate-pulse" />
      </Card>
    );
  }

  if (error || !data?.promotions) {
    return null;
  }

  const promotions = data.promotions.slice(0, 1);

  return (
    <Card className="w-full relative overflow-hidden group shadow-[0_10px_40px_rgba(225,29,72,0.15)]">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/30 blur-[40px] rounded-full pointer-events-none group-hover:bg-primary/40 transition-colors" />

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Promo Destacada
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        {promotions.map((promo: any) => (
          <div key={promo.id} className="cursor-pointer">
            <h4 className="font-bold text-base text-white leading-tight mb-1">{promo.title || promo.name}</h4>
            <p className="text-xs text-white/70 line-clamp-2">{promo.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-primary text-white inline-flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Aplicar
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
