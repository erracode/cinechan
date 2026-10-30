import { useShowtimes } from "#/lib/hooks/useCinemaData";
import { useCinemaStore } from "#/store/cinema";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { nextStep } from "#/lib/checkout-machine";

export function ShowtimePicker() {
  const selectedMovieId = useCinemaStore((s) => s.selectedMovieId);
  const selectedCinemaId = useCinemaStore((s) => s.selectedCinemaId);
  const setSelectedShowtime = useCinemaStore((s) => s.setSelectedShowtime);
  const setCheckoutStep = useCinemaStore((s) => s.setCheckoutStep);

  const { data: showtimesData, isLoading } = useShowtimes(
    selectedMovieId ? { movieId: selectedMovieId, cinemaId: selectedCinemaId || undefined } : undefined,
  );

  const showtimes = (showtimesData?.showtimes as any[]) || [];

  const groupedByCinema = showtimes.reduce((acc: Record<string, any[]>, st) => {
    const key = st.cinemaName || st.cinemaId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(st);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <h2 className="text-sm font-bold text-white">Selecciona un Horario</h2>
        <p className="text-[10px] text-white/40 mt-0.5">Elige el horario que mejor te funcione</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : Object.keys(groupedByCinema).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-xs text-white/40">No hay horarios disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByCinema).map(([cinemaName, sts]) => (
              <div key={cinemaName}>
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-white">{cinemaName}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(sts as any[]).map((st) => {
                    const time = new Date(st.datetime).toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const date = new Date(st.datetime).toLocaleDateString("es-PE", {
                      weekday: "short",
                      day: "numeric",
                    });
                    return (
                      <button
                        key={st.id}
                        onClick={() => {
                          setSelectedShowtime(st.id);
                          setCheckoutStep(nextStep("showtime-select"));
                        }}
                        className="flex flex-col items-center px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/10 transition-all min-w-[80px]"
                      >
                        <span className="text-sm font-bold text-white">{time}</span>
                        <span className="text-[9px] text-white/40 mt-0.5">{date}</span>
                        <span className="text-[9px] text-primary/60 mt-1">{st.format} • {st.language}</span>
                        <span className="text-[9px] text-white/30 mt-0.5">{st.availableSeats} disponibles</span>
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
  );
}
