import * as PIXI from "pixi.js";

if (typeof window !== "undefined") {
  (window as any).PIXI = PIXI;
  (globalThis as any).PIXI = PIXI;

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });

  (async () => {
    await loadScript("/lib/live2dcubismcore.min.js");
    await loadScript("/lib/cubism4.min.js");
  })();
}

export { PIXI };
export default PIXI;
