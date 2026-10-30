"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "../lib/utils";
import { Room } from "livekit-client";
import "@livekit/components-styles";
import { SimpleAudioVisualizer } from "./simple-audio-visualizer";

interface LiveKitControlProps {
  token: string;
  roomName: string;
}

export function LiveKitControl({ token, roomName }: LiveKitControlProps) {
  const [generatedToken, setGeneratedToken] = useState<string>(token);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const roomRef = useRef<Room | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Play audio response
  const playAudioResponse = async (base64Audio: string) => {
    try {
      const audioBytes = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < audioBytes.length; i++) {
        uint8Array[i] = audioBytes.charCodeAt(i);
      }

      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();

      console.log("🔊 Playing audio response");
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Process voice with agent server
  const processVoice = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);

      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      // Add timeout for slow server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch("http://localhost:3003/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64Audio.split(",")[1] }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Voice processing failed");
      }

      const data = await response.json();

      if (data.audio) {
        await playAudioResponse(data.audio);
      }

      if (data.text) {
        console.log("📝 Response text:", data.text);

        // If it's a fallback (text-only), you could add text-to-speech here
        if (data.note) {
          console.log("ℹ️ Note:", data.note);
        }
      }
    } catch (error) {
      console.error("Error processing voice:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate token
  useEffect(() => {
    if (!generatedToken) {
      console.log("Generating LiveKit token...");
      const generateToken = async () => {
        try {
          const response = await fetch(
            "http://localhost:3003/api/voice/token",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: "cinechan-user" }),
            },
          );
          const data = await response.json();
          console.log("Token received:", data.token);
          setGeneratedToken(data.token);
        } catch (error) {
          console.error("Error generating LiveKit token:", error);
        }
      };

      generateToken();
    } else {
      console.log("Token already available:", generatedToken);
    }
  }, [generatedToken]);

  // Connect to LiveKit
  useEffect(() => {
    if (!generatedToken) return;

    const livekitUrl =
      process.env.NEXT_PUBLIC_LIVEKIT_URL ||
      "wss://yt-test-upfzxp04.livekit.cloud";

    const connectToRoom = async () => {
      setIsConnecting(true);
      try {
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = room;

        room.on("connected", () => {
          setIsConnected(true);
          setIsConnecting(false);
          console.log("✅ LiveKit room connected:", roomName);
        });

        room.on("disconnected", () => {
          setIsConnected(false);
          setIsConnecting(false);
          console.log("❌ LiveKit room disconnected:", roomName);
        });

        await room.connect(livekitUrl, generatedToken);
      } catch (error) {
        console.error("❌ Failed to connect to LiveKit:", error);
        setIsConnecting(false);
      }
    };

    connectToRoom();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [generatedToken, roomName]);

  // Toggle microphone and handle voice recording
  const toggleMic = async () => {
    if (isToggling) return;

    setIsToggling(true);
    try {
      const newState = !isMicEnabled;

      if (newState) {
        // Start recording
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/webm",
            });
            await processVoice(audioBlob);
            stream.getTracks().forEach((track) => track.stop());
          };

          mediaRecorder.start();
          console.log("🎙️ Recording started");
        } catch (error) {
          console.error("Error starting recording:", error);
          throw error;
        }
      } else {
        // Stop recording and process
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
          console.log("⏹️ Recording stopped, processing...");
        }
      }

      setIsMicEnabled(newState);

      if (roomRef.current?.localParticipant) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(newState);
      }

      console.log(
        newState ? "✅ Microphone enabled" : "❌ Microphone disabled",
      );
    } catch (error) {
      console.error("Error toggling microphone:", error);
    } finally {
      setIsToggling(false);
    }
  };

  // Loading state
  if (!generatedToken || isConnecting) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
        <span className="text-xs text-muted-foreground">Conectando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 px-2 py-1 bg-primary/20 rounded-full">
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
          <span className="text-xs text-primary">Procesando...</span>
        </div>
      )}

      {/* Audio Visualizer */}
      {isConnected && isMicEnabled && !isProcessing && (
        <SimpleAudioVisualizer isListening={true} />
      )}

      {/* Mic Status Indicator */}
      {isConnected && !isMicEnabled && !isProcessing && (
        <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="text-xs text-muted-foreground">Mic OFF</span>
        </div>
      )}

      {/* Mic Toggle Button */}
      <button
        onClick={toggleMic}
        disabled={isToggling || isProcessing || !isConnected}
        className={cn(
          "p-2 rounded-full border transition-all duration-300",
          isToggling || isProcessing
            ? "opacity-50 cursor-not-allowed"
            : isConnected
              ? "bg-white/10 text-foreground border-white/20 hover:bg-white/20"
              : "bg-white/5 text-muted-foreground border-white/5",
        )}
        title={
          isToggling
            ? "Procesando..."
            : isProcessing
              ? "Procesando audio..."
              : isMicEnabled
                ? "Desactivar Micrófono"
                : "Activar Micrófono"
        }
      >
        {isToggling || isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isMicEnabled ? (
          <Mic className="w-4 h-4" />
        ) : (
          <MicOff className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
