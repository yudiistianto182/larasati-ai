import * as React from "react";
import {
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  FileCheck,
  HeartHandshake,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Quote,
  ShieldAlert,
  Sparkles,
  Tag,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { calculateAge, fallbackPasien } from "@/routes/(admin)/dashboard/master/pasien/-components/data";
import type { KelompokLomba } from "@/stores/contest-store";

interface Step1IntroLarasatiProps {
  onStart: () => void;
  kasus?: Kasus;
  kelompok?: KelompokLomba;
}

export function Step1IntroLarasati({
  onStart,
  kasus,
  kelompok,
}: Step1IntroLarasatiProps) {
  const groupName = kelompok?.nama || "Kelompok A (Stase Pagi)";
  const caseName = kasus?.nama || "Deteksi Dini Kanker Serviks & Pemeriksaan IVA Positif";
  
  // Find linked patient or fallback to first patient Ny. Ani
  const linkedPasienId = kasus?.pasien_ids?.[0];
  const pasienData = fallbackPasien.find((p) => p.id === linkedPasienId) || fallbackPasien[0];

  const patientName = pasienData?.nama || "Ny. Ani";
  const patientAge = pasienData?.tanggal_lahir
    ? `${calculateAge(pasienData.tanggal_lahir)} Tahun`
    : pasienData?.umur
      ? `${pasienData.umur} Tahun`
      : "29 Tahun";

  const caseIntroText =
    kasus?.teks_perkenalan ||
    kasus?.deskripsi ||
    "Pasien datang ke Poli KIA Puskesmas mengeluhkan keputihan kental, gatal, serta adanya flek darah pasca berhubungan intim. Mahasiswa diminta melakukan penatalaksanaan klinis terpadu.";

  // Dynamic stations list with duration
  const staseData = kasus?.stase_data;

  const circuitStations = [
    {
      pos: 1,
      title: "Pos 1: Interaktif Anamnesis AI",
      desc: "Wawancara klinis langsung menggunakan mikrofon dengan pasien virtual untuk menggali keluhan.",
      durasi: `${staseData?.stase1?.header?.durasi_menit ?? 7} Menit`,
      icon: Bot,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      pos: 2,
      title: "Pos 2: Multi Select Faktor Risiko",
      desc: "Identifikasi faktor risiko klinis dan patologis kanker serviks pada papan magnet interaktif.",
      durasi: `${staseData?.stase2?.header?.durasi_menit ?? 5} Menit`,
      icon: ShieldAlert,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      pos: 3,
      title: "Pos 3: Mengurutkan Prosedur IVA",
      desc: "Susun urutan 6 langkah SOP tindakan pemeriksaan Inspeksi Visual Asam Asetat secara tepat.",
      durasi: `${staseData?.stase3?.header?.durasi_menit ?? 6} Menit`,
      icon: ListChecks,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
    {
      pos: 4,
      title: "Pos 4: Interpretasi Hasil IVA (Single Choice)",
      desc: "Analisis foto porsio serviks beresolusi tinggi dan tegakkan kesimpulan diagnosis klinis.",
      durasi: `${staseData?.stase4?.header?.durasi_menit ?? 5} Menit`,
      icon: ImageIcon,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      pos: 5,
      title: "Pos 5: Asuhan Kebidanan & Konseling AI",
      desc: "Bimbingan konseling empatik AI mengenai hasil IVA positif, opsi krioterapi, dan edukasi rujukan.",
      durasi: `${staseData?.stase5?.header?.durasi_menit ?? 8} Menit`,
      icon: HeartHandshake,
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    },
  ];

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-[#8c6d23]/50 bg-[#120d08]/95 p-5 sm:p-8 lg:p-10 shadow-2xl text-[#f3e5ab]">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a1f12_0%,_#0e0a07_100%)] opacity-95 pointer-events-none" />

      {/* Ornate Gold Border Corners */}
      <div className="absolute top-4 left-4 size-10 border-t-2 border-l-2 border-[#d4af37]/60 pointer-events-none" />
      <div className="absolute top-4 right-4 size-10 border-t-2 border-r-2 border-[#d4af37]/60 pointer-events-none" />
      <div className="absolute bottom-4 left-4 size-10 border-b-2 border-l-2 border-[#d4af37]/60 pointer-events-none" />
      <div className="absolute bottom-4 right-4 size-10 border-b-2 border-r-2 border-[#d4af37]/60 pointer-events-none" />

      {/* Header Badge & Title */}
      <div className="relative z-10 w-full flex flex-col items-center text-center mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-[#d4af37] text-[#14100c] font-serif font-extrabold text-xs px-3 py-1 shadow-md uppercase tracking-wider">
            Arena Sirkuit Siap Dimulai
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
                src="/images/ny_ani_patient_torso.jpg"
                alt={patientName}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80";
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
                {pasienData?.jenis_kelamin || "Perempuan"} &bull; {pasienData?.id || "PSN-001"}
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
          <div className="flex flex-col gap-1.5 text-xs">
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
          </div>
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
              <span className="text-[11px] text-[#e6d59c]/70 font-mono">Total Waktu: ~31 Menit</span>
            </div>

            {/* List of 5 Stations with Duration Badges */}
            <div className="flex flex-col gap-2.5">
              {circuitStations.map((st) => {
                const Icon = st.icon;
                return (
                  <div
                    key={st.pos}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[#8c6d23]/30 bg-[#140d07] p-3 transition-all hover:border-[#d4af37]/60 hover:bg-[#1a1109]"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`flex size-8 items-center justify-center rounded-lg border shrink-0 ${st.color}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-serif font-bold text-xs text-[#fff8db]">
                          {st.title}
                        </span>
                        <p className="text-[11px] text-[#e6d59c]/80 leading-relaxed mt-0.5">
                          {st.desc}
                        </p>
                      </div>
                    </div>

                    {/* Keterangan Waktu Stase */}
                    <div className="shrink-0 pt-0.5">
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

          {/* CTA Button: Mulai Perjalanan Sirkuit */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#8c6d23]/30 pt-4">
            <div className="flex items-center gap-2 text-xs text-[#e6d59c]/80">
              <Crown className="size-4 text-[#d4af37]" />
              <span>Tim: <strong className="text-[#fff8db]">{groupName}</strong></span>
            </div>

            <Button
              type="button"
              onClick={onStart}
              className="h-12 px-8 w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] text-xs font-serif font-bold tracking-widest uppercase shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:brightness-110 hover:scale-102 transition-all cursor-pointer border border-[#fff8db]/60 gap-2 active:scale-98"
            >
              <span>Mulai Perjalanan Sirkuit</span>
              <ArrowRight className="size-4 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
