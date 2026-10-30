import { X, Minus, Square } from "lucide-react";

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

export function LeftColumn() {
  return (
    <div className="flex flex-col gap-4 w-full h-full max-w-[320px] pointer-events-auto">
      {/* Resumen Actual Panel */}
      <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex-shrink-0">
        <PanelHeader title="Resumen Actual" />
        <div className="space-y-2 text-sm text-foreground/90">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Película:</span>
            <span className="font-medium text-right">Dune Part 2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Func:</span>
            <span className="font-medium text-right">2:30 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sala:</span>
            <span className="font-medium text-right">XD, 2 Adultos</span>
          </div>
        </div>
      </div>

      {/* Detalles Película Panel */}
      <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex-1 flex flex-col min-h-0">
        <PanelHeader title="Detalles Película" />
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
          {/* Poster Placeholder */}
          <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800/50 border border-white/5 relative">
            <img 
              src="https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjcNs3.jpg" 
              alt="Dune Part 2"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-2">Dune Part 2</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paul Atreides se une a Chani y a los Fremen mientras emprende una guerra de venganza contra los conspiradores que destruyeron a su familia. Al enfrentarse a una elección entre el amor de su vida y el destino del universo conocido, se esfuerza por evitar un futuro terrible que solo él puede prever.
            </p>
          </div>
        </div>
        
        <div className="pt-4 mt-4 border-t border-white/10">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total Actual:</span>
            <span className="text-primary">$34.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
