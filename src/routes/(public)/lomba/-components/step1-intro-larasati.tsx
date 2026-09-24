import {
  ArrowRight,
  Bot,
  Clock,
  FileCheck,
  HeartHandshake,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Quote,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { formatDurationLabel } from "@/services/api/case-mapper";
import { playCtaClickSound, playTransitionChime } from "./lomba-sound-effects";

interface Step1IntroLarasatiProps {
  onStart: () => void;
  kasus?: Kasus;
  kelompokNama?: string;
  isAiEnabled?: boolean;
  onToggleAi?: (enabled: boolean) => void;
}

export function Step1IntroLarasati({
  onStart,
  kasus,
  kelompokNama,
  isAiEnabled = false,
  onToggleAi,
}: Step1IntroLarasatiProps) {
  const groupName = kelompokNama || "Kelompok A (Stase Pagi)";
  const caseName = kasus?.nama || "Deteksi Dini Kanker Serviks & Pemeriksaan IVA Positif";

  const rawPatientName = kasus?.nama?.split("—")[0]?.trim() || "Pasien Kasus";
  const patientName = rawPatientName.replace(/\s*\([^)]*\)/g, "").trim() || "Pasien Kasus";
  const ageMatch = kasus?.nama?.match(/\((\d+)\s*tahun\)/i);
  const patientAge = ageMatch ? `${ageMatch[1]} Tahun` : "Dewasa";

  const caseIntroText =
    kasus?.teks_perkenalan ||
    kasus?.deskripsi ||
    "Pasien datang untuk pemeriksaan klinis. Mahasiswa diminta melakukan penatalaksanaan klinis terpadu.";

  // Dynamic stations list with duration
  const staseData = kasus?.stase_data;

  const getStaseSeconds = (header?: { durasi_detik?: number; durasi_menit?: number }, fallbackSec = 300) => {
    if (typeof header?.durasi_detik === "number" && header.durasi_detik > 0) {
      return header.durasi_detik;
    }
    if (typeof header?.durasi_menit === "number" && header.durasi_menit > 0) {
      return header.durasi_menit * 60;
    }
    return fallbackSec;
  };

  const sec1 = getStaseSeconds(staseData?.stase1?.header, 300);
  const sec2 = getStaseSeconds(staseData?.stase2?.header, 300);
  const sec3 = getStaseSeconds(staseData?.stase3?.header, 300);
  const sec4 = getStaseSeconds(staseData?.stase4?.header, 300);
  const sec5 = getStaseSeconds(staseData?.stase5?.header, 300);

  const totalExamSeconds = sec1 + sec2 + sec3 + sec4 + sec5;
  const totalWaktuLabel = formatDurationLabel(totalExamSeconds);

  const circuitStations = [
    {
      pos: 1,
      title: "Pos 1: Anamnesis",
      desc: "Wawancara klinis langsung menggunakan mikrofon dengan pasien virtual untuk menggali keluhan.",
      durasi: formatDurationLabel(sec1),
      icon: Bot,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      pos: 2,
      title: "Pos 2: Multi Select Faktor Risiko",
      desc: "Identifikasi faktor risiko klinis dan patologis kanker serviks pada papan magnet interaktif.",
      durasi: formatDurationLabel(sec2),
      icon: ShieldAlert,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      pos: 3,
      title: "Pos 3: Mengurutkan Prosedur IVA",
      desc: "Susun urutan 6 langkah Prosedur pemeriksaan Inspeksi Visual Asam Asetat secara tepat.",
      durasi: formatDurationLabel(sec3),
      icon: ListChecks,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
    {
      pos: 4,
      title: "Pos 4: Interpretasi Hasil IVA (Single Choice)",
      desc: "Analisis foto porsio serviks beresolusi tinggi dan tegakkan kesimpulan diagnosis klinis.",
      durasi: formatDurationLabel(sec4),
      icon: ImageIcon,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      pos: 5,
      title: "Pos 5: Asuhan Kebidanan & Konseling",
      desc: "Bimbingan konseling empatik mengenai hasil IVA positif, tata laksana lanjutan, dan edukasi rujukan SpOG.",
      durasi: formatDurationLabel(sec5),
      icon: HeartHandshake,
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    },
  ];

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-[#8c6d23]/50 bg-[#120d08] p-5 sm:p-8 lg:p-10 shadow-2xl text-[#f3e5ab]">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a1f12_0%,_#0e0a07_100%)] opacity-100 pointer-events-none" />

      {/* Dotted Grid Texture Pattern Overlay (Tema Wayang Gold) */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1.2px,_transparent_1.2px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      {/* Ornate Gold Border Corners */}
      <div className="absolute top-4 left-4 size-10 border-t-2 border-l-2 border-[#d4af37]/60 pointer-events-none" />
      <div className="absolute top-4 right-4 size-10 border-t-2 border-r-2 border-[#d4af37]/60 pointer-events-none" />
      <div className="absolute bottom-4 left-4 size-10 border-b-2 border-l-2 border-[#d4af37]/60 pointer-events-none" />
      <div className="absolute bottom-4 right-4 size-10 border-b-2 border-r-2 border-[#d4af37]/60 pointer-events-none" />

      {/* Header Badge & Title */}
      <div className="relative z-10 w-full flex flex-col items-center text-center mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-[#d4af37] text-[#14100c] font-serif font-extrabold text-xs px-3 py-1 shadow-md uppercase tracking-wider">
            Larasati Journey Siap Dimulai
          </Badge>
          <Badge variant="outline" className="border-[#d4af37]/50 text-[#d4af37] text-xs font-mono">
            {groupName}
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#fff8db] tracking-wide">
          Pengenalan Kasus Klinis & Subjek Pasien
        </h1>
        <p className="text-xs sm:text-sm text-[#e6d59c]/90 mt-1 max-w-2xl">
          Simak profil pasien, skenario kasus, dan batas waktu 5 stase ujian sebelum menekan tombol mulai perjalanan.
        </p>
      </div>

      {/* Main Content Split: Left (Kasus & Pasien Detail) + Right (5 Stase dengan Keterangan Waktu) */}
      <div className="relative z-10 grid w-full grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ============================================================ */}
        {/* 1. DATA PASIEN & KASUS KLINIS (KOLOM KIRI)                   */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col gap-4 rounded-2xl border border-[#8c6d23]/40 bg-[#1a120a]/90 p-5 shadow-lg">

          {/* Header Pasien Profile */}
          <div className="flex items-center gap-3 border-b border-[#8c6d23]/30 pb-3.5">
            <div className="relative size-14 rounded-xl overflow-hidden border border-[#d4af37]/50 shrink-0 bg-[#2b1c0e] shadow-md">
              <img
                src="/images/fallback-pasien-2.jfif"
                alt={patientName}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/fallback-pasien-2.jfif";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-[#fff8db]">{patientName}</span>
                <Badge className="bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#fff8db] text-[10px] px-1.5 py-0">
                  {patientAge}
                </Badge>
              </div>
              <p className="text-[11px] text-[#e6d59c]/80 font-mono mt-0.5">
                Perempuan &bull; {kasus?.id || "KSS-001"}
              </p>
            </div>
          </div>

          {/* Nama Kasus */}
          <div className="flex flex-col gap-1 rounded-xl bg-[#22170d] p-3 border border-[#8c6d23]/30">
            <span className="text-[10px] text-[#d4af37] uppercase tracking-wider font-mono font-bold flex items-center gap-1">
              <FileCheck className="size-3" /> Nama Skenario Kasus
            </span>
            <span className="font-serif font-bold text-sm text-[#fff8db] leading-snug">
              {caseName}
            </span>
          </div>

          {/* Intro Kasus (Teks Perkenalan Kasus) */}
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="font-serif font-semibold text-[#d4af37] flex items-center gap-1.5">
              <Quote className="size-3.5" /> Intro & Pengantar Kasus:
            </span>
            <div className="rounded-xl border border-[#8c6d23]/30 bg-[#140d07] p-3 text-xs leading-relaxed text-[#e6d59c]/90 italic">
              &ldquo;{caseIntroText}&rdquo;
            </div>
          </div>

          {/* Atribut Kasus */}
          {/* <div className="flex flex-col gap-1.5 text-xs">
            <span className="font-serif font-semibold text-[#d4af37] flex items-center gap-1.5">
              <Tag className="size-3.5" /> Atribut & Karakteristik Kasus:
            </span>

            {kasus?.atribut && kasus.atribut.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {kasus.atribut.map((attr) => (
                  <span
                    key={attr.id}
                    className="rounded-lg border border-[#8c6d23]/40 bg-[#22170d] px-2.5 py-1 text-[11px] text-[#e6d59c]"
                  >
                    <strong className="text-[#fff8db] font-semibold">{attr.key}:</strong> {attr.value}
                  </span>
                ))}
              </div>
            ) : pasienData?.atribut && pasienData.atribut.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {pasienData.atribut.map((attr) => (
                  <span
                    key={attr.id}
                    className="rounded-lg border border-[#8c6d23]/40 bg-[#22170d] px-2.5 py-1 text-[11px] text-[#e6d59c]"
                  >
                    <strong className="text-[#fff8db] font-semibold">{attr.key}:</strong> {attr.value}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#8c6d23]/30 p-2 text-center text-[11px] text-[#e6d59c]/60">
                Atribut klinis terkonfigurasi standar
              </div>
            )}
          </div> */}
        </div>

        {/* ============================================================ */}
        {/* 2. PANDUAN 5 STASE & KETERANGAN WAKTU (KOLOM KANAN)          */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-[#8c6d23]/40 bg-[#1a120a]/90 p-5 shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-[#8c6d23]/30 pb-3 mb-3.5">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-[#d4af37]" />
                <h3 className="font-serif font-bold text-sm text-[#fff8db]">
                  Alur 5 Pos Sirkuit & Batas Waktu Ujian
                </h3>
              </div>
              <span className="text-[11px] text-[#e6d59c]/70 font-mono">
                Total Waktu: {totalWaktuLabel}
              </span>
            </div>

            {/* List of 5 Stations with Duration Badges */}
            <div className="flex flex-col gap-2.5">
              {circuitStations.map((st) => {
                const Icon = st.icon;
                return (
                  <div
                    key={st.pos}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#8c6d23]/30 bg-[#140d07] p-3 transition-all hover:border-[#d4af37]/60 hover:bg-[#1a1109]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex size-8 items-center justify-center rounded-lg border shrink-0 ${st.color}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="font-serif font-bold text-xs text-[#fff8db]">
                          {st.title}
                        </span>
                      </div>
                    </div>

                    {/* Keterangan Waktu Stase */}
                    <div className="shrink-0">
                      <Badge className="bg-[#d4af37]/15 border border-[#d4af37]/50 text-[#fff8db] text-[10px] font-mono font-semibold px-2 py-0.5 flex items-center gap-1 shadow-xs">
                        <Clock className="size-2.5 text-[#d4af37]" />
                        <span>{st.durasi}</span>
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Row: Tombol Toggle Mode Pasien (tanpa element switch) + Button Mulai Sirkuit */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[#8c6d23]/30 pt-4">
            {/* Style keyframe untuk denyut border lembut saat OFF (nudge to activate tanpa terlihat seperti border nyala) */}
            <style>{`
              @keyframes softNudgePulse {
                0%, 100% {
                  border-color: rgba(140, 109, 35, 0.35);
                  box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
                }
                50% {
                  border-color: rgba(212, 175, 55, 0.55);
                  box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
                }
              }
              .animate-soft-nudge {
                animation: softNudgePulse 2.2s ease-in-out infinite;
              }
            `}</style>

            {/* Tombol Toggle Mode Pasien (Button Card Interaktif tanpa element Switch terpisah) */}
            <button
              type="button"
              onClick={() => onToggleAi?.(!isAiEnabled)}
              className={cn(
                "relative flex items-center justify-between sm:justify-start gap-3 rounded-xl border p-2.5 sm:px-3.5 sm:py-2 transition-all duration-300 cursor-pointer select-none text-left",
                isAiEnabled
                  ? "border-[#d4af37]/80 bg-[#1e150d] shadow-[0_0_16px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]/40 hover:brightness-110"
                  : "bg-[#140d07] border-[#8c6d23]/40 animate-soft-nudge hover:bg-[#1a110a]",
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg border shrink-0 transition-colors",
                    isAiEnabled
                      ? "border-[#d4af37]/60 bg-[#d4af37]/20 text-[#d4af37]"
                      : "border-slate-700 bg-slate-800/60 text-slate-400",
                  )}
                >
                  {isAiEnabled ? <Sparkles className="size-3.5" /> : <Bot className="size-3.5" />}
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-xs text-[#fff8db]">
                      {isAiEnabled ? "Mode Pasien Interaktif" : "Mode Pasien Standar"}
                    </span>
                    <Badge
                      className={cn(
                        "text-[9px] px-1.5 py-0 font-mono tracking-tight",
                        isAiEnabled
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40",
                      )}
                    >
                      {isAiEnabled ? "LIVE" : "STANDAR"}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-[#e6d59c]/70 font-mono leading-tight">
                    {isAiEnabled
                      ? "Animasi video bergerak & dialog interaktif"
                      : "Foto pasien statis & audio suara standar"}
                  </span>
                </div>
              </div>
            </button>

            {/* Button Mulai Sirkuit */}
            <Button
              type="button"
              onClick={() => {
                playCtaClickSound();
                playTransitionChime();
                onStart();
              }}
              className="h-12 px-8 w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] text-xs font-serif font-bold tracking-widest uppercase shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:brightness-110 hover:scale-102 transition-all cursor-pointer border border-[#fff8db]/60 gap-2 active:scale-98 shrink-0"
            >
              <span>Mulai Sirkuit</span>
              <ArrowRight className="size-4 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
