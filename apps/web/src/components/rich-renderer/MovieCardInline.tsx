import { useMovie } from "#/lib/hooks/useCinemaData";
import { useCinemaStore } from "#/store/cinema";
import { Star, Loader2 } from "lucide-react";

interface MovieCardInlineProps {
  movieId: string;
}

export function MovieCardInline({ movieId }: MovieCardInlineProps) {
  const { data, isLoading } = useMovie(movieId);
  const setSelectedMovie = useCinemaStore((s) => s.setSelectedMovie);

  const movie = data as Record<string, unknown> | undefined;

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  if (!movie) return null;

  const title = movie.title as string;
  const posterUrl = movie.posterUrl as string | undefined;
  const rating = movie.rating as string | undefined;
  const genre = movie.genre as string | undefined;

  return (
    <div
      onClick={() => setSelectedMovie(movieId)}
      className="inline-flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer my-2 max-w-full"
    >
      {posterUrl && (
        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 shadow-lg">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-bold text-white truncate">{title}</span>
        <div className="flex items-center gap-2 mt-1">
          {rating && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
              <Star className="w-2.5 h-2.5 fill-yellow-500" />
              {rating}
            </span>
          )}
          {genre && (
            <span className="text-[10px] text-muted-foreground border border-white/10 px-1.5 py-0.5 rounded-md truncate max-w-[80px]">
              {genre}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
