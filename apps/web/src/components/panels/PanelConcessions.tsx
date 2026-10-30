import { useConcessions } from "#/lib/hooks/useCinemaData";
import { Popcorn } from "lucide-react";

export function PanelConcessions() {
  const { data, isLoading, error } = useConcessions('combos');

  if (isLoading) {
    return (
      <div className="w-48 bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden p-4 pointer-events-auto">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
          Combos
        </span>
        <div className="mt-4 space-y-2">
          <div className="h-16 w-full bg-zinc-800 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data?.categories) {
    return null;
  }

  const combosCategory = (data.categories as any[]).find((cat: any) => cat.id === 'combos');
  const combos = combosCategory?.items?.slice(0, 2) || []; // Top 2 combos

  if (combos.length === 0) return null;

  return (
    <div className="w-48 bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden p-4 pointer-events-auto flex flex-col">
      <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold flex-shrink-0">
        Combos
      </span>
      
      <div className="mt-4 overflow-y-auto scrollbar-hide space-y-2 flex-1">
        {combos.map((combo: any) => (
          <div key={combo.id} className="p-2 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors cursor-pointer group flex items-start gap-2">
            <Popcorn className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-[11px] leading-tight text-white">{combo.name}</h4>
              <p className="text-[10px] text-primary font-bold mt-0.5">${(combo.price / 100).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
