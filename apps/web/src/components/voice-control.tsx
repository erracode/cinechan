"use client";

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Mic, Square, Send } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventInstance) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventInstance {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface VoiceControlHandle {
  stopAndSubmit: () => string | null;
  isActive: () => boolean;
}

interface VoiceControlProps {
  onTranscript: (text: string) => void;
  onInterim?: (text: string) => void;
  onActiveChange?: (active: boolean) => void;
  disabled?: boolean;
}

type VoiceState = "idle" | "recording" | "countdown";

export const VoiceControl = forwardRef<VoiceControlHandle, VoiceControlProps>(function VoiceControl({
  onTranscript,
  onInterim,
  onActiveChange,
  disabled,
}, ref) {
  const [state, setState] = useState<VoiceState>("idle");
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [countdown, setCountdown] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef("");

  const [levels, setLevels] = useState<number[]>(Array(20).fill(0));

  useImperativeHandle(ref, () => ({
    stopAndSubmit: () => {
      const text = finalTranscriptRef.current || interimText;
      if (text.trim()) {
        cleanup();
        setState("idle");
        return text;
      }
      cleanup();
      setState("idle");
      return null;
    },
    isActive: () => state !== "idle",
  }), [state, interimText]);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
    }
    streamRef.current = null;
    recognitionRef.current = null;
    audioCtxRef.current = null;
    rafRef.current = null;
    setLevels(Array(20).fill(0));
    onActiveChange?.(false);
  }, [onActiveChange]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      cleanup();
      setState("recording");
      setInterimText("");
      setFinalText("");
      finalTranscriptRef.current = "";

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const barCount = 20;
        const newLevels = Array.from({ length: barCount }, (_, i) => {
          const start = Math.floor((i / barCount) * dataArray.length);
          const end = Math.floor(((i + 1) / barCount) * dataArray.length);
          let sum = 0;
          for (let j = start; j < end; j++) sum += dataArray[j];
          const avg = sum / (end - start);
          return avg / 255;
        });
        setLevels(newLevels);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition as SpeechRecognitionConstructor;
      if (!SpeechRecognitionAPI) {
        setState("idle");
        cleanup();
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-MX";

      recognition.onresult = (event: SpeechRecognitionEventInstance) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += transcript;
          } else {
            interim += transcript;
          }
        }
        const fullText = finalTranscriptRef.current + interim;
        setFinalText(finalTranscriptRef.current);
        setInterimText(interim);
        onInterim?.(fullText);
      };

      recognition.onerror = () => {
        cleanup();
        setState("idle");
      };

      recognition.onend = () => {
        if (streamRef.current && finalTranscriptRef.current) {
          startCountdown();
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      onActiveChange?.(true);
    } catch {
      setState("idle");
    }
  }, [cleanup, onInterim, onActiveChange]);

  const startCountdown = useCallback(() => {
    setState("countdown");
    setCountdown(3);
    let remaining = 3;
    countdownRef.current = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        const text = finalTranscriptRef.current;
        cleanup();
        setState("idle");
        onTranscript(text);
      }
    }, 1000);
  }, [cleanup, onTranscript]);

  const handleStop = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    cleanup();
    setInterimText("");
    setFinalText("");
    setState("idle");
  }, [cleanup]);

  const handleSend = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const text = finalTranscriptRef.current || interimText;
    if (text.trim()) {
      cleanup();
      setState("idle");
      onTranscript(text);
    }
  }, [interimText, cleanup, onTranscript]);

  useEffect(() => {
    if (disabled && state !== "idle") {
      if (countdownRef.current) clearInterval(countdownRef.current);
      cleanup();
      setInterimText("");
      setFinalText("");
      setState("idle");
    }
  }, [disabled, state, cleanup]);

  if (state === "recording" || state === "countdown") {
    return (
      <div className="flex items-center gap-3 px-2">
        <div className="flex items-center gap-[2px] h-8">
          {levels.map((level, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-primary transition-all duration-[30ms]"
              style={{
                height: `${Math.max(4, level * 32)}px`,
                opacity: level > 0.05 ? 0.9 : 0.3,
              }}
            />
          ))}
        </div>

        {(interimText || finalText) && (
          <span className="text-xs text-muted-foreground max-w-[120px] truncate">
            {finalText}{interimText}
          </span>
        )}

        {state === "countdown" && (
          <span className="text-xs text-muted-foreground animate-pulse">
            {countdown}
          </span>
        )}

        <button
          onClick={handleSend}
          className="p-2 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors"
          title="Enviar"
        >
          <Send className="w-4 h-4" />
        </button>

        <button
          onClick={handleStop}
          className="p-2 rounded-full bg-white/10 text-foreground hover:bg-white/20 transition-colors"
          title="Detener"
        >
          <Square className="w-4 h-4" fill="currentColor" />
        </button>
      </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={startRecording}
      disabled={disabled}
      className={cn(
        "p-2.5 rounded-full transition-all duration-300",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "bg-white/10 text-muted-foreground border border-white/5 hover:bg-white/20",
      )}
      title="Activar micrófono"
    >
      <Mic className="w-5 h-5" />
    </motion.button>
  );
});
