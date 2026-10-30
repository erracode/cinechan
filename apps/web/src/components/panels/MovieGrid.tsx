import { useMovies } from "#/lib/hooks/useCinemaData";
import { useCinemaStore } from "#/store/cinema";
import { Star, Loader2, Clapperboard } from "lucide-react";
import { cn } from "#/lib/utils";
import { ScrollArea } from "#/components/ui/scroll-area";

export function MovieGrid() {
  const { data, isLoading, error } = useMovies();
  const selectedMovieId = useCinemaStore((s) => s.selectedMovieId);
  const setSelectedMovie = useCinemaStore((s) => s.setSelectedMovie);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data?.movies) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Clapperboard className="w-12 h-12 text-white/10" />
        <p className="text-xs text-white/40 mt-3">No hay películas disponibles</p>
      </div>
    );
  }

  const movies = data.movies as any[];

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-4 px-2 shrink-0">
        En Cartelera
      </h3>

      <ScrollArea className="h-full">
        <div className="grid grid-cols-3 gap-3 px-2 pb-6 pr-10">
          {movies.map((movie) => {
            const isSelected = selectedMovieId === movie.id;
            return (
                <button
                  key={movie.id}
                  onClick={() => setSelectedMovie(movie.id)}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer",
                    isSelected
                      ? "ring-2 ring-primary/50 shadow-[0_0_20px_rgba(225,29,72,0.3)] scale-[1.03]"
                      : "hover:scale-[1.02]",
                  )}
                >
                <div className="aspect-[2/3] relative">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {movie.isPremiere && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-primary text-white text-[8px] font-bold uppercase tracking-wider">
                      Estreno
                    </div>
                  )}

                  {movie.isReRelease && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/80 text-white text-[8px] font-bold uppercase tracking-wider">
                      Reestreno
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h4 className="font-bold text-[11px] text-white leading-tight line-clamp-2 mb-1.5">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {movie.rating && (
                        <div className="flex items-center gap-0.5 text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                          <Star className="w-2.5 h-2.5 fill-yellow-400" />
                          {movie.rating}
                        </div>
                      )}
                      <span className="text-[9px] text-white/50">{movie.genre}</span>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {(movie.formats || ["2D"]).slice(0, 3).map((f: string) => (
                        <span
                          key={f}
                          className="text-[8px] font-bold text-white/60 bg-white/10 px-1.5 py-0.5 rounded"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
