import { cn } from "../../lib/utils";
import { X, Minus, Square, Sparkles } from "lucide-react";

interface PanelHeaderProps {
  title: string;
}

function PanelHeader({ title }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="flex items-center gap-2 text-muted-foreground/50">
        <Minus className="w-3 h-3 hover:text-white cursor-pointer" />
        <Square className="w-3 h-3 hover:text-white cursor-pointer" />
        <X className="w-3 h-3 hover:text-white cursor-pointer" />
      </div>
    </div>
  );
}

export function RightColumn() {
  return (
    <div className="flex flex-col gap-4 w-full h-full max-w-[360px] pointer-events-auto">
      {/* Seat Picker Panel */}
      <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex-1 flex flex-col">
        <PanelHeader title="Seatpicker" />
        
        <div className="mb-4">
          <h4 className="text-sm font-bold uppercase tracking-wider">Selecciona tus asientos</h4>
          <p className="text-xs text-muted-foreground mt-1">(Dune Part 2, 2:30 PM) • Sala XD</p>
        </div>

        {/* Legends */}
        <div className="flex items-center gap-4 mb-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-white/20 border border-white/10" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary border border-primary" />
            <span className="text-primary">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-black/50 border border-white/5" />
            <span>Reserved</span>
          </div>
        </div>

        {/* Seat Map Placeholder */}
        <div className="flex-1 min-h-[200px] bg-green-100/5 rounded-2xl border border-white/5 p-4 flex flex-col items-center justify-center relative overflow-hidden mb-6">
          {/* Decorative Screen Curve */}
          <div className="w-4/5 h-8 border-t-4 border-primary/40 rounded-t-[100%] absolute top-4 flex items-center justify-center">
             <span className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mt-4">Screen</span>
          </div>

          {/* Simple Grid Representation */}
          <div className="mt-8 grid grid-cols-8 gap-2 opacity-60">
            {Array.from({ length: 48 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-5 h-5 rounded-md border",
                  i === 35 || i === 36 ? "bg-primary border-primary shadow-[0_0_10px_rgba(225,29,72,0.5)]" : // Selected
                  i === 22 || i === 23 || i === 38 ? "bg-black/50 border-white/5" : // Reserved
                  "bg-white/10 border-white/10 hover:bg-white/20 cursor-pointer transition-colors" // Available
                )}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-auto">
          <div className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Asientos:</span>
            <span className="text-sm font-bold text-white">H7, H8</span>
          </div>
          
          <button className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>Confirmar Asientos</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
