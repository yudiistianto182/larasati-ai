import * as React from "react";
import {
  Bot,
  RotateCcw,
  User,
  Volume2,
} from "lucide-react";

import { AiVideoAvatar } from "@/components/ai-consultation/ai-video-avatar";
import { useTextToSpeech } from "@/components/ai-consultation/use-text-to-speech";
import { VoiceInputCountdown } from "@/components/ai-consultation/voice-input-countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchPatientCounselingAiReply } from "@/lib/gemini-ai";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { playCountdownTickSound, playCtaClickSound } from "./lomba-sound-effects";

interface Message {
  id: string;
  sender: "ai" | "midwife";
  text: string;
  category?: string;
  timestamp: string;
}

interface Step6AsuhanAiProps {
  isStarted?: boolean;
  kasus?: Kasus;
}

const FALLBACK_ASUHAN_TRIGGERS = [
  {
    keywords: ["bukan kanker", "bukan vonis", "lesi pra kanker", "pra-kanker", "dini", "diobati"],
    response: "Alhamdulillah... jadi ini belum menjadi kanker ya Bu Bidan? Masih bisa disembuhkan sampai tuntas ya Bu?",
    konteks: "Edukasi Pra-Kanker",
  },
  {
    keywords: ["krioterapi", "gas dingin", "bedah beku", "terapi", "tindakan"],
    response: "Apakah prosedur krioterapi itu sakit Bu? Berapa lama proses tindakannya dan apakah ada efek sampingnya bagi kehamilan saya?",
    konteks: "Penjelasan Tindakan",
  },
  {
    keywords: ["rujuk", "spog", "dokter spesialis", "rumah sakit", "rsud"],
    response: "Baik Bu Bidan, saya siap mengikuti saran rujukan ke dokter spesialis demi kesehatan saya dan penanganan yang terbaik.",
    konteks: "Rujukan SpOG",
  },
  {
    keywords: ["suami", "kebersihan", "hubungan", "istirahat", "pola hidup"],
    response: "Baik Bu Bidan, nanti saya akan sampaikan juga ke suami untuk menjaga kebersihan bersama dan pola hidup sehat.",
    konteks: "Pola Hidup & KIE Suami",
  },
];

export function Step6AsuhanAi({ isStarted = false, kasus }: Step6AsuhanAiProps) {
  const patientName = kasus?.nama?.split("—")[0]?.trim() || "Ny. A";
  const stase5Data = kasus?.stase_data?.stase5;
  const triggers = stase5Data?.triggers || [];

  const initialText =
    triggers[0]?.jawaban_cadangan ||
    "Bu Bidan... bagaimana hasil pemeriksaan serviks saya tadi? Apakah ada hal yang berbahaya atau kanker ya Bu? Saya sangat takut dan cemas...";

  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "msg-ash-1",
      sender: "ai",
      text: initialText,
      category: "Kekhawatiran Pasien",
      timestamp: "Baru saja",
    },
  ]);
  const [isAiThinking, setIsAiThinking] = React.useState(false);

  // 3-second countdown before patient starts speaking (starts only when student clicks Mulai Pengerjaan Pos)
  const [countdownValue, setCountdownValue] = React.useState<number>(3);
  const [isCountingDown, setIsCountingDown] = React.useState<boolean>(false);
  const hasSpokenInitialRef = React.useRef<boolean>(false);

  const { speak, isSpeaking, cancel } = useTextToSpeech();
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  // Reset when kasus changes
  React.useEffect(() => {
    if (triggers.length > 0) {
      setMessages([
        {
          id: `msg-ash-init-${Date.now()}`,
          sender: "ai",
          text: triggers[0]?.jawaban_cadangan || initialText,
          category: "Kekhawatiran Pasien",
          timestamp: "Baru saja",
        },
      ]);
    }
  }, [kasus]);

  // Start countdown only when isStarted is true
  React.useEffect(() => {
    if (isStarted && !hasSpokenInitialRef.current && countdownValue === 3 && !isCountingDown) {
      setIsCountingDown(true);
      playCountdownTickSound(3);
    }
  }, [isStarted, countdownValue, isCountingDown]);

  // Countdown timer effect with audio tick
  React.useEffect(() => {
    if (!isCountingDown || !isStarted) return;

    if (countdownValue > 1) {
      const timer = setTimeout(() => {
        const nextVal = countdownValue - 1;
        setCountdownValue(nextVal);
        playCountdownTickSound(nextVal);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownValue === 1) {
      const timer = setTimeout(() => {
        setIsCountingDown(false);
        setCountdownValue(0);
        playCountdownTickSound(0);
        hasSpokenInitialRef.current = true;
        speak(messages[0]?.text || initialText);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdownValue, isCountingDown, isStarted, messages, initialText, speak]);

  React.useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAiThinking]);

  const handleReplayLastAiVoice = () => {
    const lastAiMsg = [...messages].reverse().find((m) => m.sender === "ai");
    if (lastAiMsg) {
      speak(lastAiMsg.text);
    }
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "midwife",
      text,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    try {
      const historyItems = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const aiResult = await fetchPatientCounselingAiReply({
        userMessage: text,
        kasus,
        chatHistory: [...historyItems, { sender: "midwife", text }],
      });

      setIsAiThinking(false);
      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: aiResult.replyText,
        category: aiResult.matchedCategory || "Konseling",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speak(aiResult.replyText);
    } catch {
      setIsAiThinking(false);
      const fallbackReply =
        triggers[0]?.jawaban_cadangan ||
        "Terima kasih banyak atas penjelasan dan edukasinya yang sangat menenangkan Bu Bidan. Saya mengerti dan akan mengikuti seluruh arahan dan asuhan yang Ibu sampaikan.";
      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: fallbackReply,
        category: triggers[0]?.konteks || "Respon Empatik Pasien",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      speak(fallbackReply);
    }
  };

  return (
    <div className="relative flex flex-col gap-4 w-full select-none text-[#f3e5ab]">
      {/* 3-Second Pre-Conversation Countdown Overlay */}
      {isCountingDown && (
        <div className="absolute inset-0 z-40 rounded-3xl bg-[#0e0a07]/85 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4 text-center p-6 max-w-md">
            <Badge className="bg-[#d4af37] text-[#14100c] font-serif font-black text-xs px-3.5 py-1 uppercase tracking-widest shadow-md">
              Pos 5: Asuhan & Konseling ({patientName})
            </Badge>

            <span className="text-sm font-serif font-bold text-[#fff8db]">
              Bersiap... Pasien akan mulai berbicara dalam
            </span>

            <div className="relative flex size-24 items-center justify-center rounded-full border-4 border-[#d4af37] bg-gradient-to-br from-[#3b2713] to-[#1a1109] shadow-[0_0_40px_rgba(212,175,55,0.7)]">
              <span className="font-serif font-black text-5xl text-[#fff8db] animate-in zoom-in-75 duration-300">
                {countdownValue}
              </span>
              <div className="absolute inset-0 rounded-full border-2 border-[#d4af37] animate-ping opacity-35" />
            </div>

            <p className="text-xs text-[#e6d59c]/80 font-mono">
              🔊 Pastikan speaker & mikrofon aktif untuk berdialog langsung
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 5 Cols: Video Patient Avatar (Equal Height: 540px) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3 h-[540px]">
          <div className="flex-1 rounded-2xl border-2 border-[#8c6d23]/50 overflow-hidden shadow-xl bg-black relative">
            <AiVideoAvatar
              isSpeaking={isSpeaking}
              isAiThinking={isAiThinking}
              patientName={patientName}
              patientAge={parseInt(kasus?.atribut?.find((a) => a.key === "Usia")?.value || "45", 10) || 45}
              patientSubtitle="Konseling Asuhan Pasca IVA"
              avatarImageUrl="/images/ny_ani_patient_torso.jpg"
              backgroundImageUrl="/images/puskesmas_clinic_empty.jpg"
              theme="wayang"
              onReplayVoice={handleReplayLastAiVoice}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#8c6d23]/40 bg-[#1a130d]/90 px-3.5 py-2 text-xs shrink-0">
            <span className="text-[#d4af37]/80 flex items-center gap-1.5 font-medium">
              <Volume2 className="size-3.5 text-[#d4af37]" /> Konseling Interaktif Aktif
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleReplayLastAiVoice}
              className="h-6 text-[11px] gap-1 bg-[#261b11] text-[#f3e5ab] border-[#8c6d23]/50 hover:bg-[#342416]"
            >
              <RotateCcw className="size-3 text-[#d4af37]" />
              <span>Putar Ulang Suara</span>
            </Button>
          </div>
        </div>

        {/* Right 7 Cols: Dialogue Chat & Voice Input Controls (Equal Height: 540px) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 overflow-hidden shadow-lg h-[540px]">
          <div className="flex items-center justify-between border-b border-[#8c6d23]/30 px-4 py-2.5 bg-[#23180f] shrink-0">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-serif font-bold text-xs text-[#fff8db]">
                Transkrip Konseling & Edukasi Pasien
              </span>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono border-[#d4af37]/40 text-[#d4af37] bg-[#1a130d]">
              {messages.length} Pesan
            </Badge>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md leading-relaxed",
                  msg.sender === "midwife"
                    ? "ml-auto bg-gradient-to-r from-[#8c6d23] via-[#b89530] to-[#8c6d23] text-[#14100c] font-medium rounded-tr-xs"
                    : "mr-auto bg-[#261b11] text-[#f3e5ab] border border-[#8c6d23]/40 rounded-tl-xs",
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-80">
                  <span className="font-bold flex items-center gap-1.5">
                    {msg.sender === "midwife" ? (
                      <>
                        <User className="size-3" /> Anda (Bidan)
                      </>
                    ) : (
                      <>
                        <Bot className="size-3 text-[#d4af37]" /> {patientName}
                      </>
                    )}
                  </span>
                  <span className="font-mono text-[9px]">{msg.timestamp}</span>
                </div>
                <p className="text-xs">{msg.text}</p>
              </div>
            ))}

            {isAiThinking && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl bg-[#261b11] border border-[#8c6d23]/30 px-3.5 py-2 text-xs text-[#d4af37] animate-pulse">
                <Bot className="size-3.5" />
                <span>{patientName} sedang menyimak dan merespons...</span>
              </div>
            )}
          </div>

          <div className="border-t border-[#8c6d23]/30 bg-[#1e150d] p-3.5 shrink-0">
            <VoiceInputCountdown
              onSendMessage={handleUserMessage}
              isAiSpeaking={isSpeaking}
              isAiThinking={isAiThinking}
              showQuickPrompts={false}
              theme="wayang"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
