import * as React from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Lightbulb,
  Sparkles,
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
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="w-[92vw] sm:max-w-xl flex flex-col p-0 gap-0 border-2 border-[#d4af37] bg-[#1a130d] text-[#f3e5ab] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <DialogHeader className="flex flex-col border-b border-[#8c6d23]/40 px-6 py-4 bg-gradient-to-r from-[#24190f] via-[#2f2014] to-[#24190f] text-left">
          <div className="flex items-center justify-between gap-2 mb-1.5">
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
          <DialogDescription className="text-xs text-[#d4af37]/80 mt-0.5">
            Bacalah petunjuk soal dan panduan interaksi berikut sebelum menekan tombol mulai.
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-4 text-xs max-h-[60vh] overflow-y-auto">
          {/* Instruksi Kasus */}
          <div className="rounded-xl border border-[#8c6d23]/40 bg-[#251b11] p-4 text-xs leading-relaxed">
            <span className="font-serif font-bold text-[#fff8db] text-xs uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FileText className="size-4 text-[#d4af37]" /> Instruksi Kasus Klinis:
            </span>
            <p className="text-xs text-[#e6d59c] leading-relaxed">
              {petunjukSoal}
            </p>
          </div>

          {/* Panduan Cara Pengerjaan */}
          <div className="rounded-xl border border-[#d4af37]/30 bg-[#2b1e12] p-4 text-xs leading-relaxed">
            <span className="font-serif font-bold text-[#d4af37] text-xs uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="size-4 text-[#d4af37]" /> Cara Pengerjaan Pos Ini:
            </span>
            <p className="text-xs text-[#f3e5ab]/95 leading-relaxed">
              {panduanPenggunaan}
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 flex flex-row items-center justify-between border-t border-[#8c6d23]/40 bg-[#23180f] px-6 py-4">
          <span className="text-[11px] text-[#d4af37]/75">
            Waktu stase akan mulai berjalan setelah tombol ditekan.
          </span>

          <Button
            type="button"
            onClick={onStart}
            className="h-10 px-7 rounded-xl font-serif font-bold text-xs tracking-widest uppercase bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-[#fff8db]/60 gap-2"
          >
            <span>Mulai Pengerjaan Pos</span>
            <ArrowRight className="size-3.5 stroke-[2.5]" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
