import * as React from "react";
import {
  Edit3,
  Keyboard,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "./use-speech-recognition";

interface VoiceInputCountdownProps {
  onSendMessage: (text: string) => void;
  isAiSpeaking: boolean;
  isAiThinking?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showQuickPrompts?: boolean;
  quickPrompts?: string[];
  theme?: "default" | "wayang";
}

export function VoiceInputCountdown({
  onSendMessage,
  isAiSpeaking,
  isAiThinking = false,
  disabled = false,
  placeholder = "Bicaralah menggunakan mikrofon atau ketik pertanyaan...",
  showQuickPrompts = true,
  quickPrompts = [
    "Sudah berapa lama keputihannya Bu?",
    "Apakah ada rasa gatal atau bau menyengat?",
    "Kapan hari pertama haid terakhir (HPHT) Ibu?",
    "Pernah ada flek darah setelah berhubungan dengan suami?",
  ],
  theme = "default",
}: VoiceInputCountdownProps) {
  const isWayang = theme === "wayang";
  const [inputText, setInputText] = React.useState("");
  const [countdownSeconds, setCountdownSeconds] = React.useState<number | null>(null);
  const [isEditingMode, setIsEditingMode] = React.useState(false);
  const [manualTypingOpen, setManualTypingOpen] = React.useState(false);

  const inputTextRef = React.useRef("");
  inputTextRef.current = inputText;

  const onSendMessageRef = React.useRef(onSendMessage);
  onSendMessageRef.current = onSendMessage;

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // When speech recognition finalizes a transcript
  const handleVoiceFinalTranscript = React.useCallback((finalText: string) => {
    const clean = finalText.trim();
    if (!clean) return;

    setInputText(clean);
    inputTextRef.current = clean;
    setIsEditingMode(false);
    setCountdownSeconds(5); // Start 5-second review mode
  }, []);

  const {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onFinalResult: handleVoiceFinalTranscript,
    onFinalTranscript: handleVoiceFinalTranscript,
    silenceTimeoutMs: 1200,
  });

  // Automatic Voice Turn-Taking when AI finishes speaking
  const prevAiSpeakingRef = React.useRef(isAiSpeaking);
  React.useEffect(() => {
    if (prevAiSpeakingRef.current && !isAiSpeaking) {
      setInputText("");
      inputTextRef.current = "";
      setCountdownSeconds(null);
      setIsEditingMode(false);
      resetTranscript();
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }

    if (!prevAiSpeakingRef.current && isAiSpeaking) {
      stopListening();
      setCountdownSeconds(null);
      setIsEditingMode(false);
    }

    prevAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking, startListening, stopListening, resetTranscript]);

  // Robust Countdown Timer from 5 down to 0 with Auto Send
  React.useEffect(() => {
    if (countdownSeconds === null || isEditingMode) {
      return;
    }

    if (countdownSeconds <= 0) {
      const textToSend = inputTextRef.current.trim();
      if (textToSend) {
        onSendMessageRef.current(textToSend);
      }
      setInputText("");
      inputTextRef.current = "";
      setCountdownSeconds(null);
      setIsEditingMode(false);
      setManualTypingOpen(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownSeconds, isEditingMode]);

  const cancelCountdownForEditing = () => {
    setCountdownSeconds(null);
    setIsEditingMode(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleManualSend = () => {
    const textToSend = inputTextRef.current.trim() || inputText.trim();
    if (textToSend) {
      setCountdownSeconds(null);
      onSendMessageRef.current(textToSend);
      setInputText("");
      inputTextRef.current = "";
      setIsEditingMode(false);
      setManualTypingOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleManualSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    inputTextRef.current = e.target.value;
    if (countdownSeconds !== null) {
      setCountdownSeconds(null);
      setIsEditingMode(true);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      setInputText("");
      inputTextRef.current = "";
      setCountdownSeconds(null);
      setIsEditingMode(false);
      resetTranscript();
      startListening();
    }
  };

  const countdownProgressPercent = countdownSeconds !== null ? (countdownSeconds / 5) * 100 : 0;

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Optional Quick Prompts */}
      {showQuickPrompts && quickPrompts.length > 0 && !isAiSpeaking && !isListening && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              isWayang ? "text-[#d4af37]" : "text-muted-foreground",
            )}
          >
            <Sparkles className="size-3" /> Rekomendasi Pertanyaan:
          </span>
          {quickPrompts.map((prompt) => (
            <Badge
              key={prompt}
              variant="outline"
              className={cn(
                "cursor-pointer text-[11px] font-normal transition-colors",
                isWayang
                  ? "border-[#8c6d23]/40 bg-[#1e150d] text-[#e6d59c] hover:bg-[#342416] hover:text-[#fff8db]"
                  : "bg-background hover:bg-muted text-foreground border-border/80",
              )}
              onClick={() => onSendMessage(prompt)}
            >
              {prompt}
            </Badge>
          ))}
        </div>
      )}

      {/* STATE A: Pasien AI Sedang Berbicara (Mic Otomatis Mati) */}
      {isAiSpeaking && (
        <div
          className={cn(
            "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs animate-pulse",
            isWayang
              ? "border-[#8c6d23]/40 bg-[#251b11] text-[#fff8db]"
              : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
          )}
        >
          <div className="flex items-center gap-2">
            <Volume2
              className={cn(
                "size-4 animate-bounce",
                isWayang ? "text-[#d4af37]" : "text-blue-600 dark:text-blue-400",
              )}
            />
            <span className="font-semibold">
              Pasien AI sedang berbicara... (Perekam suara otomatis aktif setelah pasien selesai)
            </span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-medium",
              isWayang
                ? "bg-[#1a120b] border-[#8c6d23] text-[#d4af37]"
                : "bg-background/80 text-blue-600 border-blue-500/30",
            )}
          >
            Mic Muted
          </Badge>
        </div>
      )}

      {/* STATE B: Giliran Bidan Berbicara (Mic Otomatis Nyala & Live Listening Wave) */}
      {!isAiSpeaking && isListening && (
        <div
          className={cn(
            "flex flex-col gap-2 rounded-xl border-2 p-3 shadow-sm transition-all",
            isWayang
              ? "border-[#d4af37] bg-[#291c10] text-[#fff8db] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              : "border-emerald-500/50 bg-emerald-500/10 text-foreground",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-white shadow-xs animate-bounce",
                  isWayang
                    ? "bg-gradient-to-r from-[#8c6d23] to-[#d4af37] text-[#14100c]"
                    : "bg-emerald-600 text-white",
                )}
              >
                <Mic className="size-4" />
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-bold text-xs",
                    isWayang ? "text-[#fff8db]" : "text-foreground",
                  )}
                >
                  🎙️ Perekam Suara Aktif &bull; Silakan bicara ke mikrofon
                </span>
                <span
                  className={cn(
                    "text-[10px]",
                    isWayang ? "text-[#d4af37]/80" : "text-muted-foreground",
                  )}
                >
                  Katakan pertanyaan klinis secara langsung. Kotak revisi akan muncul otomatis saat jeda bicara.
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={stopListening}
              className={cn(
                "h-6 gap-1 text-[11px] font-semibold",
                isWayang
                  ? "bg-[#1a120b] text-[#d4af37] border-[#8c6d23] hover:bg-[#342416]"
                  : "bg-background text-destructive border-destructive/40 hover:bg-destructive/10",
              )}
            >
              <MicOff className="size-3" /> Selesai Bicara
            </Button>
          </div>

          {/* Real-time Interim Live Voice Transcription */}
          {interimTranscript ? (
            <div
              className={cn(
                "mt-1 rounded-lg px-3 py-2 border text-xs shadow-2xs",
                isWayang
                  ? "bg-[#1a130d] border-[#8c6d23]/60 text-[#fff8db] font-mono"
                  : "bg-background/90 border-emerald-500/30 text-foreground font-sans",
              )}
            >
              <span className="italic">&ldquo;{interimTranscript}&rdquo;</span>
            </div>
          ) : (
            <div
              className={cn(
                "mt-1 flex items-center gap-1.5 px-1 text-[11px] italic",
                isWayang ? "text-[#d4af37]/80" : "text-emerald-700 dark:text-emerald-300",
              )}
            >
              <span>Mendengarkan suara Anda...</span>
            </div>
          )}
        </div>
      )}

      {/* STATE C: Bidan Selesai Bicara -> Chat Box Muncul dengan Countdown Kirim Otomatis */}
      {!isAiSpeaking && !isListening && (inputText.trim().length > 0 || manualTypingOpen) && (
        <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Status Text */}
          {countdownSeconds !== null && countdownSeconds > 0 && (
            <div className="flex items-center justify-between px-1 text-xs">
              <span
                className={cn(
                  "font-semibold flex items-center gap-1.5 animate-pulse",
                  isWayang ? "text-[#d4af37]" : "text-blue-600 dark:text-blue-400",
                )}
              >
                Klik untuk ubah &bull; Otomatis terkirim dalam{" "}
                <strong
                  className={cn(
                    "underline font-bold font-mono text-sm",
                    isWayang ? "text-[#fff8db]" : "text-foreground",
                  )}
                >
                  {countdownSeconds}s
                </strong>
              </span>
            </div>
          )}

          {isEditingMode && (
            <div
              className={cn(
                "flex items-center justify-between px-1 text-[11px] font-semibold",
                isWayang ? "text-[#f3e5ab]" : "text-amber-700 dark:text-amber-300",
              )}
            >
              <span className="flex items-center gap-1">
                <Edit3 className="size-3" /> Mode edit aktif: Perbaiki teks lalu tekan Enter atau tombol Kirim.
              </span>
            </div>
          )}

          {/* CHAT BOX WITH ANIMATED PERIMETER BORDER */}
          <div
            onClick={() => {
              if (countdownSeconds !== null) cancelCountdownForEditing();
            }}
            className={cn(
              "relative cursor-text rounded-2xl p-1 transition-all",
              countdownSeconds !== null &&
                (isWayang
                  ? "ring-2 ring-[#d4af37]/50 shadow-lg"
                  : "ring-2 ring-primary/40 shadow-md"),
            )}
          >
            {/* SVG Animated Perimeter Border */}
            {countdownSeconds !== null && countdownSeconds > 0 && (
              <svg
                className="absolute inset-0 size-full pointer-events-none z-10"
                style={{ overflow: "visible" }}
              >
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="16"
                  ry="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className={cn(
                    "transition-all duration-1000 ease-linear",
                    isWayang ? "text-[#d4af37]" : "text-primary",
                  )}
                  strokeDasharray="100"
                  strokeDashoffset={100 - countdownProgressPercent}
                  pathLength="100"
                />
              </svg>
            )}

            <div
              className={cn(
                "relative z-0 flex items-end gap-2 rounded-xl p-2 border shadow-2xs",
                isWayang
                  ? "bg-[#251b11] border-[#8c6d23]/60 text-[#f3e5ab]"
                  : "bg-card border-border/80",
              )}
            >
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Teks ucapan bidan..."
                className={cn(
                  "resize-none text-xs leading-relaxed border-0 shadow-none focus-visible:ring-0 p-1 bg-transparent",
                  isWayang ? "text-[#f3e5ab] placeholder:text-[#d4af37]/40" : "text-foreground",
                )}
                autoFocus={isEditingMode}
              />

              <div className="flex items-center gap-1 shrink-0 pb-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleToggleMic}
                  className={cn(
                    "size-7",
                    isWayang
                      ? "text-[#d4af37]/70 hover:text-[#fff8db] hover:bg-[#342416]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  title="Ucapkan ulang via suara"
                >
                  <RotateCcw className="size-3.5" />
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleManualSend}
                  disabled={!inputText.trim()}
                  className={cn(
                    "h-7 gap-1 px-3 text-xs font-semibold shadow-xs",
                    isWayang
                      ? "bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  <Send className="size-3" />
                  <span>Kirim</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE D: Idle / Standby Controls */}
      {!isAiSpeaking && !isListening && inputText.trim().length === 0 && !manualTypingOpen && (
        <div
          className={cn(
            "flex items-center justify-between rounded-xl border border-dashed p-2.5",
            isWayang
              ? "border-[#8c6d23]/50 bg-[#251b11]/80 text-[#f3e5ab]"
              : "border-border/80 bg-muted/20",
          )}
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={startListening}
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs font-medium rounded-xl shadow-xs transition-all",
                isWayang
                  ? "font-serif font-bold tracking-wider bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.3)] border border-[#fff8db]/50"
                  : "font-sans bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <Mic className="size-3.5" />
              <span>Bicara Sekarang (Mic)</span>
            </Button>
            <span
              className={cn(
                "text-[11px]",
                isWayang ? "text-[#d4af37]/75" : "text-muted-foreground",
              )}
            >
              atau ketik pertanyaan manual
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setManualTypingOpen(true)}
            className={cn(
              "h-8 gap-1 text-xs rounded-xl",
              isWayang
                ? "bg-[#1c140c] text-[#f3e5ab] border-[#8c6d23]/50 hover:bg-[#322013]"
                : "border-border/80 bg-background hover:bg-muted text-foreground",
            )}
          >
            <Keyboard
              className={cn(
                "size-3.5",
                isWayang ? "text-[#d4af37]" : "text-muted-foreground",
              )}
            />
            <span>Ketik Pesan</span>
          </Button>
        </div>
      )}
    </div>
  );
}
