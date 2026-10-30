import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { useSeatLayout, useMovie, useShowtimes } from "#/lib/hooks/useCinemaData";
import { useCinemaStore } from "#/store/cinema";
import { Calendar, Users, MapPin, Loader2, ChevronRight, Play } from "lucide-react";
import { nextStep } from "#/lib/checkout-machine";

const SeatIcon = ({
  status,
  onClick,
}: {
  status: "available" | "selected" | "reserved" | "empty";
  onClick?: () => void;
}) => {
  if (status === "empty") return <div className="w-6 h-6" />;

  const isAvailable = status === "available";
  const isSelected = status === "selected";
  const isReserved = status === "reserved";

  return (
    <div
      onClick={isAvailable || isSelected ? onClick : undefined}
      className={cn(
        "w-6 h-6 relative group transition-transform duration-300",
        (isAvailable || isSelected) && "cursor-pointer hover:scale-110 active:scale-95",
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M5 4C5 3.44772 5.44772 3 6 3H18C18.5523 3 19 3.44772 19 4V9H5V4Z"
          className={cn(
            "transition-colors duration-300",
            isAvailable && "fill-zinc-800 group-hover:fill-zinc-700",
            isSelected && "fill-primary",
            isReserved && "fill-zinc-900/50",
          )}
        />
        <rect
          x="4" y="10" width="16" height="6" rx="1"
          className={cn(
            "transition-colors duration-300",
            isAvailable && "fill-zinc-700 group-hover:fill-zinc-600",
            isSelected && "fill-primary shadow-[0_0_10px_rgba(225,29,72,0.8)]",
            isReserved && "fill-zinc-900",
          )}
        />
        <rect
          x="3" y="8" width="2" height="10" rx="1"
          className={cn(
            "transition-colors duration-300",
            isAvailable && "fill-zinc-600 group-hover:fill-zinc-500",
            isSelected && "fill-primary/80",
            isReserved && "fill-zinc-900",
          )}
        />
        <rect
          x="19" y="8" width="2" height="10" rx="1"
          className={cn(
            "transition-colors duration-300",
            isAvailable && "fill-zinc-600 group-hover:fill-zinc-500",
            isSelected && "fill-primary/80",
            isReserved && "fill-zinc-900",
          )}
        />
      </svg>
    </div>
  );
};

export function PanelSeatPicker() {
  const selectedMovieId = useCinemaStore((s) => s.selectedMovieId);
  const selectedSeats = useCinemaStore((s) => s.selectedSeats);
  const selectedShowtimeId = useCinemaStore((s) => s.selectedShowtimeId);
  const toggleSeat = useCinemaStore((s) => s.toggleSeat);
  const setCheckoutStep = useCinemaStore((s) => s.setCheckoutStep);
  const setAgentCommentary = useCinemaStore((s) => s.setAgentCommentary);

  const movieId = selectedMovieId || "the-mandalorian-and-grogu";
  const cinemaId = "2400";
  const screenNumber = 3;

  const { data: movie, isLoading: loadingMovie } = useMovie(movieId);
  const { isLoading: loadingLayout } = useSeatLayout(cinemaId, screenNumber);
  const { data: showtimesData } = useShowtimes(
    selectedShowtimeId ? undefined : selectedMovieId ? { movieId: selectedMovieId } : undefined,
  );

  const [showTrailer, setShowTrailer] = useState(false);

  const isLoading = loadingMovie || loadingLayout;

  const movieData = movie as { title?: string; posterUrl?: string; trailerUrl?: string } | undefined;
  const trailerUrl = movieData?.trailerUrl || "";

  const showtimes = (showtimesData?.showtimes as any[]) || [];
  const selectedShowtime = showtimes.find((s) => s.id === selectedShowtimeId);

  const timeLabel = selectedShowtime
    ? new Date(selectedShowtime.datetime).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
    : "2:30 PM";

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const cols = 10;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const handleContinue = () => {
    setAgentCommentary(
      selectedSeats.length > 0
        ? `${selectedSeats.length} asiento(s) seleccionado(s). ¿Quieres agregar confitería antes de pagar?`
        : "No seleccionaste asientos, pero puedes continuar igual.",
    );
    setCheckoutStep(nextStep("seat-select"));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Selecciona Asientos</h2>
          {trailerUrl && (
            <button
              onClick={() => setShowTrailer(!showTrailer)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors",
                showTrailer ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/50 hover:bg-white/10",
              )}
            >
              <Play className="w-3 h-3" />
              Trailer
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <Calendar className="w-3 h-3" />
            {timeLabel}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <Users className="w-3 h-3" />
            {selectedSeats.length} asiento(s)
          </div>
        </div>
      </div>

      {/* Screen / Trailer */}
      <div className="relative w-full h-[100px] flex justify-center perspective-[800px] mt-4 mb-8 shrink-0 px-4">
        {showTrailer && trailerUrl ? (
          <div className="w-[90%] h-full rounded-xl overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
            <iframe
              src={`${trailerUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&modestbranding=1&playsinline=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Trailer"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-zinc-950/60 to-transparent" />
          </div>
        ) : (
          <>
            <div className="w-[140%] h-full rounded-t-[50%] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotateX-[30deg] border-t border-white/20">
              {movieData?.posterUrl && (
                <img
                  src={movieData.posterUrl}
                  className="absolute inset-0 w-full h-[200%] object-cover object-top opacity-40 mix-blend-screen"
                  alt="Screen"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            </div>
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-primary/20 blur-[40px] rounded-[100%] opacity-60 pointer-events-none" />
            <span className="absolute top-[30%] text-[8px] text-white/30 uppercase tracking-[0.3em] font-black pointer-events-none">
              PANTALLA
            </span>
          </>
        )}
      </div>

      {/* Seat Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 relative z-10">
        <div className="flex flex-col gap-3 items-center pb-4">
          {rows.map((row, rowIndex) => (
            <div key={row} className="flex items-center gap-1.5">
              {Array.from({ length: cols }).map((_, colIndex) => {
                const id = `${row}${colIndex + 1}`;

                let status: "available" | "selected" | "reserved" | "empty" = "available";
                if (colIndex === 4 || colIndex === 5) {
                  if (rowIndex > 1 && rowIndex < 6) return <SeatIcon key={id} status="empty" />;
                }

                if (rowIndex === 3 && (colIndex === 2 || colIndex === 3)) status = "reserved";
                if (rowIndex === 5 && colIndex > 6) status = "reserved";
                if (selectedSeats.includes(id)) status = "selected";

                const distanceFromCenter = Math.abs(colIndex - (cols - 1) / 2);
                const yOffset = Math.pow(distanceFromCenter, 1.5) * 1.5;

                return (
                  <div key={id} style={{ transform: `translateY(${yOffset}px)` }}>
                    <SeatIcon status={status} onClick={() => toggleSeat(id)} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-zinc-800" />
            <span className="text-[9px] text-white/40">Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-[9px] text-white/40">Seleccionado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-zinc-900/50" />
            <span className="text-[9px] text-white/40">Ocupado</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 shrink-0">
        <button
          onClick={handleContinue}
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
            selectedSeats.length === 0
              ? "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
              : "bg-primary text-white hover:bg-primary/90",
          )}
        >
          {selectedSeats.length > 0 ? `${selectedSeats.length} Asiento(s) — Continuar` : "Continuar sin asientos"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
