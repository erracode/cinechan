import { useMovie, useShowtimes } from "#/lib/hooks/useCinemaData";
import { useCinemaStore } from "#/store/cinema";
import { Star, Clock, Calendar, MapPin, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { cn } from "#/lib/utils";
import { nextStep } from "#/lib/checkout-machine";

export function MovieDetailCard() {
  const selectedMovieId = useCinemaStore((s) => s.selectedMovieId);
  const selectedCinemaId = useCinemaStore((s) => s.selectedCinemaId);
  const setCheckoutStep = useCinemaStore((s) => s.setCheckoutStep);
  const setSelectedShowtime = useCinemaStore((s) => s.setSelectedShowtime);
  const setAgentCommentary = useCinemaStore((s) => s.setAgentCommentary);

  const { data: movie, isLoading: loadingMovie } = useMovie(selectedMovieId || "");
  const { data: showtimesData, isLoading: loadingShowtimes } = useShowtimes(
    selectedMovieId ? { movieId: selectedMovieId } : undefined,
  );

  const movieData = movie as any;
  const showtimes = (showtimesData?.showtimes as any[]) || [];

  const groupedByCinema = showtimes.reduce((acc: Record<string, any[]>, st) => {
    const key = st.cinemaName || st.cinemaId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(st);
    return acc;
  }, {});

  if (loadingMovie || loadingShowtimes) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!movieData) return null;

  const rottenUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(movieData.title)}`;
  const imdbUrl = `https://www.imdb.com/find?q=${encodeURIComponent(movieData.title)}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Poster + Info */}
        <div className="relative h-48 shrink-0">
          <img
            src={movieData.posterUrl}
            alt={movieData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-lg font-bold text-white leading-tight mb-1">{movieData.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {movieData.rating && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  {movieData.rating}
                </div>
              )}
              <span className="text-[10px] text-white/50">{movieData.genre}</span>
              <span className="flex items-center gap-1 text-[10px] text-white/50">
                <Clock className="w-3 h-3" />
                {movieData.duration} min
              </span>
            </div>
          </div>
        </div>

        {/* Agent Commentary */}
        <div className="px-4 py-3">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[11px] text-white/70 leading-relaxed">
              🎬 <span className="text-primary font-semibold">Cinechan dice:</span> "{movieData.title}" {movieData.genre.toLowerCase()} de {movieData.duration} minutos.
              {movieData.director ? ` Dirigida por ${movieData.director}.` : ""}
              {movieData.isPremiere ? " ¡Es un estreno! No te la pierdas." : ""}
            </p>
            <div className="mt-2 flex gap-2">
              <a
                href={rottenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Rotten Tomatoes
              </a>
              <a
                href={imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                IMDb
              </a>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <div className="px-4 pb-3">
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Sinopsis</h3>
          <p className="text-xs text-white/60 leading-relaxed">{movieData.synopsis}</p>
        </div>

        {/* Cast */}
        {movieData.actors && movieData.actors.length > 0 && (
          <div className="px-4 pb-3">
            <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Reparto</h3>
            <p className="text-xs text-white/50">{movieData.actors.join(", ")}</p>
          </div>
        )}

        {/* Showtimes */}
        <div className="px-4 pb-4">
          <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-3 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Horarios Disponibles
          </h3>

          {Object.keys(groupedByCinema).length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">No hay horarios disponibles</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedByCinema).map(([cinemaName, sts]) => (
                <div key={cinemaName}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-white">{cinemaName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(sts as any[]).map((st) => {
                      const time = new Date(st.datetime).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <button
                          key={st.id}
                          onClick={() => {
                            setSelectedShowtime(st.id);
                            setAgentCommentary(
                              `Horario seleccionado: ${time} en ${st.format} ${st.language}. Ahora elige cuántas boletas necesitas.`,
                            );
                            setCheckoutStep(nextStep("showtime-select"));
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
                            "bg-white/5 border-white/10 text-white/80 hover:bg-primary/20 hover:border-primary/30 hover:text-primary",
                          )}
                        >
                          {time}
                          <span className="text-[9px] text-white/30 ml-1">{st.format}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
