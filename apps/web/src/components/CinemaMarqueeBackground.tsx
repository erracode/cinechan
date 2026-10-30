"use client";

const POSTERS = [
  "/posters/mortal-kombat-2.svg",
  "/posters/las-ovejas-detectives.svg",
  "/posters/billie-eilish-tour-3d.svg",
  "/posters/iron-maiden.svg",
  "/posters/michael.svg",
  "/posters/diablo-viste-a-la-moda-2.svg",
  "/posters/super-mario-galaxy.svg",
  "/posters/la-posesion-de-la-momia.svg",
  "/posters/the-amazing-digital-circus.svg",
  "/posters/txt-moa-con-in-japan.svg",
  "/posters/the-mandalorian-and-grogu.svg",
  "/posters/re-top-gun-ani.svg",
  "/posters/re-top-gun-maverick.svg",
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
