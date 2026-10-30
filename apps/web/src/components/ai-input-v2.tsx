"use client";

import { cn } from "../lib/utils";
import { m, AnimatePresence, motion } from "motion/react";
import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, File, Volume2, VolumeX, History, Minimize2, X } from "lucide-react";
import { useChat } from "../lib/hooks/useChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VoiceControl } from "./voice-control";
import type { VoiceControlHandle } from "./voice-control";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "file" | "video";
}

interface AIInputV2Props {
  placeholder?: string;
  className?: string;
  onBotReply?: (text: string) => void;
  onStopSpeaking?: () => void;
  isSpeaking?: boolean;
}

export function AIInputMessagesV2({
  messages,
  isLoading,
  messagesEndRef,
  onReplayAudio,
  speakingId,
  showFullHistory,
}: {
  messages: any[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onReplayAudio?: (text: string, msgId: string) => void;
  speakingId?: string | null;
  showFullHistory: boolean;
}) {
  // Logic for V2: Only show the last 2 messages if not showing full history
  const displayMessages = showFullHistory ? messages : messages.slice(-2);

  return (
    <div className={cn(
      "flex-1 px-4 py-8 space-y-6 w-full transition-all duration-500",
      showFullHistory ? "overflow-y-auto scrollbar-hide" : "overflow-hidden justify-end flex flex-col"
    )}>
      <AnimatePresence initial={false} mode="popLayout">
        {displayMessages.map((msg) => (
          <motion.div
            key={msg.id}
            layout
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={cn(
              "flex flex-col gap-2 shrink-0 w-full",
              msg.role === "user" ? "ml-auto items-end max-w-[85%]" : "items-start",
            )}
          >
            {msg.role === "bot" && (
              <div className="flex items-center gap-1 mb-1 px-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                  Cinechan
                </span>
                {msg.audioText && (
                  <button
                    onClick={() => onReplayAudio?.(msg.audioText, msg.id)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    title={speakingId === msg.id ? "Detener" : "Reproducir audio"}
                  >
                    {speakingId === msg.id ? (
                      <VolumeX className="w-3 h-3 text-primary" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-muted-foreground/50" />
                    )}
                  </button>
                )}
              </div>
            )}
            <div
              className={cn(
                "text-sm leading-relaxed p-4 rounded-3xl bg-card/60 backdrop-blur-xl border border-white/5 text-foreground shadow-sm",
                msg.role === "user"
                  ? "rounded-tr-none"
                  : "rounded-tl-none w-full",
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-bold text-foreground">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground">{children}</em>
                  ),
                  code: ({ children }) => (
                    <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/50 pl-3 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-4 border-white/10" />,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isLoading && (
        <m.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="flex flex-col gap-2 shrink-0 w-full items-start"
        >
          <div className="flex items-center gap-1 mb-1 px-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
              Cinechan
            </span>
          </div>
          <div className="p-4 rounded-3xl rounded-tl-none bg-card/60 backdrop-blur-xl border border-white/5 text-foreground shadow-sm w-full">
            <div className="flex gap-1 items-center h-5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:200ms]" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:400ms]" />
            </div>
          </div>
        </m.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export function AIInputV2({
  placeholder = "Pregunta lo que quieras sobre cine...",
  className,
  onBotReply,
  onStopSpeaking,
  isSpeaking,
}: AIInputV2Props) {
  const { messages, isLoading, submitMessage, setMessages } = useChat();
  const [value, setValue] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voiceRef = useRef<VoiceControlHandle>(null);

  const hasText = value.length > 0;
  const showSend = hasText && !isVoiceActive;

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "bot",
          content: "¡Hola! 🎬 ¿Qué películas te gustaría ver hoy? 🍿",
          audioText: "¡Hola! ¿Qué películas te gustaría ver hoy?",
        },
      ]);
    }
  }, [messages.length, setMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, showFullHistory]);

  const wasSpeaking = useRef(false);
  useEffect(() => {
    if (wasSpeaking.current && !isSpeaking) {
      setSpeakingId(null);
    }
    wasSpeaking.current = !!isSpeaking;
  }, [isSpeaking]);

  const prevBotLength = useRef(0);
  useEffect(() => {
    const botMessages = messages.filter((m) => m.role === "bot");
    if (botMessages.length > prevBotLength.current) {
      const last = botMessages[botMessages.length - 1];
      if (last && last.id !== "1" && onBotReply) {
        onBotReply(last.audioText || last.content);
        setSpeakingId(last.id);
      }
    }
    prevBotLength.current = botMessages.length;
  }, [messages, onBotReply]);

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async (text?: string) => {
    const message = text || value;
    if (!message.trim() && uploadedFiles.length === 0) return;

    if (!text && isVoiceActive) {
      const voiceText = voiceRef.current?.stopAndSubmit();
      if (voiceText) {
        onStopSpeaking?.();
        setValue(voiceText);
        await submitMessage(voiceText);
        setValue("");
        return;
      }
    }

    onStopSpeaking?.();
    setValue("");
    setUploadedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await submitMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReplayAudio = (text: string, msgId: string) => {
    if (speakingId === msgId) {
      setSpeakingId(null);
      onStopSpeaking?.();
    } else {
      setSpeakingId(msgId);
      onBotReply?.(text);
    }
  };

  const handleVoiceInterim = (text: string) => {
    setValue(text);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setValue(text);
    handleSubmit(text);
  };

  return (
      <div
        className={cn(
          "w-full flex flex-col relative min-h-0 h-full max-h-full",
          className,
        )}
      >
        <div className={cn(
          "flex-1 min-h-0 flex flex-col relative w-full transition-all duration-500",
          showFullHistory ? "mb-4" : "mb-2 justify-end"
        )}>
          <AIInputMessagesV2
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            onReplayAudio={handleReplayAudio}
            speakingId={speakingId}
            showFullHistory={showFullHistory}
          />
        </div>

        <div className="w-full ">
          <motion.div
            layout
            className="relative bg-card/40 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
          >
            <AnimatePresence>
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  className="px-4 pt-4 flex flex-wrap gap-2 overflow-hidden"
                >
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10"
                    >
                      {file.type === "image" ? (
                        <img
                          src={file.preview}
                          className="w-full h-full object-cover"
                          alt="preview"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <File className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 pb-14">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  const newVal = e.target.value;
                  if (newVal && !value) onStopSpeaking?.();
                  setValue(newVal);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={placeholder}
                className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[44px] max-h-40 py-2 scrollbar-hide"
                rows={1}
              />
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFullHistory(!showFullHistory)}
                  className={cn(
                    "p-2.5 rounded-full border transition-all duration-300",
                    showFullHistory
                      ? "bg-primary text-white border-primary/20"
                      : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"
                  )}
                  title={showFullHistory ? "Ocultar historial" : "Mostrar historial"}
                >
                  {showFullHistory ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <History className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {(isVoiceActive || !showSend) && (
                    <motion.div
                      key="voice"
                      initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <VoiceControl
                        ref={voiceRef}
                        onTranscript={handleVoiceTranscript}
                        onInterim={handleVoiceInterim}
                        onActiveChange={setIsVoiceActive}
                        disabled={isLoading}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {showSend && (
                  <motion.button
                    key="submit"
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                    transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    onClick={() => handleSubmit()}
                    disabled={isLoading}
                    className={cn(
                      "p-2.5 rounded-full shadow-lg bg-primary text-white shadow-primary/20"
                    )}
                  >
                    <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-muted-foreground/30 uppercase tracking-[0.2em]">
              Presiona Enter para enviar • Cinechan v2.0
            </p>
          </div>
      </div>
    </div>
  );
}

export default AIInputV2;
