import * as React from "react";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Printer,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KelompokStaseAnswersCard } from "./kelompok-stase-answers-card";
import type { KelompokRekapData } from "./rekap-data";

interface DetailJawabanKelompokModalProps {
  kelompok: KelompokRekapData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetailJawabanKelompokModal({
  kelompok,
  open,
  onOpenChange,
}: DetailJawabanKelompokModalProps) {
  if (!kelompok) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[96vw] sm:max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 border-2 border-primary/30 bg-background text-foreground shadow-2xl rounded-3xl overflow-hidden"
      >
        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-4 bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              {kelompok.rank === 1 ? (
                <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Award className="size-5 text-slate-500" />
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base sm:text-lg font-serif font-black">
                  Detail Jawaban 5 Pos — {kelompok.nama}
                </DialogTitle>
                <Badge
                  className={
                    kelompok.rank === 1
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] font-bold"
                      : "bg-muted text-muted-foreground text-[11px]"
                  }
                >
                  Peringkat #{kelompok.rank} &bull; Total: {kelompok.totalAkumulasi}/500 Poin (Rata-rata: {kelompok.rataRataSkor.toFixed(1)})
                </Badge>
              </div>

              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {kelompok.kasusNama} &bull; ⏱️ Waktu Selesai: {kelompok.waktuPengerjaan}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="size-4" />
              <span className="sr-only">Tutup</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body: Complete 5-Stase Breakdown */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-muted/10 flex flex-col gap-6">
          <KelompokStaseAnswersCard kelompok={kelompok} />
        </div>

        {/* Modal Footer */}
        <div className="border-t bg-muted/40 px-6 py-3.5 flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground font-mono">
            ✅ Seluruh data transkrip dan pilihan telah tervalidasi oleh dewan juri.
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 px-4 rounded-xl shadow-xs"
          >
            Tutup Dialog
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
