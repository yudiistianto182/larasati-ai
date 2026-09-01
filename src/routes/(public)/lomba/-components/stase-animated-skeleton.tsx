import {
  ArrowDownUp,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Hand,
  Image as ImageIcon,
  Layers,
  ListOrdered,
  Magnet,
  Mic,
  MousePointerClick,
  Radio,
  Search,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StaseAnimatedSkeletonProps {
  staseNumber: number;
}

export function StaseAnimatedSkeleton({ staseNumber }: StaseAnimatedSkeletonProps) {
  return (
    <div className="relative w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 text-slate-800 overflow-hidden select-none shadow-xs">
      {/* Dynamic Keyframes for Light-Themed Visual Demonstrations */}
      <style>{`
        /* --- POS 1 & 5: SONAR SIGNAL & CONVERSATION CYCLE --- */
        @keyframes sonarRingPulseLight {
          0% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.8);
            border-color: #d4af37;
          }
          50% {
            box-shadow: 0 0 0 10px rgba(212, 175, 55, 0);
            border-color: #fde047;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
            border-color: #b45309;
          }
        }

        @keyframes patientBubbleSequence {
          0%, 10% {
            opacity: 0;
            transform: translateY(6px) scale(0.96);
          }
          20%, 88% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          95%, 100% {
            opacity: 0;
            transform: translateY(-4px);
          }
        }

        @keyframes midwifeBubbleSequence {
          0%, 48% {
            opacity: 0;
            transform: translateY(6px) scale(0.96);
          }
          58%, 88% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          95%, 100% {
            opacity: 0;
            transform: translateY(-4px);
          }
        }

        @keyframes micActiveSequenceLight {
          0%, 25% {
            background-color: #f8fafc;
            border-color: #cbd5e1;
            box-shadow: none;
            color: #64748b;
          }
          32%, 68% {
            background-color: #fef3c7;
            border-color: #d97706;
            box-shadow: 0 0 14px rgba(217, 119, 6, 0.35);
            color: #78350f;
          }
          76%, 100% {
            background-color: #f8fafc;
            border-color: #cbd5e1;
            box-shadow: none;
            color: #64748b;
          }
        }

        @keyframes audioBarsSequence {
          0%, 25% { height: 15%; opacity: 0.3; }
          32%, 68% { height: 90%; opacity: 1; }
          76%, 100% { height: 15%; opacity: 0.3; }
        }

        /* --- POS 2: CARD DRAG RIGHT DIRECTLY FLUSH ONTO MAGNETIC BOARD --- */
        @keyframes dragCardRightToMagnetLight {
          0%, 12% {
            transform: translate(0px, 0px) scale(1);
            border-color: #cbd5e1;
            box-shadow: none;
            background-color: #ffffff;
            opacity: 1;
          }
          35% {
            transform: translate(calc(100% + 12px), 0px) scale(1.05);
            border-color: #d97706;
            box-shadow: 0 8px 20px rgba(217, 119, 6, 0.35);
            background-color: #fef3c7;
            opacity: 1;
          }
          48%, 88% {
            transform: translate(calc(100% + 12px), 0px) scale(1);
            border-color: #10b981;
            box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
            background-color: #ecfdf5;
            opacity: 1;
          }
          96%, 100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.2;
          }
        }

        /* --- POS 3: STEP CARD TRANSFERS FROM LEFT TRAY TO RIGHT SEQUENCE BOARD --- */
        @keyframes transferStepCardToRightLight {
          0%, 12% {
            transform: translate(0px, 0px) scale(1);
            border-color: #cbd5e1;
            box-shadow: none;
            background-color: #ffffff;
            opacity: 1;
          }
          35% {
            transform: translate(calc(100% + 12px), 0px) scale(1.05);
            border-color: #d97706;
            box-shadow: 0 8px 20px rgba(217, 119, 6, 0.35);
            background-color: #fef3c7;
            opacity: 1;
          }
          48%, 88% {
            transform: translate(calc(100% + 12px), 0px) scale(1);
            border-color: #10b981;
            box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
            background-color: #ecfdf5;
            opacity: 1;
          }
          96%, 100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.2;
          }
        }

        /* --- POS 4: STRICT SYNCHRONIZED HOVER (A -> B -> C) THEN SELECT C (SOLID GOLD) --- */
        @keyframes capsuleHoverSeqALight {
          0%, 20% {
            border-color: #d97706;
            background-color: #fef3c7;
            color: #78350f;
            transform: scale(1.04);
            box-shadow: 0 0 10px rgba(217, 119, 6, 0.25);
          }
          24%, 100% {
            border-color: #e2e8f0;
            background-color: #ffffff;
            color: #475569;
            transform: scale(1);
            box-shadow: none;
          }
        }

        @keyframes capsuleHoverSeqBLight {
          0%, 22% {
            border-color: #e2e8f0;
            background-color: #ffffff;
            color: #475569;
            transform: scale(1);
            box-shadow: none;
          }
          26%, 44% {
            border-color: #d97706;
            background-color: #fef3c7;
            color: #78350f;
            transform: scale(1.04);
            box-shadow: 0 0 10px rgba(217, 119, 6, 0.25);
          }
          48%, 100% {
            border-color: #e2e8f0;
            background-color: #ffffff;
            color: #475569;
            transform: scale(1);
            box-shadow: none;
          }
        }

        @keyframes capsuleHoverSeqCLight {
          0%, 46% {
            border-color: #e2e8f0;
            background-color: #ffffff;
            color: #475569;
            transform: scale(1);
            box-shadow: none;
          }
          50%, 62% {
            border-color: #d97706;
            background-color: #fef3c7;
            color: #78350f;
            transform: scale(1.04);
            box-shadow: 0 0 12px rgba(217, 119, 6, 0.3);
          }
          64%, 90% {
            border-color: #b45309;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
            color: #ffffff;
            font-weight: 800;
            box-shadow: 0 0 18px rgba(217, 119, 6, 0.45);
            transform: scale(1.08);
          }
          96%, 100% {
            border-color: #e2e8f0;
            background: #ffffff;
            color: #475569;
            transform: scale(1);
            box-shadow: none;
          }
        }

        @keyframes capsuleHoverSeqDLight {
          0%, 100% {
            border-color: #e2e8f0;
            background-color: #ffffff;
            color: #475569;
            transform: scale(1);
            box-shadow: none;
          }
        }
      `}</style>

      {/* ============================================================ */}
      {/* POS 1 & POS 5: ANAMNESIS & ASUHAN SKELETON                   */}
      {/* ============================================================ */}
      {(staseNumber === 1 || staseNumber === 5) && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-600 border-b border-slate-200 pb-2">
            <span className="font-serif font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Bot className="size-3.5 text-amber-600" />{" "}
              {staseNumber === 1 ? "Simulasi Wawancara Pasien" : "Simulasi Konseling Empatik"}
            </span>
            <Badge className="bg-amber-100 border border-amber-300 text-amber-900 text-[9px] px-1.5 py-0 font-bold">
              Siklus Respons Lisan
            </Badge>
          </div>

          <div className="grid grid-cols-12 gap-3 min-h-[155px] items-stretch">
            {/* Left: User Icon with Sonar Signal */}
            <div className="col-span-4 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 flex flex-col items-center justify-center text-center gap-2">
              <div
                style={{ animation: "sonarRingPulseLight 2.5s infinite" }}
                className="relative size-14 rounded-full border-2 border-amber-500 bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-md"
              >
                <User className="size-7 text-white" />
                <div className="absolute inset-0 rounded-full border border-amber-400 animate-ping opacity-40" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[11px] text-slate-900">
                  Ny. Ani (45 Tahun)
                </span>
                <span className="text-[9px] text-amber-800 font-mono font-medium">
                  {staseNumber === 1 ? "Wawancara" : "Edukasi Empati"}
                </span>
              </div>
            </div>

            {/* Right: Sequential Dialog Animation + Synchronized Mic Action */}
            <div className="col-span-8 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 flex flex-col justify-between gap-2">
              <div className="flex flex-col gap-2 min-h-[75px]">
                {/* 1. Dialog Pasien */}
                <div
                  style={{ animation: "patientBubbleSequence 6s ease-in-out infinite" }}
                  className="self-start rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-[10px] text-slate-700 max-w-[95%] shadow-xs flex items-start gap-1.5"
                >
                  <span className="font-bold text-amber-700 shrink-0">Pasien:</span>
                  <span>
                    {staseNumber === 1
                      ? "“Saya sering keputihan berbau dan keluar flek setelah senggama...”"
                      : "“Apakah saya terkena kanker serviks Bu Bidan? Saya cemas...”"}
                  </span>
                </div>

                {/* 2. Dialog Bidan */}
                <div
                  style={{ animation: "midwifeBubbleSequence 6s ease-in-out infinite" }}
                  className="self-end rounded-lg bg-amber-100/90 border border-amber-300 px-2.5 py-1.5 text-[10px] text-amber-950 font-semibold max-w-[95%] shadow-xs flex items-start gap-1.5"
                >
                  <span className="font-bold text-amber-800 shrink-0">Bidan:</span>
                  <span>
                    {staseNumber === 1
                      ? "“Kapan HPHT terakhir dan apakah siklus haid teratur?”"
                      : "“Tenang Bu, ini lesi pra-kanker dan bisa diobati tuntas dengan krioterapi.”"}
                  </span>
                </div>
              </div>

              {/* 3. HIGHLIGHT TARGET: Smart Synchronized Microphone Bar */}
              <div
                style={{ animation: "micActiveSequenceLight 6s ease-in-out infinite" }}
                className="relative rounded-lg border-2 p-1.5 flex items-center justify-between transition-all duration-300"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <div className="size-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Mic className="size-3" />
                  </div>
                  <span>[Bicara via Mikrofon]</span>
                </div>

                {/* Equalizer audio bars that bounce while active */}
                <div className="flex items-center gap-0.5 h-3">
                  {[40, 90, 60, 100, 70, 30].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        animation: "audioBarsSequence 6s ease-in-out infinite",
                        animationDelay: `${i * 0.08}s`,
                      }}
                      className="w-1 bg-amber-600 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POS 2: FAKTOR RISIKO MAGNET SKELETON                         */}
      {/* ============================================================ */}
      {staseNumber === 2 && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-600 border-b border-slate-200 pb-2">
            <span className="font-serif font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Magnet className="size-3.5 text-amber-600" /> Miniatur Papan Magnet Faktor Risiko
            </span>
            <Badge className="bg-amber-100 border border-amber-300 text-amber-900 text-[9px] px-1.5 py-0 font-bold">
              Baki Kiri &rarr; Papan Kanan
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 min-h-[140px] items-stretch">
            {/* 1. KIRI: Baki Kartu Pilihan */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 flex flex-col justify-between gap-1.5">
              <span className="text-[9px] text-slate-600 font-mono font-bold flex items-center gap-1">
                <Hand className="size-2.5 text-amber-600" /> BAKI KARTU (Kiri):
              </span>
              <div className="flex flex-col gap-2 relative">
                {/* Static Card in Tray */}
                <div className="rounded-lg bg-white border border-slate-200 p-1.5 text-[10px] text-slate-500 truncate shadow-2xs">
                  Keputihan Patologis
                </div>

                {/* ANIMATED DRAGGING CARD */}
                <div
                  style={{ animation: "dragCardRightToMagnetLight 3.8s ease-in-out infinite" }}
                  className="rounded-lg border-2 p-1.5 flex items-center justify-between text-[10px] text-slate-900 font-bold z-20 shadow-xs"
                >
                  <span className="truncate">Perdarahan Kontak</span>
                  <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                </div>
              </div>
              <span className="text-[8px] text-slate-500 italic">Tarik / Klik kartu</span>
            </div>

            {/* 2. KANAN: Papan Magnet Dropzone */}
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50/50 p-2.5 flex flex-col justify-between gap-1.5 shadow-inner">
              <span className="text-[9px] text-amber-900 font-mono font-bold flex items-center gap-1">
                <Magnet className="size-3" /> PAPAN MAGNET (Kanan):
              </span>
              <div className="flex flex-col gap-2 relative">
                {/* Slot 1: Sudah Ada Kartu Menempel */}
                <div className="rounded-lg bg-white border border-slate-200 p-1.5 flex items-center justify-between text-[10px] text-slate-800 shadow-2xs">
                  <span className="truncate">Riwayat Multiparitas</span>
                  <Badge className="bg-emerald-600 text-white text-[8px] px-1 py-0">Menempel</Badge>
                </div>

                {/* Slot 2: Target Slot */}
                <div className="rounded-lg border-2 border-dashed border-amber-400 bg-white/80 p-1.5 flex items-center justify-center text-[9px] text-amber-800 min-h-[28px] font-medium">
                  <span>[Slot Magnet Target]</span>
                </div>
              </div>
              <span className="text-[8px] text-amber-700 italic">Area tempel jawaban</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POS 3: MENGURUTKAN PROSEDUR IVA SKELETON (2 KOLOM)           */}
      {/* ============================================================ */}
      {staseNumber === 3 && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-600 border-b border-slate-200 pb-2">
            <span className="font-serif font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Layers className="size-3.5 text-amber-600" /> Miniatur Alur Prosedur IVA (2 Kolom)
            </span>
            <Badge className="bg-amber-100 border border-amber-300 text-amber-900 text-[9px] px-1.5 py-0 font-bold">
              Baki Kiri &rarr; Urutan Kanan
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 min-h-[140px] items-stretch">
            {/* 1. KIRI: Baki Langkah Tersedia */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 flex flex-col justify-between gap-1.5">
              <span className="text-[9px] text-slate-600 font-mono font-bold flex items-center gap-1">
                <Layers className="size-2.5 text-amber-600" /> 1. BAKI LANGKAH (Kiri):
              </span>
              <div className="flex flex-col gap-2 relative">
                {/* Static unchosen step */}
                <div className="rounded-lg bg-white border border-slate-200 p-1.5 text-[10px] text-slate-500 truncate shadow-2xs">
                  Vulva Hygiene & Bersihkan Lendir
                </div>

                {/* ANIMATED STEP CARD */}
                <div
                  style={{ animation: "transferStepCardToRightLight 3.8s ease-in-out infinite" }}
                  className="rounded-lg border-2 p-1.5 flex items-center justify-between text-[10px] text-slate-900 font-bold z-20 shadow-xs"
                >
                  <span className="truncate">Oleskan Asam Asetat 3-5%</span>
                  <ArrowRight className="size-3 text-amber-600 shrink-0" />
                </div>
              </div>
              <span className="text-[8px] text-slate-500 italic">Klik kartu untuk memilih</span>
            </div>

            {/* 2. KANAN: Papan Urutan SOP Terpilih */}
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50/50 p-2.5 flex flex-col justify-between gap-1.5 shadow-inner">
              <span className="text-[9px] text-amber-900 font-mono font-bold flex items-center gap-1">
                <ListOrdered className="size-3" /> 2. URUTAN TERPILIH (Kanan):
              </span>
              <div className="flex flex-col gap-2 relative">
                {/* Step 01 */}
                <div className="rounded-lg bg-white border border-slate-200 p-1.5 flex items-center justify-between text-[10px] text-slate-800 shadow-2xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge className="bg-amber-500 text-white font-mono text-[8px] font-black px-1 py-0">01</Badge>
                    <span className="truncate">Informed consent & cuci tangan</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[7px] px-1 py-0">SOP #1</Badge>
                </div>

                {/* Step 02 Target Slot */}
                <div className="rounded-lg border-2 border-dashed border-amber-400 bg-white/80 p-1.5 flex items-center justify-between text-[9px] text-amber-800 min-h-[28px] font-medium">
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-amber-600 text-white font-mono text-[8px] font-bold px-1 py-0">02</Badge>
                    <span>[Slot Urutan Langkah #2]</span>
                  </div>
                  <ArrowDownUp className="size-3 text-amber-600" />
                </div>
              </div>
              <span className="text-[8px] text-amber-700 italic">Atur urutan 01 - 06</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POS 4: INTERPRETASI VISUAL SKELETON (2 KOLOM: FOTO & PILIHAN) */}
      {/* ============================================================ */}
      {staseNumber === 4 && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-600 border-b border-slate-200 pb-2">
            <span className="font-serif font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-amber-600" /> Miniatur Interpretasi Visual (2 Kolom)
            </span>
            <Badge className="bg-amber-100 border border-amber-300 text-amber-900 text-[9px] px-1.5 py-0 font-bold">
              Foto Kiri &rarr; Pilihan Kanan
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 min-h-[140px] items-stretch">
            {/* 1. KIRI: Foto Serviks Skeleton */}
            <div className="rounded-xl border border-slate-300 bg-slate-900 p-2.5 flex flex-col justify-between relative overflow-hidden text-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-300 font-mono">FOTO SERVIKS:</span>
                <Badge variant="outline" className="border-amber-400/80 text-amber-300 text-[8px] px-1 py-0">
                  <Search className="size-2 mr-0.5" /> Zoom & Pan
                </Badge>
              </div>

              <div className="flex flex-col items-center justify-center my-auto py-1">
                <div className="relative size-14 rounded-full bg-[#6b2121] border-2 border-amber-400 flex items-center justify-center shadow-inner">
                  <div className="size-3.5 rounded-full bg-[#200909]" />
                  <div className="absolute top-1 right-2 size-4.5 rounded-full bg-white/90 border border-amber-300 shadow-xs" />
                </div>
                <span className="text-[9px] text-slate-200 mt-1 font-serif">Plak Asetowhite SSK</span>
              </div>

              <span className="text-[8px] text-amber-300/80 italic">Scroll untuk zoom</span>
            </div>

            {/* 2. KANAN: Pilihan Jawaban A, B, C, D Stacked */}
            <div className="rounded-xl border-2 border-amber-300 bg-slate-50/80 p-2.5 flex flex-col justify-between gap-1.5 shadow-inner">
              <span className="text-[9px] text-amber-900 font-mono font-bold flex items-center gap-1">
                <MousePointerClick className="size-3" /> PILIH DIAGNOSIS:
              </span>

              <div className="flex flex-col gap-1.5">
                {/* Option A */}
                <div
                  style={{ animation: "capsuleHoverSeqALight 5.2s ease-in-out infinite" }}
                  className="rounded-lg border px-2 py-1 flex items-center justify-between text-[9px] font-serif transition-all"
                >
                  <span className="truncate">A. Normal Fisiologis</span>
                  <span className="font-mono text-[8px]">Opsi A</span>
                </div>

                {/* Option B */}
                <div
                  style={{ animation: "capsuleHoverSeqBLight 5.2s ease-in-out infinite" }}
                  className="rounded-lg border px-2 py-1 flex items-center justify-between text-[9px] font-serif transition-all"
                >
                  <span className="truncate">B. Servisitis Akut</span>
                  <span className="font-mono text-[8px]">Opsi B</span>
                </div>

                {/* Option C (Selected Solid Gold) */}
                <div
                  style={{ animation: "capsuleHoverSeqCLight 5.2s ease-in-out infinite" }}
                  className="rounded-lg border px-2 py-1 flex items-center justify-between text-[9px] font-serif transition-all"
                >
                  <span className="truncate">C. IVA Positif Lesi Luas</span>
                  <Check className="size-3 text-white" />
                </div>

                {/* Option D */}
                <div
                  style={{ animation: "capsuleHoverSeqDLight 5.2s ease-in-out infinite" }}
                  className="rounded-lg border px-2 py-1 flex items-center justify-between text-[9px] font-serif transition-all"
                >
                  <span className="truncate">D. Kanker Serviks Invasif</span>
                  <span className="font-mono text-[8px]">Opsi D</span>
                </div>
              </div>

              <span className="text-[8px] text-slate-500 italic">Pilih 1 jawaban terbaik</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POS 6: PEREKAMAN SUARA SKELETON                             */}
      {/* ============================================================ */}
      {staseNumber === 6 && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-600 border-b border-slate-200 pb-2">
            <span className="font-serif font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Radio className="size-3.5 text-rose-500" /> Miniatur Perekaman Laporan Klinis
            </span>
            <Badge className="bg-rose-100 border border-rose-300 text-rose-800 text-[9px] px-1.5 py-0 font-bold">
              Audio Examiner
            </Badge>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-1 h-6">
              {[30, 70, 100, 50, 90, 40, 80, 60, 95, 35, 75, 45].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: `${h}%`,
                    animation: "audioBarsSequence 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.08}s`,
                  }}
                  className="w-1 bg-amber-500 rounded-full"
                />
              ))}
            </div>

            <div
              style={{ animation: "sonarRingPulseLight 2s infinite" }}
              className="relative rounded-full border-2 border-rose-500 bg-rose-50 px-4 py-1.5 flex items-center gap-2 text-xs font-bold text-rose-700 shadow-md"
            >
              <div className="size-3 rounded-full bg-rose-500 animate-ping" />
              <span>[Mulai Rekam Suara Laporan]</span>
            </div>

            <span className="text-[10px] text-slate-500 font-mono">
              Batas Rekam: 04:00 Menit &bull; Sampaikan kesimpulan & rencana rujukan
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
