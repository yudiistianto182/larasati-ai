import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileCheck,
  HeartHandshake,
  ImageIcon,
  ListChecks,
  Mic,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Step8LombaSummaryProps {
  groupName?: string;
  hasAudioRecorder?: boolean;
}

export function Step8LombaSummary({
  groupName = "Kelompok Peserta",
  hasAudioRecorder = true,
}: Step8LombaSummaryProps) {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const STASE_SUMMARY_LIST = [
    { num: 1, name: "Pos 1: Anamnesis Klinis AI", icon: Bot, status: "Selesai (Transkrip Terkirim)", score: "100%" },
    { num: 2, name: "Pos 2: Faktor Risiko (Papan Magnet)", icon: ShieldAlert, status: "Selesai (Kartu Tertempel)", score: "100%" },
    { num: 3, name: "Pos 3: Urutan Prosedur IVA", icon: ListChecks, status: "Selesai (6 Langkah Tersusun)", score: "100%" },
    { num: 4, name: "Pos 4: Interpretasi Hasil & MCQ", icon: ImageIcon, status: "Selesai (Diagnosis Terpilih)", score: "100%" },
    { num: 5, name: "Pos 5: Asuhan Kebidanan & Konseling", icon: HeartHandshake, status: "Selesai (Edukasi Selesai)", score: "100%" },
    ...(hasAudioRecorder
      ? [{ num: 6, name: "Pos 6: Perekaman Pembicaraan", icon: Mic, status: "Selesai (Audio Tersimpan)", score: "100%" }]
      : []),
  ];

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-[#d4af37] bg-[#1a130d] p-8 sm:p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300 text-[#f3e5ab] max-w-2xl mx-auto my-auto">
        <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] shadow-[0_0_30px_rgba(212,175,55,0.5)] animate-bounce">
          <Trophy className="size-10 stroke-[2.5]" />
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <Badge className="bg-[#d4af37] text-[#14100c] font-bold text-xs self-center px-3 py-1 shadow-md uppercase tracking-wider">
            Sirkuit Ujian Selesai
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#fff8db]">
            Selamat! Jawaban Berhasil Dikumpulkan
          </h2>
          <p className="text-xs text-[#e6d59c] leading-relaxed">
            Seluruh rangkaian stase simulasi sirkuit OSCE kebidanan telah berhasil dikerjakan oleh <strong>{groupName}</strong>. Data rekaman audio, transkrip AI, dan hasil analisis telah dikirim ke dewan juri.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            nativeButton={false}
            size="lg"
            className="h-11 px-8 rounded-xl font-serif font-bold text-xs tracking-widest uppercase bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 shadow-lg gap-2"
            render={<Link to="/dashboard/contest" />}
          >
            <span>Kembali ke Dashboard Lomba</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-6 sm:p-8 shadow-xl w-full max-w-3xl mx-auto text-[#f3e5ab]">
      <div className="flex flex-col items-center text-center border-b border-[#8c6d23]/30 pb-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-[#d4af37]/20 text-[#d4af37] mb-2 border border-[#d4af37]/40 shadow-md">
          <FileCheck className="size-6" />
        </div>
        <Badge variant="outline" className="text-xs font-mono border-[#d4af37]/50 text-[#d4af37] mb-1">
          Tahap Akhir Sirkuit Ujian
        </Badge>
        <h3 className="text-lg font-serif font-bold text-[#fff8db]">
          Ringkasan Lembar Kerja Peserta ({groupName})
        </h3>
        <p className="text-xs text-[#d4af37]/80 mt-0.5">
          Periksa kembali status kelengkapan setiap pos sebelum mengunci dan mengumpulkan jawaban akhir.
        </p>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {STASE_SUMMARY_LIST.map((st) => {
          const Icon = st.icon;

          return (
            <div
              key={st.num}
              className="flex items-center justify-between rounded-xl border border-[#8c6d23]/40 bg-[#251b11] p-3.5 shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#1a130d] text-[#d4af37] border border-[#8c6d23]/40 shadow-xs">
                  <Icon className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[#fff8db] leading-tight">
                    {st.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    {st.status}
                  </span>
                </div>
              </div>

              <CheckCircle2 className="size-4.5 text-emerald-400 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Final Submit Button */}
      <div className="border-t border-[#8c6d23]/30 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-[#d4af37]/80 text-center sm:text-left">
          Pastikan semua anggota kelompok telah menyepakati jawaban yang telah diinput.
        </span>

        <Button
          type="button"
          size="lg"
          onClick={() => setIsSubmitted(true)}
          className="h-11 px-8 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-serif font-bold text-xs tracking-widest uppercase gap-2 shadow-lg shadow-emerald-900/30 w-full sm:w-auto border border-emerald-400/40"
        >
          <CheckCircle2 className="size-4" />
          <span>Kumpulkan Seluruh Jawaban Sirkuit</span>
        </Button>
      </div>
    </div>
  );
}
