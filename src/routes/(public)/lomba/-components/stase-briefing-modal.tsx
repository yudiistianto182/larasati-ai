import * as React from "react";
import {
  ArrowRight,
  Clock,
  FileText,
  ListOrdered,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StaseAnimatedSkeleton } from "./stase-animated-skeleton";
import { playCtaClickSound, playTransitionChime } from "./lomba-sound-effects";

interface StaseBriefingModalProps {
  open: boolean;
  onStart: () => void;
  staseNumber: number;
  staseName: string;
  kodeAmplop: string;
  durationMinutes?: number;
  durationSeconds?: number;
  durationLabel?: string;
  petunjukSoal: string;
  panduanPenggunaan: string;
}

const STASE_STEPS_GUIDE: Record<number, { step: string; desc: string }[]> = {
  1: [
    { step: "Langkah 1", desc: "Pastikan mikrofon aktif dan bicaralah secara jelas menghadap layar." },
    { step: "Langkah 2", desc: "Gali keluhan utama keputihan, siklus HPHT, paritas, dan riwayat perdarahan kontak." },
    { step: "Langkah 3", desc: "Simak respons lisan dan pantau teks transkrip dari pasien virtual Ny. Ani." },
  ],
  2: [
    { step: "Langkah 1", desc: "Cermati daftar faktor risiko klinis pada baki kartu di sebelah kiri layar." },
    { step: "Langkah 2", desc: "Tarik (drag) atau klik kartu faktor risiko yang sesuai ke Papan Magnet di sebelah kanan." },
    { step: "Langkah 3", desc: "Klik tanda 'X' pada kartu di papan magnet jika ingin membatalkan/mengembalikan." },
  ],
  3: [
    { step: "Langkah 1", desc: "Cermati kartu langkah Prosedur IVA pada baki di sebelah kiri layar." },
    { step: "Langkah 2", desc: "Klik kartu atau tombol '➔' untuk memasukkan langkah ke alur urutan di sebelah kanan." },
    { step: "Langkah 3", desc: "Atur urutan kronologis 1 s/d 6 di sebelah kanan menggunakan drag atau tombol panah ▲/▼." },
  ],
  4: [
    { step: "Langkah 1", desc: "Amati foto inspeksi porsio serviks pasca aplikasi asam asetat 3-5% di panel sebelah kiri." },
    { step: "Langkah 2", desc: "Gunakan scroll mouse / pinch zoom dan geser (pan) untuk memeriksa plak asetowhite." },
    { step: "Langkah 3", desc: "Pilih salah satu kesimpulan diagnosis (A, B, C, atau D) pada panel pilihan di sebelah kanan." },
  ],
  5: [
    { step: "Langkah 1", desc: "Sampaikan hasil pemeriksaan IVA positif kepada Ny. Ani dengan sikap empatik." },
    { step: "Langkah 2", desc: "Jelaskan bahwa lesi pra-kanker dapat diobati tuntas melalui metode krioterapi." },
    { step: "Langkah 3", desc: "Tenangkan kecemasan pasien dan berikan edukasi prosedur rujukan ke SpOG." },
  ],
  6: [
    { step: "Langkah 1", desc: "Tekan tombol 'Mulai Rekam Suara' saat Anda siap berbicara." },
    { step: "Langkah 2", desc: "Sampaikan laporan klinis, diagnosis akhir, tindakan, dan rencana rujukan." },
    { step: "Langkah 3", desc: "Tekan 'Selesai Rekam' dan dengarkan kembali hasil rekaman audio Anda." },
  ],
};

export function StaseBriefingModal({
  open,
  onStart,
  staseNumber,
  staseName,
  kodeAmplop,
  durationMinutes = 1,
  durationSeconds,
  durationLabel,
  petunjukSoal,
  panduanPenggunaan,
}: StaseBriefingModalProps) {
  const stepsGuide = STASE_STEPS_GUIDE[staseNumber] || [
    { step: "Langkah 1", desc: "Pahami instruksi soal klinis yang tertera pada amplop ujian." },
    { step: "Langkah 2", desc: "Gunakan instrumen interaktif di pos ini sesuai panduan operasional." },
    { step: "Langkah 3", desc: "Selesaikan stase sebelum hitungan mundur waktu stase berakhir." },
  ];

  const formattedDuration =
    durationLabel ||
    (durationSeconds && durationSeconds < 60
      ? `${durationSeconds} Detik`
      : `${durationMinutes} Menit`);

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="w-[94vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 border-2 border-[#d4af37] bg-white text-slate-900 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar (Clean White / Soft Gold Gradient) */}
        <DialogHeader className="flex flex-col border-b border-amber-200/80 px-5 sm:px-6 py-4 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 text-left shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <Badge className="bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-600 text-slate-950 font-black text-xs shadow-xs uppercase tracking-wider px-2.5 py-0.5">
              Instruksi Pos {staseNumber}
            </Badge>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-300 bg-amber-50/80 text-amber-900 font-mono text-xs">
                {kodeAmplop}
              </Badge>
              <Badge variant="outline" className="border-amber-300 bg-amber-50/80 text-amber-900 text-xs font-semibold gap-1">
                <Clock className="size-3 text-amber-700" /> {formattedDuration}
              </Badge>
            </div>
          </div>

          <DialogTitle className="text-base sm:text-xl font-serif font-black text-slate-900 leading-snug">
            {staseName}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 mt-0.5">
            Pelajari 3 instruksi terpadu (animasi simulasi, tata cara langkah, dan petunjuk kasus) sebelum memulai.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Modal Body: 3 Structured Instruction Sections */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4 text-xs bg-slate-50/60">

          {/* ============================================================ */}
          {/* 1. ANIMASI SKELETON INTERAKTIF (VISUAL DEMO CARA KERJA POS)  */}
          {/* ============================================================ */}
          <div className="flex flex-col gap-1.5">
            <span className="font-serif font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-600" /> 1. Simulasi Visual & Target Aksi (Skeleton):
            </span>
            <StaseAnimatedSkeleton staseNumber={staseNumber} />
          </div>

          {/* ============================================================ */}
          {/* 2. LANGKAH-LANGKAH PENGERJAAN STEP-BY-STEP                   */}
          {/* ============================================================ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
            <span className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ListOrdered className="size-3.5 text-amber-600" /> 2. Langkah-Langkah Pengerjaan Pos:
            </span>

            <div className="grid grid-cols-1 gap-2">
              {stepsGuide.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs transition-colors hover:border-amber-400 hover:bg-amber-50/30 shadow-2xs"
                >
                  <Badge className="bg-[#d4af37] text-slate-950 font-mono font-black text-xs px-2 py-0.5 shrink-0 shadow-2xs">
                    {idx + 1}
                  </Badge>
                  <p className="text-slate-700 text-xs leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
              {panduanPenggunaan && (
                <div className="mt-1 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-950 leading-relaxed shadow-2xs">
                  <span className="font-bold text-amber-900">Petunjuk Penggunaan: </span>
                  {panduanPenggunaan}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. INSTRUKSI SKENARIO KASUS KLINIS                          */}
          {/* ============================================================ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col gap-2.5 shadow-xs">
            <span className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="size-3.5 text-amber-600" /> 3. Instruksi Skenario Kasus Klinis:
            </span>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-xs leading-relaxed text-slate-700 shadow-2xs">
              {petunjukSoal}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 flex flex-row items-center justify-between border-t border-slate-200 bg-slate-50 px-5 sm:px-6 py-4 shrink-0">
          <span className="text-xs text-slate-600 font-mono flex items-center gap-1">
            ⏱️ Timer stase berjalan setelah tombol ditekan.
          </span>

          <Button
            type="button"
            onClick={() => {
              playCtaClickSound();
              playTransitionChime();
              onStart();
            }}
            className="h-11 px-7 rounded-xl font-serif font-bold text-xs tracking-widest uppercase bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-600 text-slate-950 hover:brightness-110 shadow-md border border-amber-300 gap-2 cursor-pointer active:scale-98"
          >
            <span>Mulai Pengerjaan Pos</span>
            <ArrowRight className="size-4 stroke-[2.5]" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
