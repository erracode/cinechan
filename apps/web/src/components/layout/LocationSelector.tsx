import { Cascader, type CascaderOption } from "#/components/ui/cascader";
import { useCinemaStore } from "#/store/cinema";
import { useCinemas } from "#/lib/hooks/useCinemaData";
import { useMemo } from "react";

export function LocationSelector() {
  const selectedCity = useCinemaStore((s) => s.selectedCity);
  const selectedCinemaId = useCinemaStore((s) => s.selectedCinemaId);
  const setSelectedCity = useCinemaStore((s) => s.setSelectedCity);
  const setSelectedCinema = useCinemaStore((s) => s.setSelectedCinema);

  const { data } = useCinemas(selectedCity || undefined);
  const cinemas = (data?.cinemas as any[]) || [];

  const options = useMemo(() => {
    const cities = ["Pasto", "Palmira", "Bogotá"];
    return cities.map((city) => ({
      value: city.toLowerCase(),
      label: city,
      children: cinemas
        .filter((c) => c.city === city)
        .map((c) => ({
          value: c.id,
          label: c.name,
        })),
    }));
  }, [cinemas]);

  const handleChange = (_value: string, selectedOptions: CascaderOption[]) => {
    const city = selectedOptions[0]?.label || null;
    const cinema = selectedOptions[1] || null;

    if (city) {
      setSelectedCity(city);
      localStorage.setItem("cinechan-city", city);
    }
    if (cinema) {
      setSelectedCinema(cinema.value);
      localStorage.setItem("cinechan-cinema", cinema.value);
    }
  };

  const initialValue = useMemo(() => {
    if (selectedCinemaId) return selectedCinemaId;
    if (selectedCity) return selectedCity.toLowerCase();
    return undefined;
  }, [selectedCity, selectedCinemaId]);

  return <Cascader options={options} value={initialValue} onChange={handleChange} placeholder="Seleccionar ubicación" />;
}
