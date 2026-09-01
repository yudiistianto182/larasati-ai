import * as React from "react";
import {
  Bot,
  Camera,
  Layers,
  MessageSquare,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Square,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useTextToSpeech } from "@/components/ai-consultation/use-text-to-speech";
import { VoiceInputCountdown } from "@/components/ai-consultation/voice-input-countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Avatar3dCanvas } from "./avatar-3d-canvas";

interface ChatMessage {
  id: string;
  sender: "bidan" | "pasien";
  text: string;
  timestamp: string;
}

const AVAILABLE_MODELS = [
  {
    id: "avaturn",
    name: "Model 1: Avaturn (Fotorealistik)",
    file: "/models/avaturn.glb",
    size: "13.8 MB",
    desc: "Avatar Pasien Fotorealistik Bertekstur Tinggi",
  },
  {
    id: "ny_ani",
    name: "Model 2: Ny. Ani (Stylized)",
    file: "/models/ny_ani.glb",
    size: "4.7 MB",
    desc: "Avatar Pasien Wanita dengan 52 ARKit Blendshapes",
  },
];

const TTS_PRESETS = [
  {
    label: "Keluhan Utama (Keputihan & Perih)",
    text: "Selamat pagi Bu Bidan, terima kasih sudah menerima saya di Poli KIA. Saya ingin berkonsultasi mengenai keluhan keputihan yang sangat mengganggu, gatal dan agak perih akhir-akhir ini...",
  },
  {
    label: "Kecemasan Hasil IVA / Kanker",
    text: "Bu Bidan... bagaimana hasil pemeriksaan serviks saya tadi? Apakah ada hal yang berbahaya atau kanker ya Bu? Saya sangat takut dan cemas...",
  },
  {
    label: "Riwayat HPHT & Perdarahan Kontak",
    text: "HPHT saya sekitar 3 bulan yang lalu Bu Bidan. Dan minggu lalu setelah berhubungan dengan suami, sempat keluar flek bercak darah sedikit.",
  },
  {
    label: "Respon Edukasi & Rujukan",
    text: "Alhamdulillah... terima kasih banyak atas penjelasannya yang sangat jelas dan menenangkan hati saya Bu Bidan. Saya siap mengikuti saran rujukan ke dokter spesialis.",
  },
];

export function TestInteractiveChat() {
  // Model state (Default to the photorealistic Avaturn model)
  const [selectedModelId, setSelectedModelId] = React.useState("avaturn");
  const [cameraPreset, setCameraPreset] = React.useState<"face" | "bust" | "chest">("bust");
  const [detectedMorphs, setDetectedMorphs] = React.useState<string[]>([]);
  const [showMorphList, setShowMorphList] = React.useState(false);

  // Chat & TTS simulation state
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "pasien",
      text: "Selamat pagi Bu Bidan, saya Ny. Ani (29 th). Saya ingin berkonsultasi mengenai keluhan keputihan dan flek yang saya rasakan akhir-akhir ini...",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isAiThinking, setIsAiThinking] = React.useState(false);
  const [customTtsText, setCustomTtsText] = React.useState(
    "Selamat pagi Bu Bidan, keputihan saya terasa gatal, kental dan warnanya agak kekuningan. Apakah ini berbahaya bagi kandungan saya?",
  );
  const [autoPlayAudio, setAutoPlayAudio] = React.useState(true);

  const { speak, cancel: cancelSpeech, isSpeaking } = useTextToSpeech();
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  // Auto scroll chat to bottom
  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAiThinking]);

  // Handle TTS custom test
  const handlePlayCustomTts = (textToPlay?: string) => {
    const text = textToPlay || customTtsText;
    if (!text.trim()) return;

    cancelSpeech();
    setTimeout(() => {
      speak(text.trim());
    }, 100);
  };

  // Handle incoming message from Midwife (Speech or Typing)
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

    const lowerText = text.toLowerCase();

    // Generate responsive reply
    setTimeout(() => {
      let replyText = "";
      if (lowerText.includes("hpht") || lowerText.includes("haid") || lowerText.includes("menstruasi")) {
        replyText = "HPHT saya sekitar 3 bulan yang lalu Bu Bidan. Biasanya siklus haid saya teratur 28 hari, tapi akhir-akhir ini sering ada flek.";
      } else if (lowerText.includes("hubungan") || lowerText.includes("suami") || lowerText.includes("senggama") || lowerText.includes("darah")) {
        replyText = "Iya Bu Bidan... Minggu lalu setelah berhubungan dengan suami, sempat keluar flek bercak darah sedikit. Saya jadi agak cemas Bu.";
      } else if (lowerText.includes("kb") || lowerText.includes("kontrasepsi")) {
        replyText = "Dulu setelah melahirkan anak pertama saya sempat menggunakan KB suntik 3 bulan Bu, namun sudah berhenti sekitar 1 tahun yang lalu.";
      } else if (lowerText.includes("kanker") || lowerText.includes("iva") || lowerText.includes("krioterapi")) {
        replyText = "Apakah kondisi lesi pra-kanker ini bisa sembuh total dengan krioterapi Bu? Dan apakah tindakannya terasa sakit?";
      } else {
        replyText = "Iya Bu Bidan, keputihannya terasa gatal, kental dan warnanya agak kuning kehijauan. Kadang perut bagian bawah saya juga terasa pegal kalau berdiri lama.";
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "pasien",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAiThinking(false);

      if (autoPlayAudio) {
        speak(replyText);
      }
    }, 1100);
  };

  const handleResetChat = () => {
    cancelSpeech();
    const initMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "pasien",
      text: "Selamat pagi Bu Bidan, saya ingin berkonsultasi mengenai keluhan yang saya alami akhir-akhir ini...",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([initMsg]);
    if (autoPlayAudio) {
      speak(initMsg.text);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 selection:bg-blue-500/30">
      {/* Top Header Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 px-4 py-3 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Bot className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  3D Avatar & Text-to-Speech Simulator
                </h1>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]">
                  Route: /test
                </Badge>
                <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-[10px]">
                  Lip-Sync & Posture Fixed
                </Badge>
              </div>
              <p className="text-xs text-neutral-400">
                Lingkungan pengujian terisolasi untuk 2 model GLB 3D avatar & sinkronisasi suara Text-to-Speech
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAutoPlayAudio((prev) => !prev)}
              className="h-8 gap-1.5 text-xs bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
            >
              {autoPlayAudio ? <Volume2 className="size-3.5 text-blue-400" /> : <VolumeX className="size-3.5 text-neutral-400" />}
              <span>{autoPlayAudio ? "Audio Aktif" : "Mute"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetChat}
              className="h-8 gap-1.5 text-xs bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Percakapan</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="container mx-auto p-4 flex-1 flex flex-col gap-4">
        {/* Model Switcher & Camera Preset Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 shadow-lg">
          {/* Model Switcher Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 mr-1">
              <Layers className="size-4 text-blue-400" /> Pilih Model:
            </span>
            {AVAILABLE_MODELS.map((model) => (
              <Button
                key={model.id}
                type="button"
                size="sm"
                variant={selectedModelId === model.id ? "default" : "outline"}
                onClick={() => setSelectedModelId(model.id)}
                className={cn(
                  "h-8 text-xs font-medium gap-1.5 transition-all",
                  selectedModelId === model.id
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                    : "bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-700",
                )}
              >
                <User className="size-3.5" />
                <span>{model.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({model.size})</span>
              </Button>
            ))}
          </div>

          {/* Camera View Angle Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 mr-1">
              <Camera className="size-4 text-amber-400" /> Framing Kamera:
            </span>
            {(["bust", "face", "chest"] as const).map((preset) => (
              <Button
                key={preset}
                type="button"
                size="xs"
                variant={cameraPreset === preset ? "secondary" : "ghost"}
                onClick={() => setCameraPreset(preset)}
                className={cn(
                  "h-7 text-xs",
                  cameraPreset === preset
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800",
                )}
              >
                {preset === "bust" ? "3/4 Layar (Ideal)" : preset === "face" ? "Close-up Wajah" : "Setengah Badan"}
              </Button>
            ))}
          </div>
        </div>

        {/* Two-Column Simulation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
          {/* LEFT: 3D Video Feed (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="relative flex-1 min-h-[460px] lg:min-h-[520px] rounded-2xl border border-neutral-800 bg-black overflow-hidden shadow-2xl flex flex-col justify-between">
              {/* Background: Empty Puskesmas Consultation Room */}
              <div className="absolute inset-0 z-0">
                <img
                  src="/images/puskesmas_clinic_empty.jpg"
                  alt="Puskesmas Room"
                  className="h-full w-full object-cover filter brightness-[0.5] contrast-[1.1]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/70" />
              </div>

              {/* Top Header Overlay: Live Rec Badge & Selected Model */}
              <div className="relative z-10 flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                    <span className="size-1.5 rounded-full bg-white animate-ping" />
                    <span>3D LIVE AVATAR</span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-white/90 drop-shadow">
                    Poli KIA Puskesmas
                  </span>
                </div>

                <Badge variant="outline" className="text-[10px] bg-black/60 text-white/90 border-white/20 backdrop-blur-md">
                  {selectedModel.name}
                </Badge>
              </div>

              {/* Center: 3D WebGL Avatar Canvas with Dynamic Lip-Sync & Natural Seated Pose */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                <Avatar3dCanvas
                  modelUrl={selectedModel.file}
                  isSpeaking={isSpeaking}
                  cameraPreset={cameraPreset}
                  onMorphsDetected={setDetectedMorphs}
                  className="h-full w-full"
                />
              </div>

              {/* Bottom Status Overlay */}
              <div className="relative z-10 p-3 bg-gradient-to-t from-black/95 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isSpeaking ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 px-3 py-1 text-xs text-blue-300 animate-pulse font-semibold">
                      <Volume2 className="size-3.5 animate-bounce text-blue-400" />
                      <span>Pasien Sedang Berbicara (Lip-Sync Aktif)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs text-emerald-300">
                      <div className="size-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Avatar Siap (Posisi Duduk Rileks)</span>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => setShowMorphList((prev) => !prev)}
                  className="text-[11px] text-neutral-400 hover:text-white h-6"
                >
                  <Sliders className="size-3 mr-1" />
                  {detectedMorphs.length} Morph Targets
                </Button>
              </div>
            </div>

            {/* Morph Target Inspector Drawer (Collapsible) */}
            {showMorphList && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3 text-xs text-neutral-300 max-h-40 overflow-y-auto">
                <span className="font-semibold text-white block mb-1.5">
                  Morph Targets / Blendshapes Terdeteksi ({detectedMorphs.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {detectedMorphs.map((name) => (
                    <span
                      key={name}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-mono border",
                        name.toLowerCase().includes("jaw") || name.toLowerCase().includes("mouth") || name.toLowerCase().includes("viseme")
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                          : name.toLowerCase().includes("blink")
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700",
                      )}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Text-to-Speech Simulator & Two-Way Dialogue Chat (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* 1. DEDICATED TEXT-TO-SPEECH SIMULATOR MODULE */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
                    <Volume2 className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Simulasi Text-to-Speech (TTS) & Uji Gerak Bibir</span>
                      <Sparkles className="size-3 text-blue-400" />
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Ketik kalimat apa saja atau klik preset di bawah untuk menguji respon suara dan animasi bibir avatar 3D
                    </p>
                  </div>
                </div>

                {isSpeaking && (
                  <Button
                    type="button"
                    size="xs"
                    variant="destructive"
                    onClick={cancelSpeech}
                    className="h-7 gap-1 text-xs"
                  >
                    <Square className="size-3 fill-current" /> Stop Suara
                  </Button>
                )}
              </div>

              {/* Custom Text Input */}
              <div className="flex flex-col gap-2">
                <Textarea
                  rows={2}
                  value={customTtsText}
                  onChange={(e) => setCustomTtsText(e.target.value)}
                  placeholder="Ketik kalimat bahasa Indonesia yang ingin diucapkan oleh avatar pasien..."
                  className="bg-neutral-900/90 border-neutral-700 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-blue-500"
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] text-neutral-400 font-medium mr-1">
                      Preset Klinis:
                    </span>
                    {TTS_PRESETS.map((preset, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setCustomTtsText(preset.text);
                          handlePlayCustomTts(preset.text);
                        }}
                        className="h-6 text-[10px] bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-colors"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handlePlayCustomTts()}
                    disabled={!customTtsText.trim()}
                    className="h-8 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shrink-0"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Uji Suara & Lip-Sync</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 2. TWO-WAY DIALOGUE TRANSCRIPT & VOICE INPUT */}
            <div className="flex-1 flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/80 overflow-hidden shadow-lg min-h-[380px]">
              {/* Dialogue Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5 bg-neutral-900 text-xs shrink-0">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-blue-400" />
                  Transkrip Simulasi Wawancara Bidan & Pasien
                </span>
                <span className="text-[11px] text-neutral-400">
                  {messages.length} Pesan
                </span>
              </div>

              {/* Chat Message Stream */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[320px]"
              >
                {messages.map((msg) => {
                  const isUser = msg.sender === "bidan";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col gap-1 max-w-[85%]",
                        isUser ? "self-end items-end" : "self-start items-start",
                      )}
                    >
                      <div className="flex items-center gap-1.5 px-1 text-[10px] text-neutral-400">
                        <span className="font-semibold">
                          {isUser ? "Anda (Bidan)" : "Ny. Ani (Pasien 3D)"}
                        </span>
                        <span>&bull; {msg.timestamp}</span>
                      </div>

                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm",
                          isUser
                            ? "bg-blue-600 text-white rounded-tr-xs"
                            : "bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-tl-xs",
                        )}
                      >
                        <p>{msg.text}</p>
                      </div>

                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => speak(msg.text)}
                          className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-blue-400 px-1 mt-0.5"
                        >
                          <Volume2 className="size-3" /> Putar Ulang Suara
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Thinking Indicator */}
                {isAiThinking && (
                  <div className="flex flex-col gap-1 max-w-[80%] self-start items-start">
                    <div className="flex items-center gap-1.5 px-1 text-[10px] text-neutral-400">
                      <span className="font-semibold">Ny. Ani</span>
                      <span>sedang menyusun respon...</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl bg-neutral-800 px-4 py-3 border border-neutral-700 rounded-tl-xs">
                      <div className="size-2 rounded-full bg-blue-500 animate-bounce" />
                      <div className="size-2 rounded-full bg-blue-500 animate-bounce delay-150" />
                      <div className="size-2 rounded-full bg-blue-500 animate-bounce delay-300" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Voice Input Bar with Countdown */}
              <div className="border-t border-neutral-800 p-3 bg-neutral-900 shrink-0">
                <VoiceInputCountdown
                  onSendMessage={handleSendMessage}
                  isAiSpeaking={isSpeaking || isAiThinking}
                  disabled={isAiThinking}
                  showQuickPrompts={true}
                  quickPrompts={[
                    "Kapan hari pertama haid terakhir (HPHT) Ibu?",
                    "Apakah ada rasa gatal atau perih pada keputihannya?",
                    "Pernah ada flek darah setelah berhubungan suami istri?",
                    "Apakah Ibu pernah menggunakan alat kontrasepsi / KB?",
                  ]}
                  placeholder="Katakan pertanyaan klinis atau ketik pesan..."
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
