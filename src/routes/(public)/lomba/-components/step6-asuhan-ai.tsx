import * as React from "react";
import {
  Bot,
  HeartHandshake,
  Mic,
  RotateCcw,
  Sparkles,
  User,
  Volume2,
} from "lucide-react";

import { AiVideoAvatar } from "@/components/ai-consultation/ai-video-avatar";
import { useSpeechRecognition } from "@/components/ai-consultation/use-speech-recognition";
import { useTextToSpeech } from "@/components/ai-consultation/use-text-to-speech";
import { VoiceInputCountdown } from "@/components/ai-consultation/voice-input-countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "ai" | "midwife";
  text: string;
  timestamp: string;
}

const INITIAL_ASUHAN_MESSAGES: Message[] = [
  {
    id: "msg-ash-1",
    sender: "ai",
    text: "Bu Bidan... bagaimana hasil pemeriksaan serviks saya tadi? Apakah ada hal yang berbahaya atau kanker ya Bu? Saya sangat takut...",
    timestamp: "Baru saja",
  },
];

const ASUHAN_AI_TRIGGERS = [
  {
    keywords: ["bukan kanker", "bukan vonis", "lesi pra kanker", "pra-kanker", "dini", "diobati"],
    response: "Alhamdulillah... jadi ini belum menjadi kanker ya Bu Bidan? Masih bisa disembuhkan sampai tuntas ya Bu?",
  },
  {
    keywords: ["krioterapi", "gas dingin", "bedah beku", "terapi", "tindakan"],
    response: "Apakah prosedur krioterapi itu sakit Bu? Berapa lama proses tindakannya dan apakah ada efek sampingnya bagi kehamilan saya?",
  },
  {
    keywords: ["rujuk", "spog", "dokter spesialis", "rumah sakit", "rsud"],
    response: "Baik Bu Bidan, saya siap mengikuti saran rujukan ke dokter spesialis demi kesehatan saya dan calon bayi saya.",
  },
  {
    keywords: ["suami", "kebersihan", "hubungan", "istirahat", "pola hidup"],
    response: "Baik Bu Bidan, nanti saya akan sampaikan juga ke suami untuk menjaga kebersihan bersama dan setia pada satu pasangan.",
  },
];

export function Step6AsuhanAi() {
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_ASUHAN_MESSAGES);
  const [isAiThinking, setIsAiThinking] = React.useState(false);

  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

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

  const handleUserMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "midwife",
      text,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    const lowerText = text.toLowerCase();
    const matchedTrigger = ASUHAN_AI_TRIGGERS.find((trg) =>
      trg.keywords.some((kw) => lowerText.includes(kw)),
    );

    const aiResponseText = matchedTrigger
      ? matchedTrigger.response
      : "Terima kasih banyak atas penjelasannya yang sangat jelas dan menenangkan hati saya Bu Bidan. Saya jadi lebih tenang sekarang.";

    setTimeout(() => {
      setIsAiThinking(false);
      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      speak(aiResponseText);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none text-[#f3e5ab]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 5 Cols: AI Video Patient Avatar (Equal Height: 540px) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3 h-[540px]">
          <div className="flex-1 rounded-2xl border-2 border-[#8c6d23]/50 overflow-hidden shadow-xl bg-black relative">
            <AiVideoAvatar
              isSpeaking={isSpeaking}
              isAiThinking={isAiThinking}
              patientName="Ny. Ani"
              patientAge={29}
              patientSubtitle="Konseling Asuhan Pasca IVA"
              avatarImageUrl="/images/ny_ani_patient_torso.jpg"
              backgroundImageUrl="/images/puskesmas_clinic_empty.jpg"
              theme="wayang"
              onReplayVoice={handleReplayLastAiVoice}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#8c6d23]/40 bg-[#1a130d]/90 px-3.5 py-2 text-xs shrink-0">
            <span className="text-[#d4af37]/80 flex items-center gap-1.5 font-medium">
              <Volume2 className="size-3.5 text-[#d4af37]" /> Konseling Interaktif AI Aktif
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
                <div className="flex items-center justify-between gap-2 mb-0.5 text-[10px] opacity-80">
                  <span className="font-bold">
                    {msg.sender === "midwife" ? "Anda (Bidan)" : "Ny. Ani (Pasien)"}
                  </span>
                  <span className="font-mono text-[9px]">{msg.timestamp}</span>
                </div>
                <p className="text-xs">{msg.text}</p>
              </div>
            ))}

            {isAiThinking && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl bg-[#261b11] border border-[#8c6d23]/30 px-3.5 py-2 text-xs text-[#d4af37] animate-pulse">
                <Bot className="size-3.5" />
                <span>Ny. Ani sedang menyimak dan merespons...</span>
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
