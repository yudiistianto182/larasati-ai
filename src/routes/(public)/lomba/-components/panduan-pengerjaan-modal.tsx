import * as React from "react";
import { BookOpen, CheckCircle2, HelpCircle, Lightbulb, Sparkles, X } from "lucide-react";

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

interface PanduanPengerjaanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staseNumber: number;
  staseName: string;
  panduanText: string;
}

export function PanduanPengerjaanModal({
  open,
  onOpenChange,
  staseNumber,
  staseName,
  panduanText,
}: PanduanPengerjaanModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[92vw] sm:max-w-xl flex flex-col p-0 gap-0 border-2 border-[#8c6d23] bg-[#1a130d] text-[#f3e5ab] shadow-2xl overflow-hidden"
      >
        {/* Header with gold styling */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-[#8c6d23]/40 px-5 py-4 bg-[#231910] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-xs">
              <BookOpen className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-serif font-bold text-[#fff8db] flex items-center gap-2">
                <span>Panduan Cara Pengerjaan Pos {staseNumber}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-[#d4af37]/80">
                {staseName}
              </DialogDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            className="size-7 rounded-lg text-[#d4af37]/70 hover:text-[#fff8db] hover:bg-[#d4af37]/10"
            title="Tutup (Esc)"
          >
            <X className="size-4" />
            <span className="sr-only">Tutup</span>
          </Button>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          <div className="flex items-start gap-3 rounded-xl border border-[#d4af37]/30 bg-[#261b11] p-3.5 leading-relaxed text-[#f3e5ab]/95">
            <Lightbulb className="size-4.5 text-[#d4af37] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[#fff8db] text-xs">Petunjuk Interaksi:</span>
              <p className="text-xs text-[#e6d59c] leading-relaxed">{panduanText}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#8c6d23]/30 bg-[#1f150b] p-3.5 flex flex-col gap-2">
            <span className="font-bold text-[#d4af37] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#d4af37]" /> Tips Kelulusan Stase:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-[#e6d59c]/80 leading-relaxed">
              <li>Perhatikan alokasi waktu stase pada panel sebelah kiri.</li>
              <li>Pastikan seluruh elemen soal telah terjawab sebelum berpindah pos.</li>
              <li>Data Anda akan otomatis tersimpan saat waktu stase berakhir.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 flex flex-row items-center justify-end border-t border-[#8c6d23]/40 bg-[#231910] px-5 py-3.5 shrink-0">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8 px-6 text-xs font-serif font-bold tracking-wider bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 shadow-md"
          >
            Mengerti & Mulai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
