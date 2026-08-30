import * as React from "react";
import {
  ArrowDownUp,
  Bot,
  Check,
  CheckCircle2,
  Hand,
  Heart,
  Image as ImageIcon,
  Layers,
  Magnet,
  Mic,
  MicOff,
  MousePointer,
  MousePointerClick,
  Radio,
  Search,
  Sparkles,
  User,
  Volume2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StaseAnimatedSkeletonProps {
  staseNumber: number;
}

export function StaseAnimatedSkeleton({ staseNumber }: StaseAnimatedSkeletonProps) {
  return (
    <div className="relative w-full rounded-2xl border border-[#8c6d23]/40 bg-gradient-to-b from-[#19110a] to-[#0f0a06] p-4 sm:p-5 text-[#f3e5ab] overflow-hidden select-none shadow-inner">
      {/* Dynamic Keyframes for Accurate Visual Demonstrations */}
      <style>{`
        /* --- POS 1 & 5: SONAR SIGNAL & CONVERSATION CYCLE --- */
        @keyframes sonarRingPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.8);
            border-color: #d4af37;
          }
          50% {
            box-shadow: 0 0 0 10px rgba(212, 175, 55, 0);
            border-color: #fff8db;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
            border-color: #8c6d23;
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

        @keyframes micActiveSequence {
          0%, 25% {
            background-color: #22170d;
            border-color: rgba(140, 109, 35, 0.4);
            box-shadow: none;
            color: rgba(212, 175, 55, 0.5);
          }
          32%, 68% {
            background-color: #3b2814;
            border-color: #d4af37;
            box-shadow: 0 0 18px rgba(212, 175, 55, 0.6);
            color: #fff8db;
          }
          76%, 100% {
            background-color: #22170d;
            border-color: rgba(140, 109, 35, 0.4);
            box-shadow: none;
            color: rgba(212, 175, 55, 0.5);
          }
        }

        @keyframes audioBarsSequence {
          0%, 25% { height: 15%; opacity: 0.3; }
          32%, 68% { height: 90%; opacity: 1; }
          76%, 100% { height: 15%; opacity: 0.3; }
        }

        /* --- POS 2: CARD DRAG DOWN DIRECTLY FLUSH ONTO MAGNETIC BOARD --- */
        @keyframes dragCardDownToMagnetExact {
          0%, 12% {
            transform: translateY(0px) scale(1);
            border-color: rgba(212, 175, 55, 0.5);
            box-shadow: none;
            background-color: #24180e;
            opacity: 1;
          }
          35% {
            transform: translateY(68px) scale(1.05);
            border-color: #d4af37;
            box-shadow: 0 12px 28px rgba(212, 175, 55, 0.6);
            background-color: #3d2814;
            opacity: 1;
          }
          48%, 88% {
            transform: translateY(68px) scale(1);
            border-color: #10b981;
            box-shadow: 0 0 18px rgba(16, 185, 129, 0.6);
            background-color: #15281a;
            opacity: 1;
          }
          96%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.2;
          }
        }

        /* --- POS 3: REALISTIC CARD DRAG & DROP REORDERING --- */
        @keyframes draggedStepCard {
          0%, 15% {
            transform: translateY(0px) scale(1);
            z-index: 10;
            box-shadow: none;
            border-color: #8c6d23;
          }
          35% {
            transform: translateY(38px) scale(1.04) rotate(1deg);
            z-index: 20;
            box-shadow: 0 8px 20px rgba(212, 175, 55, 0.5);
            border-color: #d4af37;
          }
          55%, 85% {
            transform: translateY(38px) scale(1) rotate(0deg);
            z-index: 10;
            box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
            border-color: #d4af37;
          }
          95%, 100% {
            transform: translateY(0px) scale(1);
            z-index: 10;
          }
        }

        @keyframes displacedStepCard {
          0%, 15% {
            transform: translateY(0px);
          }
          35%, 85% {
            transform: translateY(-38px);
          }
          95%, 100% {
            transform: translateY(0px);
          }
        }

        /* --- POS 4: STRICT SYNCHRONIZED HOVER (A -> B -> C) THEN SELECT C (SOLID GOLD) --- */
        @keyframes capsuleHoverSeqA {
          0%, 20% {
            border-color: #d4af37;
            background-color: rgba(212, 175, 55, 0.25);
            color: #fff8db;
            transform: scale(1.06);
            box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
          }
          24%, 100% {
            border-color: rgba(140, 109, 35, 0.35);
            background-color: #20160d;
            color: rgba(243, 229, 171, 0.6);
            transform: scale(1);
            box-shadow: none;
          }
        }

        @keyframes capsuleHoverSeqB {
          0%, 22% {
            border-color: rgba(140, 109, 35, 0.35);
            background-color: #20160d;
            color: rgba(243, 229, 171, 0.6);
            transform: scale(1);
            box-shadow: none;
          }
          26%, 44% {
            border-color: #d4af37;
            background-color: rgba(212, 175, 55, 0.25);
            color: #fff8db;
            transform: scale(1.06);
            box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
          }
          48%, 100% {
            border-color: rgba(140, 109, 35, 0.35);
            background-color: #20160d;
            color: rgba(243, 229, 171, 0.6);
            transform: scale(1);
            box-shadow: none;
          }
        }

        @keyframes capsuleHoverSeqC {
          0%, 46% {
            border-color: rgba(140, 109, 35, 0.35);
            background-color: #20160d;
            color: rgba(243, 229, 171, 0.6);
            transform: scale(1);
            box-shadow: none;
          }
          50%, 62% {
            /* Hover stage on C */
            border-color: #d4af37;
            background-color: rgba(212, 175, 55, 0.3);
            color: #fff8db;
            transform: scale(1.06);
            box-shadow: 0 0 14px rgba(212, 175, 55, 0.5);
          }
          64%, 90% {
            /* Selected Solid Gold stage on C */
            border-color: #fff8db;
            background: linear-gradient(135deg, #8c6d23 0%, #d4af37 50%, #8c6d23 100%);
            color: #14100c;
            font-weight: 900;
            box-shadow: 0 0 24px rgba(212, 175, 55, 0.9);
            transform: scale(1.12);
          }
          96%, 100% {
            border-color: rgba(140, 109, 35, 0.35);
            background: #20160d;
            color: rgba(243, 229, 171, 0.6);
            transform: scale(1);
            box-shadow: none;
          }
        }

        @keyframes capsuleHoverSeqD {
          0%, 100% {
            border-color: rgba(140, 109, 35, 0.35);
            background-color: #20160d;
            color: rgba(243, 229, 171, 0.6);
            transform: scale(1);
            box-shadow: none;
          }
        }

        @keyframes movingCursorTrack {
          0%, 20% {
            transform: translate(12%, 0px);
            opacity: 1;
          }
          26%, 44% {
            transform: translate(37%, 0px);
            opacity: 1;
          }
          50%, 90% {
            transform: translate(62%, 0px) scale(0.92);
            opacity: 1;
          }
          95%, 100% {
            transform: translate(12%, 0px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a1c0e_0%,_transparent_75%)] opacity-50 pointer-events-none" />

      {/* ============================================================ */}
      {/* POS 1 & POS 5: ANAMNESIS & ASUHAN AI SKELETON               */}
      {/* (Bulat User Icon Sonar + Sequential Dialog + Smart Mic Sync) */}
      {/* ============================================================ */}
      {(staseNumber === 1 || staseNumber === 5) && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-[#e6d59c]/80 border-b border-[#8c6d23]/30 pb-2">
            <span className="font-serif font-bold text-xs text-[#fff8db] flex items-center gap-1.5">
              <Bot className="size-3.5 text-[#d4af37]" />{" "}
              {staseNumber === 1 ? "Simulasi Wawancara Pasien AI" : "Simulasi Konseling Empatik AI"}
            </span>
            <Badge className="bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fff8db] text-[9px] px-1.5 py-0">
              Siklus Respons Lisan
            </Badge>
          </div>

          <div className="grid grid-cols-12 gap-3 min-h-[155px] items-stretch">
            {/* Left: User Icon Bulat dengan Hover Border Memancarkan Sinyal Sonar */}
            <div className="col-span-4 rounded-xl border border-[#8c6d23]/30 bg-[#22170d]/80 p-2 flex flex-col items-center justify-center text-center gap-2">
              <div
                style={{ animation: "sonarRingPulse 2.5s infinite" }}
                className="relative size-14 rounded-full border-2 border-[#d4af37] bg-gradient-to-b from-[#3a2512] to-[#1a1109] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                <User className="size-7 text-[#fff8db]" />
                {/* Sonar beacon pulse */}
                <div className="absolute inset-0 rounded-full border border-[#d4af37] animate-ping opacity-35" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[11px] text-[#fff8db]">
                  {staseNumber === 1 ? "Ny. Ani (Pasien)" : "Pasien Konseling"}
                </span>
                <span className="text-[9px] text-[#d4af37]/80 font-mono">
                  {staseNumber === 1 ? "Wawancara AI" : "Edukasi Empati"}
                </span>
              </div>
            </div>

            {/* Right: Sequential Dialog Animation + Synchronized Mic Action */}
            <div className="col-span-8 rounded-xl border border-[#8c6d23]/30 bg-[#160f09]/90 p-2.5 flex flex-col justify-between gap-2">
              <div className="flex flex-col gap-2 min-h-[75px]">
                {/* 1. Dialog Pasien (Muncul Pertama) */}
                <div
                  style={{ animation: "patientBubbleSequence 6s ease-in-out infinite" }}
                  className="self-start rounded-lg bg-[#251a10] border border-[#8c6d23]/40 px-2.5 py-1.5 text-[10px] text-[#e6d59c] max-w-[95%] shadow-2xs flex items-start gap-1.5"
                >
                  <span className="font-bold text-[#d4af37] shrink-0">Pasien:</span>
                  <span>
                    {staseNumber === 1
                      ? "“Saya sering keputihan berbau dan keluar flek setelah senggama...”"
                      : "“Apakah saya terkena kanker serviks Bu Bidan? Saya cemas...”"}
                  </span>
                </div>

                {/* 2. Dialog Bidan (Muncul Setelah Bidan Bicara) */}
                <div
                  style={{ animation: "midwifeBubbleSequence 6s ease-in-out infinite" }}
                  className="self-end rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/60 px-2.5 py-1.5 text-[10px] text-[#fff8db] font-semibold max-w-[95%] shadow-2xs flex items-start gap-1.5"
                >
                  <span className="font-bold text-[#f9f586] shrink-0">Bidan:</span>
                  <span>
                    {staseNumber === 1
                      ? "“Kapan HPHT terakhir dan apakah siklus haid teratur?”"
                      : "“Tenang Bu, ini lesi pra-kanker dan bisa diobati tuntas dengan krioterapi.”"}
                  </span>
                </div>
              </div>

              {/* 3. HIGHLIGHT TARGET: Smart Synchronized Microphone Bar */}
              <div
                style={{ animation: "micActiveSequence 6s ease-in-out infinite" }}
                className="relative rounded-lg border-2 p-1.5 flex items-center justify-between transition-all duration-300"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <div className="size-5 rounded-full bg-[#d4af37] text-[#14100c] flex items-center justify-center">
                    <Mic className="size-3" />
                  </div>
                  <span>[Bicara via Mikrofon]</span>
                </div>

                {/* Equalizer audio bars that bounce while active */}
                <div className="flex items-center gap-0.5 h-3">
                  {[40, 90, 60, 100, 70, 30].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        animation: "audioBarsSequence 6s ease-in-out infinite",
                        animationDelay: `${i * 0.08}s`,
                      }}
                      className="w-1 bg-[#f9f586] rounded-full"
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
      {/* (Baki di Atas, Papan Magnet di Bawah, Kartu Menempel Turun)  */}
      {/* ============================================================ */}
      {staseNumber === 2 && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-[#e6d59c]/80 border-b border-[#8c6d23]/30 pb-2">
            <span className="font-serif font-bold text-xs text-[#fff8db] flex items-center gap-1.5">
              <Magnet className="size-3.5 text-[#d4af37]" /> Miniatur Papan Magnet Faktor Risiko
            </span>
            <Badge className="bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fff8db] text-[9px] px-1.5 py-0">
              Baki Atas &rarr; Papan Bawah
            </Badge>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* 1. ATAS: Baki Kartu Pilihan */}
            <div className="rounded-xl border border-[#8c6d23]/40 bg-[#22170d] p-2 flex flex-col gap-1">
              <span className="text-[9px] text-[#e6d59c]/70 font-mono flex items-center gap-1">
                <Hand className="size-2.5 text-[#d4af37]" /> BAKI PILIHAN KARTU (Pilih & Tarik ke Bawah):
              </span>
              <div className="grid grid-cols-2 gap-2 relative">
                {/* Static Card in Tray */}
                <div className="rounded-lg bg-[#19110a] border border-[#8c6d23]/30 p-1.5 text-[10px] text-[#e6d59c]/60 truncate">
                  Keputihan Patologis
                </div>

                {/* ANIMATED DRAGGING CARD (Moves from Tray down directly to target board slot) */}
                <div
                  style={{ animation: "dragCardDownToMagnetExact 3.8s ease-in-out infinite" }}
                  className="rounded-lg border-2 p-1.5 flex items-center justify-between text-[10px] text-[#fff8db] font-bold z-20"
                >
                  <span className="truncate">Perdarahan Kontak</span>
                  <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* 2. BAWAH: Papan Magnet Dropzone */}
            <div className="rounded-xl border border-[#d4af37]/50 bg-[#160f09] p-2 flex flex-col gap-1 shadow-inner">
              <span className="text-[10px] text-[#d4af37] font-mono font-bold flex items-center gap-1">
                <Magnet className="size-3" /> PAPAN MAGNET (Area Tempel Jawaban)
              </span>
              <div className="grid grid-cols-2 gap-2 min-h-[32px]">
                {/* Slot 1: Sudah Ada Kartu Menempel */}
                <div className="rounded-lg bg-[#2b1e12] border border-[#8c6d23]/50 p-1.5 flex items-center justify-between text-[10px] text-[#fff8db]">
                  <span className="truncate">Riwayat Multiparitas</span>
                  <Badge className="bg-emerald-600 text-white text-[8px] px-1 py-0">Menempel</Badge>
                </div>

                {/* Slot 2: Target Slot Tempat Kartu Ditempel (Tepat di bawah jalur jatuhnya kartu) */}
                <div className="rounded-lg border-2 border-dashed border-[#d4af37]/60 bg-[#d4af37]/5 p-1.5 flex items-center justify-center text-[9px] text-[#f9f586]">
                  <span>[Slot Magnet Target]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POS 3: MENGURUTKAN PROSEDUR IVA SKELETON                     */}
      {/* (Drag Reorder: Kartu Terangkat & Berpindah Posisi)           */}
      {/* ============================================================ */}
      {staseNumber === 3 && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-[#e6d59c]/80 border-b border-[#8c6d23]/30 pb-2">
            <span className="font-serif font-bold text-xs text-[#fff8db] flex items-center gap-1.5">
              <Layers className="size-3.5 text-[#d4af37]" /> Miniatur Pengurutan SOP Tindakan IVA
            </span>
            <Badge className="bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fff8db] text-[9px] px-1.5 py-0">
              Drag & Drop Urutan 1 - 6
            </Badge>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            {/* Step 1 (Fixed) */}
            <div className="rounded-lg bg-[#22170d] border border-[#8c6d23]/40 p-1.5 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#8c6d23] text-[#14100c] font-mono text-[9px] font-bold px-1.5 py-0">1</Badge>
                <span className="text-[#fff8db]">Informed consent & pasang spekulum cocor bebek</span>
              </div>
              <span className="text-[9px] text-[#d4af37]/60 font-mono">SOP #1</span>
            </div>

            {/* Step 2 (DRAGGED CARD: Terangkat, Meluncur Turun ke Posisi 3) */}
            <div
              style={{ animation: "draggedStepCard 3.6s ease-in-out infinite" }}
              className="rounded-lg bg-[#3b2814] border-2 border-[#d4af37] p-1.5 flex items-center justify-between text-[10px] text-[#fff8db] font-bold"
            >
              <div className="flex items-center gap-2">
                <Badge className="bg-[#d4af37] text-[#14100c] font-mono text-[9px] font-black px-1.5 py-0">2</Badge>
                <span className="text-[#f9f586]">Oleskan asam asetat 3-5% ke epitel SSK serviks</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-[#d4af37] font-bold">
                <ArrowDownUp className="size-3 animate-bounce" />
                <span>[Geser ke Bawah]</span>
              </div>
            </div>

            {/* Step 3 (DISPLACED CARD: Tergeser Naik ke Posisi 2) */}
            <div
              style={{ animation: "displacedStepCard 3.6s ease-in-out infinite" }}
              className="rounded-lg bg-[#22170d] border border-[#8c6d23]/40 p-1.5 flex items-center justify-between text-[10px]"
            >
              <div className="flex items-center gap-2">
                <Badge className="bg-[#8c6d23] text-[#14100c] font-mono text-[9px] font-bold px-1.5 py-0">3</Badge>
                <span className="text-[#fff8db]">Bersihkan serviks dari lendir dengan kassa steril</span>
              </div>
              <span className="text-[9px] text-[#d4af37]/60 font-mono">SOP #2</span>
            </div>

            {/* Step 4 (Fixed) */}
            <div className="rounded-lg bg-[#22170d] border border-[#8c6d23]/40 p-1.5 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#8c6d23] text-[#14100c] font-mono text-[9px] font-bold px-1.5 py-0">4</Badge>
                <span className="text-[#fff8db]">Tunggu 1 menit dan evaluasi plak asetowhite</span>
              </div>
              <span className="text-[9px] text-[#d4af37]/60 font-mono">SOP #4</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POS 4: SINGLE CHOICE IMAGE SKELETON                          */}
      {/* (Kapsul A -> B -> C Hover, lalu Kapsul C Terpilih Emas Solid)*/}
      {/* ============================================================ */}
      {staseNumber === 4 && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-[#e6d59c]/80 border-b border-[#8c6d23]/30 pb-2">
            <span className="font-serif font-bold text-xs text-[#fff8db] flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-[#d4af37]" /> Miniatur Interpretasi Visual & Pilihan Kapsul
            </span>
            <Badge className="bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fff8db] text-[9px] px-1.5 py-0">
              Pilihan Kapsul A, B, C, D
            </Badge>
          </div>

          <div className="flex flex-col gap-3">
            {/* Viewport Foto Serviks Skeleton */}
            <div className="rounded-xl border border-[#8c6d23]/40 bg-black/90 p-2.5 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="relative size-12 rounded-full bg-[#521c1c] border-2 border-[#8c6d23] flex items-center justify-center shrink-0">
                  <div className="size-3 rounded-full bg-[#200909]" />
                  <div className="absolute top-1 right-1.5 size-4 rounded-full bg-white/80 border border-[#d4af37]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-serif font-bold text-[#fff8db]">Foto Inspeksi Asam Asetat 3-5%</span>
                  <span className="text-[9px] text-[#e6d59c]/70">Amati plak putih asetowhite pada zona SSK</span>
                </div>
              </div>
              <Badge variant="outline" className="border-[#d4af37]/60 text-[#d4af37] text-[9px]">
                <Search className="size-2.5 mr-1" /> Zoom & Pan
              </Badge>
            </div>

            {/* Pilihan Jawaban Kapsul (Hover berurutan A -> B -> C, lalu C Terpilih Emas Solid) */}
            <div className="flex flex-col gap-1.5 relative">
              <div className="flex items-center justify-between text-[9px] text-[#e6d59c]/70 font-mono">
                <span>Pilih Diagnosis (Kapsul A, B, C, D):</span>
                <span className="text-[#d4af37] flex items-center gap-1">
                  <MousePointerClick className="size-2.5" /> Simulasi Seleksi Jawaban
                </span>
              </div>

              {/* 4 Capsule Grid */}
              <div className="grid grid-cols-4 gap-2.5">
                {/* Kapsul A */}
                <div
                  style={{ animation: "capsuleHoverSeqA 5.2s ease-in-out infinite" }}
                  className="h-10 rounded-full border flex items-center justify-center text-xs font-serif font-bold transition-all"
                >
                  A
                </div>

                {/* Kapsul B */}
                <div
                  style={{ animation: "capsuleHoverSeqB 5.2s ease-in-out infinite" }}
                  className="h-10 rounded-full border flex items-center justify-center text-xs font-serif font-bold transition-all"
                >
                  B
                </div>

                {/* Kapsul C (Hover kemudian terpilih Solid Gold) */}
                <div
                  style={{ animation: "capsuleHoverSeqC 5.2s ease-in-out infinite" }}
                  className="h-10 rounded-full border flex items-center justify-center text-xs font-serif font-bold transition-all relative"
                >
                  <span>C</span>
                </div>

                {/* Kapsul D */}
                <div
                  style={{ animation: "capsuleHoverSeqD 5.2s ease-in-out infinite" }}
                  className="h-10 rounded-full border flex items-center justify-center text-xs font-serif font-bold transition-all"
                >
                  D
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POS 6: PEREKAMAN SUARA SKELETON                             */}
      {/* ============================================================ */}
      {staseNumber === 6 && (
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-[#e6d59c]/80 border-b border-[#8c6d23]/30 pb-2">
            <span className="font-serif font-bold text-xs text-[#fff8db] flex items-center gap-1.5">
              <Radio className="size-3.5 text-red-400" /> Miniatur Perekaman Laporan Klinis
            </span>
            <Badge className="bg-red-500/20 border border-red-500/40 text-red-200 text-[9px] px-1.5 py-0">
              Audio Examiner
            </Badge>
          </div>

          <div className="rounded-xl border border-[#8c6d23]/30 bg-[#160f09] p-3 flex flex-col items-center justify-center gap-3">
            {/* Live Audio Visualizer Equalizer */}
            <div className="flex items-center gap-1 h-6">
              {[30, 70, 100, 50, 90, 40, 80, 60, 95, 35, 75, 45].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: `${h}%`,
                    animation: "audioBarsSequence 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.08}s`,
                  }}
                  className="w-1 bg-[#d4af37] rounded-full"
                />
              ))}
            </div>

            {/* HIGHLIGHT TARGET: Pulsing Red Recording Button */}
            <div
              style={{ animation: "sonarRingPulse 2s infinite" }}
              className="relative rounded-full border-2 border-red-500 bg-red-600/30 px-4 py-1.5 flex items-center gap-2 text-xs font-bold text-[#fff8db] shadow-[0_0_20px_rgba(239,68,68,0.5)]"
            >
              <div className="size-3 rounded-full bg-red-500 animate-ping" />
              <span>[Mulai Rekam Suara Laporan]</span>
            </div>

            <span className="text-[10px] text-[#e6d59c]/70 font-mono">
              Batas Rekam: 04:00 Menit &bull; Sampaikan kesimpulan & rencana rujukan
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
