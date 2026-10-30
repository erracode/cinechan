import { createFileRoute } from "@tanstack/react-router";
import { Live2DCharacter } from "../components/live2d-character";
import { AIInputV2 } from "../components/ai-input-v2";
import { CinemaMarqueeBackground } from "../components/CinemaMarqueeBackground";

export const Route = createFileRoute("/live2d-test")({ component: Live2DTest });

function Live2DTest() {
  return (
    <>
      <CinemaMarqueeBackground />

      <div className="h-screen w-full flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background/Character Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full animate-pulse pointer-events-none md:w-96 md:h-96" />

        <Live2DCharacter
          key="haru"
          modelUrl="/models/haru/Haru.model3.json"
          visible={true}
          scale={2.2}
          offsetY={700}
        />
      </div>

      {/* UI Overlay Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center pt-12 pb-6 max-w-4xl mx-auto">
        {/* AI Input & Messages - This component handles its own scroll area and input */}
        <div className="flex-1 w-full flex flex-col min-h-0 justify-end">
          <AIInputV2
            className="bg-transparent"
          />
        </div>
      </div>
      </div>
    </>
  );
}
