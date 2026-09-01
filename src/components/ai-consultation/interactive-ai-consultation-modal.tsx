import * as React from "react";

import { Bot, MessageSquare, RotateCcw, Sparkles, Volume2, VolumeX, X, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE,
  fetchPatientAnamnesisAiReply,
  fetchPatientCounselingAiReply,
  type GeminiChatHistoryItem,
} from "@/lib/gemini-ai";
import { cn } from "@/lib/utils";
import type { AiKeywordTrigger, Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";

import { AiVideoAvatar } from "./ai-video-avatar";
import { useTextToSpeech } from "./use-text-to-speech";
import { VoiceInputCountdown } from "./voice-input-countdown";

export interface ChatMessage {
  id: string;
  sender: "bidan" | "pasien";
  text: string;
  timestamp: string;
  matchedTriggerContext?: string;
  source?: "gemini-api" | "rule-trigger-fallback";
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
  staseTitle = "Simulasi Anamnesis",
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
  const [engineMode, setEngineMode] = React.useState<"gemini" | "fallback">("gemini");

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
        source: "rule-trigger-fallback",
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

  const handleSendMessage = async (text: string) => {
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

    const isAsuhan =
      staseTitle.toLowerCase().includes("asuhan") ||
      staseTitle.toLowerCase().includes("konseling") ||
      staseTitle.toLowerCase().includes("stase 5");

    // Construct mock Kasus payload for gemini-ai helper
    const mockKasus: Kasus = {
      id: "KSS-SIMULASI",
      nama: `${patientName} (${patientAge} tahun)`,
      tipe: "Utama",
      deskripsi: `Simulasi Kasus Telekonsultasi KIA - ${patientName}`,
      atribut: [
        { id: "attr-sim-1", key: "Status Obstetri", value: patientParity },
        { id: "attr-sim-2", key: "Usia", value: String(patientAge) },
        { id: "attr-sim-3", key: "Keluhan Utama", value: triggers[0]?.jawaban_cadangan || "Keputihan abnormal" },
      ],
      stase_data: {
        stase1: {
          header: { nama_stase: staseTitle, kode_amplop: "SIM-01", durasi_menit: 7, petunjuk_soal: "" },
          ai_system_prompt: aiSystemPrompt || "",
          triggers: triggers,
        },
        stase2: {
          header: { nama_stase: "Pos 2", kode_amplop: "SIM-02", durasi_menit: 5, petunjuk_soal: "" },
          faktor_risiko: [],
        },
        stase3: {
          header: { nama_stase: "Pos 3", kode_amplop: "SIM-03", durasi_menit: 7, petunjuk_soal: "" },
          sop_items: [],
        },
        stase4: {
          header: { nama_stase: "Pos 4", kode_amplop: "SIM-04", durasi_menit: 5, petunjuk_soal: "" },
          soal_mcq: [],
        },
        stase5: {
          header: { nama_stase: staseTitle, kode_amplop: "SIM-05", durasi_menit: 7, petunjuk_soal: "" },
          ai_system_prompt: aiSystemPrompt || "",
          triggers: triggers,
        },
      },
    };

    let replyText = "";
    let matchedCategory: string | undefined;
    let replySource: "gemini-api" | "rule-trigger-fallback" = "rule-trigger-fallback";

    if (engineMode === "gemini") {
      try {
        const history: GeminiChatHistoryItem[] = messages.slice(-6).map((m) => ({
          sender: m.sender === "bidan" ? "midwife" : "ai",
          text: m.text,
        }));

        const result = isAsuhan
          ? await fetchPatientCounselingAiReply({
            userMessage: text.trim(),
            kasus: mockKasus,
            chatHistory: history,
            customSystemPrompt: aiSystemPrompt,
          })
          : await fetchPatientAnamnesisAiReply({
            userMessage: text.trim(),
            kasus: mockKasus,
            chatHistory: history,
            customSystemPrompt: aiSystemPrompt,
          });

        replyText = result.replyText;
        matchedCategory = result.matchedCategory;
        replySource = result.source || "gemini-api";
      } catch (err) {
        console.error("Gemini fetch error during simulation:", err);
        replyText = DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE;
        replySource = "rule-trigger-fallback";
      }
    } else {
      // Local Rule Trigger Fallback Mode (Instant Matcher)
      const lowerText = text.toLowerCase();
      let matchedTrigger: AiKeywordTrigger | undefined;

      for (const trg of triggers) {
        const keywords = trg.keyword
          .split(/[,|]/)
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean);

        if (keywords.some((kw) => lowerText.includes(kw))) {
          matchedTrigger = trg;
          break;
        }
      }

      if (matchedTrigger && matchedTrigger.jawaban_cadangan) {
        replyText = matchedTrigger.jawaban_cadangan.replace(/^["'\s\\]+|["'\s\\]+$/g, "").trim();
        matchedCategory = matchedTrigger.konteks;
      } else if (
        lowerText.includes("keluhan") ||
        lowerText.includes("kenapa") ||
        lowerText.includes("alasan") ||
        lowerText.includes("merasa")
      ) {
        replyText = (triggers[0]?.jawaban_cadangan || "Saya keputihan sudah beberapa waktu ini Bu Bidan.")
          .replace(/^["'\s\\]+|["'\s\\]+$/g, "")
          .trim();
        matchedCategory = triggers[0]?.konteks || "Riwayat Keluhan";
      } else {
        replyText = DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE;
        matchedCategory = "Di Luar Konteks / Scope";
      }
      replySource = "rule-trigger-fallback";
    }

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      sender: "pasien",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      matchedTriggerContext: matchedCategory,
      source: replySource,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsAiThinking(false);

    if (autoPlayAudio) {
      speak(replyText);
    }
  };

  const handleResetChat = () => {
    cancelSpeech();
    const initialGreeting: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "pasien",
      text: `Selamat pagi Bu Bidan, saya ingin berkonsultasi mengenai keluhan yang saya alami akhir-akhir ini...`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "rule-trigger-fallback",
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
        <DialogHeader className="flex flex-row items-center justify-between border-b px-5 py-3 bg-card shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Bot className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2 truncate">
                <span className="truncate">{staseTitle}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-normal border-blue-500/30 text-blue-600 dark:text-blue-400 hidden sm:inline-flex"
                >
                  Uji Coba Persona
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-[11px] truncate">
                Simulasi telekonsultasi dengan pasien ({patientName}, {patientAge} th).
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 🎛️ TOGGLE ENGINE: GOOGLE GEMINI VS LOCAL RULE FALLBACK */}
            <div className="flex items-center rounded-lg border border-border/80 bg-muted/60 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setEngineMode("gemini")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                  engineMode === "gemini"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Gunakan Google Gemini API untuk respons generatif alami"
              >
                <Sparkles className="size-3.5" />
                <span className="hidden sm:inline">Google Gemini</span>
                <span className="sm:hidden">Gemini</span>
              </button>
              <button
                type="button"
                onClick={() => setEngineMode("fallback")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                  engineMode === "fallback"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Gunakan Local Rule Trigger Fallback (Tanpa API, Pencocokan Kata Kunci Langsung)"
              >
                <Zap className="size-3.5" />
                <span className="hidden sm:inline">Local Fallback</span>
                <span className="sm:hidden">Fallback</span>
              </button>
            </div>

            {/* Button Putar Ulang Suara Terakhir dari Pasien */}
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleReplayLastPatientAudio}
              disabled={!lastPatientMessage}
              className="h-7 gap-1.5 text-xs font-semibold border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 hidden md:flex"
              title="Putar ulang suara respon pasien terakhir"
            >
              <RotateCcw className="size-3.5" />
              <span>Putar Suara</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setAutoPlayAudio((prev) => !prev)}
              className="h-7 gap-1 text-xs"
              title={autoPlayAudio ? "Matikan Suara Otomatis" : "Aktifkan Suara Otomatis"}
            >
              {autoPlayAudio ? (
                <Volume2 className="size-3.5 text-blue-500" />
              ) : (
                <VolumeX className="size-3.5 text-muted-foreground" />
              )}
              <span className="hidden sm:inline">{autoPlayAudio ? "Audio On" : "Mute"}</span>
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
              <span className="hidden sm:inline">Reset</span>
            </Button>

            <div className="h-4 w-px bg-border/80 mx-1" />

            {/* Seamless Header Close Button */}
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
                <span className="text-[11px] text-muted-foreground">&bull; {messages.length} Pesan</span>
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
                      <span className="font-semibold">{isUser ? "Anda (Bidan)" : patientName}</span>
                      <span>&bull; {msg.timestamp}</span>
                      {!isUser && msg.source === "gemini-api" && (
                        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Sparkles className="size-2.5" /> Gemini
                        </span>
                      )}
                      {!isUser && msg.source === "rule-trigger-fallback" && (
                        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Zap className="size-2.5" /> Fallback Trigger
                        </span>
                      )}
                      {!isUser && msg.matchedTriggerContext && (
                        <span className="text-[9px] text-muted-foreground/80 hidden sm:inline">
                          ({msg.matchedTriggerContext})
                        </span>
                      )}
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

              {/* Thinking Bubble */}
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
