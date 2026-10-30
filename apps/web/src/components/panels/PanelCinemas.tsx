import { useCinemas } from "#/lib/hooks/useCinemaData";
import { MapPin, Navigation, Video } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "#/components/ui/card";

export function PanelCinemas() {
  const { data, isLoading, error } = useCinemas();

  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <div className="w-full h-full bg-zinc-800/50 rounded-2xl animate-pulse" />
      </Card>
    );
  }

  if (error || !data?.cinemas) {
    return null;
  }

  const cinemas = data.cinemas.slice(0, 2);

  return (
    <Card className="w-full h-full flex flex-col pointer-events-auto overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Cines Cercanos</CardTitle>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Navigation className="w-3 h-3 text-primary" />
            Detectando...
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pt-0">
        {cinemas.map((cinema: any) => (
          <div key={cinema.id} className="group flex flex-col p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden">
            <div className="flex items-start justify-between z-10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{cinema.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{cinema.address || cinema.city}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 z-10 pl-11">
              {cinema.screens && Array.isArray(cinema.screens) && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                  <Video className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-white/70">{cinema.screens.length} Salas</span>
                </div>
              )}
              <div className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                2D • 3D • XD
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
