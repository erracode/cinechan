"use client";

const POSTERS = [
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/689276b23a6f89b4cb129eee/common/mortal-kombat-2-105089-1778013920111",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69bc2dec952d761a90a846ce/common/las-ovejas-detectives-109659-1773943739814",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69dd77c739290b2820c59c31/common/billie-eilish-tour-3d-109934-1776173972404",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69dd77c739290b2820c59c37/common/iron-maiden-109737-1776173945490",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69a89f9ac2aea8f95819f304/common/michael-108085-1773066570931",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69bc2dec952d761a90a846c8/common/diablo-viste-a-la-moda-2-109658-1773943906092",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/699cb79550a33d4922bd73ce/common/super-mario-galaxy-108980-1771881270577",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69bc2dec952d761a90a846b5/common/la-posesion-de-la-momia-109657-1776436364888",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69deb42f70b9fbe13890ef36/common/the-amazing-digital-circus-109993-1776202999869",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69f8c149e29e4b5b94de50f0/common/txt-moa-con-in-japan-110287-1778008410221",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69d6e03feecab883fbfefcd5/common/the-mandalorian-and-grogu-109282-1775746951324",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69ef7564fdc71a77de3d4196/common/re-top-gun-ani-40-110232-1777300948868",
  "https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/69ef986ecb225335d9704295/common/re-top-gun-maverick-110233-1777312020618",
];

// Deterministic shuffle based on seed
function seededShuffle(arr: string[], seed: number): string[] {
  const copy = [...arr];
  let m = copy.length;
  while (m) {
    m--;
    const hash = (seed * (m + 1) * 9301 + 49297) % 233280;
    const i = hash % (m + 1);
    [copy[m], copy[i]] = [copy[i], copy[m]];
  }
  return copy;
}

const COLUMNS = Array.from({ length: 5 }, (_, colIdx) => {
  const shuffled = seededShuffle(POSTERS, colIdx + 1);
  return [...shuffled, ...seededShuffle(POSTERS, colIdx + 100), ...seededShuffle(POSTERS, colIdx + 1000)];
});

export function CinemaMarqueeBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      {/* 3D poster wall with perspective */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ perspective: "1200px" }}
      >
        <div
          className="flex gap-5"
          style={{
            transform: "rotateX(45deg) rotateZ(-45deg)",
            transformOrigin: "center center",
          }}
        >
          {COLUMNS.map((column, colIdx) => (
            <div
              key={colIdx}
              className="flex flex-col gap-5"
              style={{
                animation: `scroll-up ${120 + colIdx * 20}s linear infinite`,
              }}
            >
              {column.map((url, i) => (
                <img
                  key={`${colIdx}-${i}`}
                  src={url}
                  alt=""
                  loading="lazy"
                  className="w-[160px] h-[230px] object-cover rounded-xl"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 backdrop-blur-[12px]" />
      <div className="absolute inset-0 bg-black/70" />

      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
}
