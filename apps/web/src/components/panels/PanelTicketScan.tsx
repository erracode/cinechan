import { QrCode } from "lucide-react";

export function PanelTicketScan() {
  return (
    <div className="w-48 bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col gap-4 pointer-events-auto">
      <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
        Boletería
      </span>
      <button className="h-10 w-full bg-primary/20 border border-primary/50 hover:bg-primary/30 transition-colors rounded-lg flex items-center justify-center gap-2 group">
        <QrCode className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold text-primary">
          SCAN TICKET
        </span>
      </button>
    </div>
  );
}
