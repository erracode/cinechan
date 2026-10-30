"use client";

import { useRef, useState, useCallback } from "react";

const TTS_ENDPOINT = "http://localhost:3003/api/tts";

export function useTTSPlayback() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const mouthOpenRef = useRef(0);
  const generationRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }
    mouthOpenRef.current = 0;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    const gen = ++generationRef.current;
    stop();

    try {
      const abort = new AbortController();
      abortRef.current = abort;

      const response = await fetch(TTS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: abort.signal,
      });

      if (gen !== generationRef.current) return;
      if (!response.ok) throw new Error("TTS failed");

      const data = await response.json();
      if (gen !== generationRef.current) return;

      const audioBytes = atob(data.audio);
      const arrayBuffer = new ArrayBuffer(audioBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioBytes.length; i++) {
        uint8Array[i] = audioBytes.charCodeAt(i);
      }

      if (gen !== generationRef.current) return;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      if (gen !== generationRef.current) { ctx.close(); return; }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      sourceRef.current = source;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      source.connect(analyser);
      analyser.connect(ctx.destination);
      source.start();
      setIsSpeaking(true);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const rms = sum / dataArray.length / 255;
        const target = rms > 0.05 ? Math.min(rms * 2, 1) : 0;
        mouthOpenRef.current += (target - mouthOpenRef.current) * 0.35;

        if (sourceRef.current) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      tick();

      source.onended = () => {
        if (gen !== generationRef.current) return;
        mouthOpenRef.current = 0;
        setIsSpeaking(false);
        rafRef.current = null;
        sourceRef.current = null;
      };
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("TTS playback error:", error);
      if (gen === generationRef.current) stop();
    }
  }, [stop]);

  return { speak, stop, mouthOpenRef, isSpeaking };
}
