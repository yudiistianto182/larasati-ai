import * as React from "react";
import { BookOpen, CheckCircle2, Lightbulb, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { playCtaClickSound } from "./lomba-sound-effects";
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
        className="w-[92vw] sm:max-w-xl flex flex-col p-0 gap-0 border-2 border-amber-300 bg-white text-slate-900 shadow-2xl rounded-3xl overflow-hidden"
      >
        {/* Header with clean gold styling */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-amber-200/80 px-5 sm:px-6 py-4 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
              <BookOpen className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-serif font-black text-slate-900 flex items-center gap-2">
                <span>Panduan Cara Pengerjaan Pos {staseNumber}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-amber-800 font-medium">
                {staseName}
              </DialogDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            className="size-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Tutup (Esc)"
          >
            <X className="size-4" />
            <span className="sr-only">Tutup</span>
          </Button>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 text-xs bg-slate-50/50">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 leading-relaxed text-amber-950 shadow-2xs">
            <Lightbulb className="size-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-amber-950 text-xs">Petunjuk Interaksi:</span>
              <p className="text-xs text-amber-900 leading-relaxed">{panduanText}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2 shadow-2xs">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <CheckCircle2 className="size-3.5 text-emerald-600" /> Tips Kelulusan Stase:
            </span>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed pl-1">
              <li>Perhatikan alokasi waktu stase pada panel atas/samping.</li>
              <li>Pastikan seluruh elemen soal telah terjawab sebelum berpindah pos.</li>
              <li>Data Anda akan otomatis tersimpan saat waktu stase berakhir.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 flex flex-row items-center justify-end border-t border-slate-200 bg-slate-50 px-5 sm:px-6 py-4 shrink-0">
          <Button
            type="button"
            onClick={() => {
              playCtaClickSound();
              onOpenChange(false);
            }}
            className="h-9 px-6 text-xs font-serif font-bold tracking-wider uppercase bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-600 text-slate-950 hover:brightness-110 shadow-md border border-amber-300 cursor-pointer active:scale-98"
          >
            Mengerti & Mulai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
