import { useMovies } from "#/lib/hooks/useCinemaData";
import { useCinemaStore } from "#/store/cinema";
import { Star, PlayCircle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export function PanelPopularMovies() {
  const { data, isLoading, error } = useMovies();
  const selectedMovieId = useCinemaStore((s) => s.selectedMovieId);
  const setSelectedMovie = useCinemaStore((s) => s.setSelectedMovie);

  if (isLoading) {
    return (
      <div className="w-[360px] bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center h-[45vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data?.movies) {
    return null;
  }

  const movies = data.movies.slice(0, 4);

  return (
    <div className="w-[360px] bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-5 shadow-2xl flex flex-col pointer-events-auto flex-1 overflow-hidden min-h-[40vh]">
      
      <div className="flex items-center justify-between mb-5 px-2">
        <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
          En Cartelera
        </h3>
        <span className="text-[10px] text-primary font-bold cursor-pointer hover:underline">
          Ver Todo
        </span>
      </div>
      
      <div className="overflow-y-auto scrollbar-hide space-y-3 flex-1 px-2 pb-4 mask-linear-fade-bottom">
        {movies.map((movie: any) => (
          <div 
            key={movie.id} 
            onClick={() => setSelectedMovie(movie.id)}
            className={cn(
              "group relative flex gap-4 p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden",
              selectedMovieId === movie.id
                ? "border-primary/40 bg-primary/10"
                : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Poster */}
            <div className="w-16 h-24 rounded-xl overflow-hidden shrink-0 shadow-lg relative">
              <img 
                src={movie.posterUrl || movie.poster} 
                alt={movie.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center flex-1 min-w-0 z-10">
              <h4 className="font-bold text-sm text-white truncate mb-1 group-hover:text-primary transition-colors">
                {movie.title}
              </h4>
              
              <div className="flex items-center gap-2 mb-2">
                {movie.rating && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
                    <Star className="w-2.5 h-2.5 fill-yellow-500" />
                    <span>{movie.rating}</span>
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground border border-white/10 px-1.5 py-0.5 rounded-md truncate max-w-[80px]">
                  {movie.genre || "Acción"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/70 group-hover:text-white transition-colors">
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Ver Info y Horarios</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
