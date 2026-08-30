import * as React from "react";
import {
  Bot,
  MessageSquare,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AiKeywordTrigger } from "@/routes/(admin)/dashboard/master/kasus/-components/data";

import { AiVideoAvatar } from "./ai-video-avatar";
import { useTextToSpeech } from "./use-text-to-speech";
import { VoiceInputCountdown } from "./voice-input-countdown";

export interface ChatMessage {
  id: string;
  sender: "bidan" | "pasien";
  text: string;
  timestamp: string;
  matchedTriggerContext?: string;
}

interface InteractiveAiConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staseTitle?: string;
  patientName?: string;
  patientAge?: number | string;
  patientParity?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  aiSystemPrompt?: string;
  triggers?: AiKeywordTrigger[];
  showQuickPrompts?: boolean;
}

export function InteractiveAiConsultationModal({
  open,
  onOpenChange,
  staseTitle = "Simulasi Anamnesis AI",
  patientName = "Ny. Ani",
  patientAge = "29",
  patientParity = "G2P1A0",
  avatarUrl = "/images/ny_ani_patient_torso.jpg",
  backgroundUrl = "/images/puskesmas_clinic_empty.jpg",
  aiSystemPrompt,
  triggers = [],
  showQuickPrompts = true,
}: InteractiveAiConsultationModalProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = React.useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = React.useState(true);

  const { speak, cancel: cancelSpeech, isSpeaking } = useTextToSpeech();
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  // Initialize initial greeting when modal opens
  React.useEffect(() => {
    if (open) {
      const initialGreeting: ChatMessage = {
        id: "msg-init",
        sender: "pasien",
        text: `Selamat pagi Bu Bidan, terima kasih sudah menerima saya di Poli KIA. Saya ingin berkonsultasi mengenai keluhan keputihan yang sangat mengganggu dan agak perih akhir-akhir ini...`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([initialGreeting]);

      if (autoPlayAudio) {
        setTimeout(() => {
          speak(initialGreeting.text);
        }, 600);
      }
    } else {
      cancelSpeech();
    }
  }, [open, speak, cancelSpeech, autoPlayAudio]);

  // Auto scroll chat to bottom
  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAiThinking]);

  // Find the last patient message for replay button
  const lastPatientMessage = React.useMemo(() => {
    return [...messages].reverse().find((m) => m.sender === "pasien");
  }, [messages]);

  const handleReplayLastPatientAudio = () => {
    if (lastPatientMessage) {
      speak(lastPatientMessage.text);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    cancelSpeech();

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "bidan",
      text: text.trim(),
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    // Analyze text against configured triggers
    const lowerText = text.toLowerCase();
    let matchedTrigger: AiKeywordTrigger | undefined;

    for (const trg of triggers) {
      const keywords = trg.keyword
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      const hasMatch = keywords.some((kw) => lowerText.includes(kw));
      if (hasMatch) {
        matchedTrigger = trg;
        break;
      }
    }

    // Generate response after realistic thinking pause
    setTimeout(() => {
      let replyText = "";

      if (matchedTrigger && matchedTrigger.jawaban_cadangan) {
        replyText = matchedTrigger.jawaban_cadangan;
      } else if (matchedTrigger) {
        replyText = `Mengenai ${matchedTrigger.konteks}, keluhan tersebut memang sempat saya rasakan Bu Bidan. Biasanya terasa lebih berat jika saya kecapekan setelah mengurus rumah tangga.`;
      } else if (lowerText.includes("halo") || lowerText.includes("selamat") || lowerText.includes("pagi") || lowerText.includes("siang")) {
        replyText = `Selamat pagi Bu Bidan, mohon bantuannya ya Bu, saya merasa tidak nyaman dengan kondisi keputihan saya ini.`;
      } else if (lowerText.includes("obat") || lowerText.includes("resep") || lowerText.includes("terapi")) {
        replyText = `Apakah kondisi ini bisa sembuh total dengan obat atau tindakan Bu? Saya takut sekali kalau ini berbahaya untuk kehamilan saya.`;
      } else {
        replyText = `Iya Bu Bidan, keputihannya terasa gatal, kental dan warnanya agak kuning kehijauan. Kadang perut bagian bawah saya juga terasa pegal kalau berdiri lama.`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "pasien",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        matchedTriggerContext: matchedTrigger?.konteks,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAiThinking(false);

      if (autoPlayAudio) {
        speak(replyText);
      }
    }, 1000);
  };

  const handleResetChat = () => {
    cancelSpeech();
    const initialGreeting: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "pasien",
      text: `Selamat pagi Bu Bidan, saya ingin berkonsultasi mengenai keluhan yang saya alami akhir-akhir ini...`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([initialGreeting]);
    if (autoPlayAudio) {
      speak(initialGreeting.text);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[94vh] w-[96vw] sm:max-w-6xl md:max-w-6xl flex-col overflow-hidden p-0 gap-0 border-border/80 shadow-2xl"
      >
        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-5 py-3.5 bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Bot className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>{staseTitle}</span>
                <Badge variant="outline" className="text-[10px] font-normal border-blue-500/30 text-blue-600 dark:text-blue-400">
                  Uji Coba Prompt Klinis
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Simulasi telekonsultasi audio & chat dengan pasien virtual ({patientName}, {patientAge} th).
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Button Putar Ulang Suara Terakhir dari Pasien */}
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleReplayLastPatientAudio}
              disabled={!lastPatientMessage}
              className="h-7 gap-1.5 text-xs font-semibold border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/5 hover:bg-blue-500/10"
              title="Putar ulang suara respon pasien terakhir"
            >
              <RotateCcw className="size-3.5" />
              <span>Putar Ulang Suara Pasien</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setAutoPlayAudio((prev) => !prev)}
              className="h-7 gap-1 text-xs"
              title={autoPlayAudio ? "Matikan Suara AI Otomatis" : "Aktifkan Suara AI Otomatis"}
            >
              {autoPlayAudio ? <Volume2 className="size-3.5 text-blue-500" /> : <VolumeX className="size-3.5 text-muted-foreground" />}
              <span>{autoPlayAudio ? "Audio Aktif" : "Mute"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleResetChat}
              className="h-7 gap-1 text-xs"
              title="Reset Percakapan"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Chat</span>
            </Button>

            <div className="h-4 w-px bg-border/80 mx-1" />

            {/* Seamless Header Close Button aligned with all other action buttons */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Tutup Modal (Esc)"
            >
              <X className="size-4" />
              <span className="sr-only">Tutup</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body: Two-Column Split (Left: Zoom Video Feed, Right: Chat Stream) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-[520px]">
          {/* LEFT COLUMN: Zoom-Style Video Feed (5 Cols) */}
          <div className="md:col-span-5 border-r border-border/80 bg-neutral-950 p-3 flex flex-col justify-between overflow-hidden">
            <AiVideoAvatar
              patientName={patientName}
              patientAge={patientAge}
              patientParity={patientParity}
              avatarUrl={avatarUrl}
              backgroundUrl={backgroundUrl}
              isSpeaking={isSpeaking}
              isListening={!isSpeaking && !isAiThinking}
            />
          </div>

          {/* RIGHT COLUMN: Dialogue Transcript & Voice Input (7 Cols) */}
          <div className="md:col-span-7 flex flex-col justify-between overflow-hidden bg-background">
            {/* Dialogue Header Info */}
            <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/20 text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="size-3.5 text-primary" /> Transkrip Percakapan Konsultasi
              </span>

              <div className="flex items-center gap-2">
                {lastPatientMessage && (
                  <button
                    type="button"
                    onClick={handleReplayLastPatientAudio}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <Volume2 className="size-3" /> Putar Suara Terakhir
                  </button>
                )}
                <span className="text-[11px] text-muted-foreground">
                  &bull; {messages.length} Pesan
                </span>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 max-h-[380px] sm:max-h-[420px]"
            >
              {messages.map((msg) => {
                const isUser = msg.sender === "bidan";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-1 max-w-[88%]",
                      isUser ? "self-end items-end" : "self-start items-start",
                    )}
                  >
                    <div className="flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">
                      <span className="font-semibold">
                        {isUser ? "Anda (Bidan)" : patientName}
                      </span>
                      <span>&bull; {msg.timestamp}</span>
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-xs"
                          : "bg-muted text-foreground border border-border/80 rounded-tl-xs",
                      )}
                    >
                      <p>{msg.text}</p>
                    </div>

                    {/* Audio Playback button for patient messages */}
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => speak(msg.text)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors px-1 mt-0.5"
                      >
                        <Volume2 className="size-3" /> Putar Suara
                      </button>
                    )}
                  </div>
                );
              })}

              {/* AI Thinking Bubble */}
              {isAiThinking && (
                <div className="flex flex-col gap-1 max-w-[80%] self-start items-start">
                  <div className="flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">
                    <span className="font-semibold">{patientName}</span>
                    <span>sedang merespon...</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3 border border-border/80 rounded-tl-xs">
                    <div className="size-2 rounded-full bg-blue-500 animate-bounce" />
                    <div className="size-2 rounded-full bg-blue-500 animate-bounce delay-150" />
                    <div className="size-2 rounded-full bg-blue-500 animate-bounce delay-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Voice Input with Automatic Turn-Taking, 5s Countdown & Animated Perimeter Border */}
            <div className="border-t p-3 bg-card shrink-0">
              <VoiceInputCountdown
                onSendMessage={handleSendMessage}
                isAiSpeaking={isSpeaking || isAiThinking}
                disabled={isAiThinking}
                showQuickPrompts={showQuickPrompts}
                placeholder="Bicaralah menggunakan mikrofon atau ketik pertanyaan..."
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
