import { useMovies, useCinemas } from "#/lib/hooks/useCinemaData";
import { Film, Building2 } from "lucide-react";

export function PanelStats() {
  const { data: moviesData, isLoading: loadingMovies } = useMovies();
  const { data: cinemasData, isLoading: loadingCinemas } = useCinemas();

  const isLoading = loadingMovies || loadingCinemas;

  if (isLoading) {
    return (
      <div className="w-48 bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 pointer-events-auto">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
          Stats
        </span>
        <div className="mt-4 h-24 w-full bg-zinc-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  const moviesCount = moviesData?.movies?.length || 0;
  const cinemasCount = cinemasData?.cinemas?.length || 0;

  return (
    <div className="w-48 bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 pointer-events-auto flex flex-col gap-4">
      <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
        Stats
      </span>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Películas</span>
          </div>
          <span className="font-bold text-white">{moviesCount}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Cines</span>
          </div>
          <span className="font-bold text-white">{cinemasCount}</span>
        </div>
      </div>
    </div>
  );
}
