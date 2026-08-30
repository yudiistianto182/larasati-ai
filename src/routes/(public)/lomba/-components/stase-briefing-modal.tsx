import * as React from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  ListOrdered,
  Sparkles,
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

interface StaseBriefingModalProps {
  open: boolean;
  onStart: () => void;
  staseNumber: number;
  staseName: string;
  kodeAmplop: string;
  durationMinutes: number;
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
    { step: "Langkah 1", desc: "Cermati daftar faktor risiko klinis pada baki kartu di bagian bawah layar." },
    { step: "Langkah 2", desc: "Tarik (drag) atau klik kartu faktor risiko yang sesuai ke Papan Magnet." },
    { step: "Langkah 3", desc: "Klik tanda 'X' pada kartu di papan magnet jika ingin membatalkan/mengembalikan." },
  ],
  3: [
    { step: "Langkah 1", desc: "Tinjau 6 tahapan standar operasional prosedur (SOP) pemeriksaan IVA." },
    { step: "Langkah 2", desc: "Tarik posisi kartu atau gunakan tombol panah untuk menyusun urutan kronologis." },
    { step: "Langkah 3", desc: "Pastikan langkah dari persiapan alat hingga evaluasi asam asetat tersusun tepat." },
  ],
  4: [
    { step: "Langkah 1", desc: "Amati foto inspeksi porsio serviks pasca aplikasi asam asetat 3-5%." },
    { step: "Langkah 2", desc: "Gunakan scroll mouse / pinch zoom dan geser (pan) untuk memeriksa plak asetowhite." },
    { step: "Langkah 3", desc: "Pilih salah satu kesimpulan diagnosis (A, B, C, atau D) pada panel pilihan." },
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
  durationMinutes,
  petunjukSoal,
  panduanPenggunaan,
}: StaseBriefingModalProps) {
  const stepsGuide = STASE_STEPS_GUIDE[staseNumber] || [
    { step: "Langkah 1", desc: "Pahami instruksi soal klinis yang tertera pada amplop ujian." },
    { step: "Langkah 2", desc: "Gunakan instrumen interaktif di pos ini sesuai panduan operasional." },
    { step: "Langkah 3", desc: "Selesaikan stase sebelum hitungan mundur waktu stase berakhir." },
  ];

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="w-[94vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 border-2 border-[#d4af37] bg-[#140e08]/95 text-[#f3e5ab] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <DialogHeader className="flex flex-col border-b border-[#8c6d23]/40 px-5 sm:px-6 py-3.5 bg-gradient-to-r from-[#24190f] via-[#2f2014] to-[#24190f] text-left shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge className="bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] font-bold text-xs shadow-xs uppercase tracking-wider">
              Instruksi Pos {staseNumber}
            </Badge>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#d4af37]/60 text-[#d4af37] font-mono text-xs">
                {kodeAmplop}
              </Badge>
              <Badge variant="outline" className="border-[#d4af37]/60 text-[#d4af37] text-xs gap-1">
                <Clock className="size-3" /> {durationMinutes} Menit
              </Badge>
            </div>
          </div>

          <DialogTitle className="text-base sm:text-lg font-serif font-bold text-[#fff8db] leading-snug">
            {staseName}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-[#d4af37]/80 mt-0.5">
            Pelajari 3 instruksi terpadu (animasi simulasi, tata cara langkah, dan petunjuk kasus) sebelum memulai.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Modal Body: 3 Structured Instruction Sections */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4 text-xs">
          
          {/* ============================================================ */}
          {/* 1. ANIMASI SKELETON INTERAKTIF (VISUAL DEMO CARA KERJA POS)  */}
          {/* ============================================================ */}
          <div className="flex flex-col gap-1.5">
            <span className="font-serif font-bold text-xs text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="size-3.5 text-[#d4af37]" /> 1. Simulasi Visual & Target Aksi (Skeleton):
            </span>
            <StaseAnimatedSkeleton staseNumber={staseNumber} />
          </div>

          {/* ============================================================ */}
          {/* 2. LANGKAH-LANGKAH PENGERJAAN STEP-BY-STEP                   */}
          {/* ============================================================ */}
          <div className="rounded-2xl border border-[#8c6d23]/40 bg-[#1d140b]/90 p-4 flex flex-col gap-2.5 shadow-md">
            <span className="font-serif font-bold text-[#fff8db] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ListOrdered className="size-3.5 text-[#d4af37]" /> 2. Langkah-Langkah Pengerjaan Pos:
            </span>
            
            <div className="grid grid-cols-1 gap-2">
              {stepsGuide.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-[#8c6d23]/30 bg-[#160f09] p-2.5 text-xs transition-colors hover:border-[#d4af37]/60"
                >
                  <Badge className="bg-[#d4af37] text-[#14100c] font-mono font-black text-[10px] px-1.5 py-0 shrink-0">
                    {idx + 1}
                  </Badge>
                  <p className="text-[#f3e5ab] text-[11px] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. INSTRUKSI SKENARIO KASUS KLINIS                          */}
          {/* ============================================================ */}
          <div className="rounded-2xl border border-[#8c6d23]/40 bg-[#1d140b]/90 p-4 flex flex-col gap-2 shadow-md">
            <span className="font-serif font-bold text-[#fff8db] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="size-3.5 text-[#d4af37]" /> 3. Instruksi Skenario Kasus Klinis:
            </span>
            <div className="rounded-xl border border-[#8c6d23]/30 bg-[#160f09] p-3 text-[11px] leading-relaxed text-[#e6d59c]">
              {petunjukSoal}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 flex flex-row items-center justify-between border-t border-[#8c6d23]/40 bg-[#23180f] px-5 sm:px-6 py-3.5 shrink-0">
          <span className="text-[11px] text-[#d4af37]/75 font-mono">
            ⏱️ Timer stase berjalan setelah tombol ditekan.
          </span>

          <Button
            type="button"
            onClick={onStart}
            className="h-10 px-6 rounded-xl font-serif font-bold text-xs tracking-widest uppercase bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-[#fff8db]/60 gap-2 cursor-pointer active:scale-98"
          >
            <span>Mulai Pengerjaan Pos</span>
            <ArrowRight className="size-3.5 stroke-[2.5]" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
