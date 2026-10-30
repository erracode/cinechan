import { createFileRoute } from "@tanstack/react-router";
import AIInput from "../components/ai-input";
import { Live2DCharacter } from "../components/live2d-character";
import { CinemaMarqueeBackground } from "../components/CinemaMarqueeBackground";
import { useTTSPlayback } from "../lib/hooks/useTTSPlayback";
import { LeftPanel, RightPanel } from "../components/layout/Panels";
import { LocationSelector } from "../components/layout/LocationSelector";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { speak, stop, mouthOpenRef, isSpeaking } = useTTSPlayback();

  return (
    <>
      <CinemaMarqueeBackground />

      <div className="h-screen w-full flex flex-col relative overflow-hidden">

      {/* Header Bar */}
      <div className="h-16 shrink-0 flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-black text-xs">C</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Cinechan</span>
        </div>

        <LocationSelector />
      </div>

      {/* Hero / Avatar Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-[20vh]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full animate-pulse pointer-events-none md:w-96 md:h-96" />

        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="relative z-20 w-full h-full flex items-center justify-center">
            <Live2DCharacter
              key="haru"
              modelUrl="/models/haru/Haru.model3.json"
              visible={true}
              mouthOpenRef={mouthOpenRef}
            />
          </div>
        </div>
      </div>

      {/* 3-Column Layout: 28 / 44 / 28 */}
      <div className="relative w-full flex-1 flex pointer-events-none overflow-hidden">
        {/* Left - 28% */}
        <div className="basis-[28%] min-w-0 hidden lg:flex flex-col pointer-events-auto overflow-hidden">
          <LeftPanel />
        </div>

        {/* Center - 44% */}
        <div className="basis-[44%] min-w-0 flex flex-col pointer-events-none">
          <div className="mt-auto w-full px-8 z-30 pb-8 flex flex-col max-h-[75vh] pointer-events-auto">
            <AIInput className="max-h-full" onBotReply={speak} onStopSpeaking={stop} isSpeaking={isSpeaking} />
          </div>
        </div>

        {/* Right - 28% */}
        <div className="basis-[28%] min-w-0 hidden lg:flex flex-col pointer-events-auto overflow-hidden">
          <RightPanel />
        </div>
      </div>
    </div>
    </>
  );
}
