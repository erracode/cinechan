import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Sun, Moon } from "lucide-react";
import { cn } from "#/lib/utils";
import { useCinemaStore } from "#/store/cinema";
import { useCinemas } from "#/lib/hooks/useCinemaData";
import { AnimatePresence, motion } from "motion/react";

const CITIES = ["Pasto", "Palmira", "Bogotá"];

export function AppHeader() {
  const selectedCity = useCinemaStore((s) => s.selectedCity);
  const selectedCinemaId = useCinemaStore((s) => s.selectedCinemaId);
  const setSelectedCity = useCinemaStore((s) => s.setSelectedCity);
  const setSelectedCinema = useCinemaStore((s) => s.setSelectedCinema);
  const { data } = useCinemas(selectedCity || undefined);

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showCinemaDropdown, setShowCinemaDropdown] = useState(false);
  const [dark, setDark] = useState(true);

  const cinemas = (data?.cinemas as any[]) || [];
  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);

  useEffect(() => {
    const saved = localStorage.getItem("cinechan-city");
    if (saved) setSelectedCity(saved);
  }, []);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("cinechan-city", city);
    setShowCityDropdown(false);
    setShowCinemaDropdown(false);
  };

  const handleCinemaSelect = (cinemaId: string) => {
    setSelectedCinema(cinemaId);
    setShowCinemaDropdown(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1920px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="text-white font-bold text-sm tracking-wide">Cinechan</span>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowCityDropdown(!showCityDropdown);
                setShowCinemaDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-white/80">
                {selectedCity || "Seleccionar ciudad"}
                {selectedCinema && ` • ${selectedCinema.name}`}
              </span>
              <ChevronDown className={cn("w-3 h-3 text-white/40 transition-transform", showCityDropdown && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showCityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 px-2 py-1">Ciudad</p>
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedCity === city
                            ? "bg-primary/20 text-primary"
                            : "text-white/80 hover:bg-white/5",
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  {selectedCity && cinemas.length > 0 && (
                    <div className="border-t border-white/5 p-2">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 px-2 py-1">Teatro</p>
                      {cinemas.map((cinema) => (
                        <button
                          key={cinema.id}
                          onClick={() => handleCinemaSelect(cinema.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            selectedCinemaId === cinema.id
                              ? "bg-primary/20 text-primary"
                              : "text-white/80 hover:bg-white/5",
                          )}
                        >
                          {cinema.name}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-white/60" />}
        </button>
      </div>
    </header>
  );
}
