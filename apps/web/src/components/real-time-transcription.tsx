"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Loader2, ArrowUp } from "lucide-react";
import { cn } from "../lib/utils";

interface RealTimeTranscriptionProps {
  value: string;
  onTranscriptChange: (text: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function RealTimeTranscription({
  value,
  onTranscriptChange,
  onSubmit,
  disabled = false,
  isLoading = false,
}: RealTimeTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = () => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not supported");
      return;
    }

    setIsInitializing(true);
    finalTranscriptRef.current = value;

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsInitializing(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      finalTranscriptRef.current = value;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    // Check for browser support
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "es-ES";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          console.log("🎤 Speech recognition started");
          setIsInitializing(false);
          setIsRecording(true);

          // Clear any existing restart timer
          if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
          }
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const combinedText =
            finalTranscriptRef.current + finalTranscript + interimTranscript;
          onTranscriptChange(combinedText);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);

          // If it's a "no-speech" or "aborted" error, try to restart
          if (event.error === "no-speech" || event.error === "aborted") {
            console.log("🔄 Attempting to restart recognition...");
            if (isRecording) {
              setTimeout(() => {
                try {
                  recognition.start();
                } catch (e) {
                  console.error("Failed to restart:", e);
                  setIsRecording(false);
                }
              }, 100);
            }
          } else if (event.error === "not-allowed") {
            console.error("Microphone permission denied");
            setIsRecording(false);
            setIsInitializing(false);
          } else {
            setIsRecording(false);
            setIsInitializing(false);
          }
        };

        recognition.onend = () => {
          console.log("🔴 Speech recognition ended");

          // If we were recording, try to restart after a short delay
          if (isRecording && !isInitializing) {
            console.log("🔄 Auto-restarting recognition...");
            restartTimerRef.current = setTimeout(() => {
              if (isRecording) {
                try {
                  recognition.start();
                } catch (e) {
                  console.error("Failed to restart:", e);
                  setIsRecording(false);
                }
              }
            }, 100);
          } else {
            setIsRecording(false);
            setIsInitializing(false);
          }

          if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = null;
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptChange, isRecording, isInitializing]);

  const handleClick = () => {
    // If there's text and we're not recording, submit
    if (value.trim() && !isRecording && !isLoading) {
      onSubmit();
      return;
    }

    // Toggle recording
    if (disabled || isLoading) return;

    if (!recognitionRef.current) {
      console.error("Speech recognition not supported");
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Determine what icon to show
  const showSendButton = value.trim() && !isRecording && !isLoading;
  const showMicActive = isRecording;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isInitializing || isLoading}
      className={cn(
        "p-2.5 rounded-full transition-all duration-300",
        disabled || isInitializing || isLoading
          ? "opacity-50 cursor-not-allowed"
          : showSendButton
            ? "bg-primary text-white shadow-primary/20 hover:bg-primary/90"
            : showMicActive
              ? "bg-primary text-white shadow-primary/20"
              : "bg-white/10 text-muted-foreground border border-white/5 hover:bg-white/20",
      )}
      title={
        isInitializing
          ? "Iniciando..."
          : showSendButton
            ? "Enviar mensaje"
            : showMicActive
              ? "Detener grabación"
              : "Iniciar grabación de voz"
      }
    >
      {isInitializing || isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : showSendButton ? (
        <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}
