import * as React from "react";
import {
  Check,
  CheckCircle2,
  Crown,
  Eye,
  HelpCircle,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  X,
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
import { cn } from "@/lib/utils";
import type { KelompokLomba } from "@/stores/contest-store";
import { useContestStore } from "@/stores/contest-store";
import { useKasusStore } from "@/stores/kasus-store";

interface MysteryRevealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kelompokList: KelompokLomba[];
}

export function MysteryRevealModal({
  open,
  onOpenChange,
  kelompokList,
}: MysteryRevealModalProps) {
  const { kasusList } = useKasusStore();
  const { mahasiswaList } = useContestStore();

  const [revealedGroupIds, setRevealedGroupIds] = React.useState<string[]>([]);
  const [isAutoRevealing, setIsAutoRevealing] = React.useState<boolean>(false);

  // Map lookups
  const kasusMap = React.useMemo(() => {
    const map = new Map<string, (typeof kasusList)[0]>();
    kasusList.forEach((k) => map.set(k.id, k));
    return map;
  }, [kasusList]);

  const studentMap = React.useMemo(() => {
    const map = new Map<string, { id: string; nama: string }>();
    mahasiswaList.forEach((m) => map.set(m.id, m));
    return map;
  }, [mahasiswaList]);

  // Reset when modal opens
  React.useEffect(() => {
    if (open) {
      setRevealedGroupIds([]);
      setIsAutoRevealing(false);
    }
  }, [open]);

  // Handle single group reveal
  const toggleRevealGroup = (groupId: string) => {
    if (revealedGroupIds.includes(groupId)) {
      setRevealedGroupIds(revealedGroupIds.filter((id) => id !== groupId));
    } else {
      setRevealedGroupIds([...revealedGroupIds, groupId]);
    }
  };

  // Reveal all at once
  const handleRevealAll = () => {
    setIsAutoRevealing(false);
    setRevealedGroupIds(kelompokList.map((k) => k.id));
  };

  // Reset all
  const handleReset = () => {
    setIsAutoRevealing(false);
    setRevealedGroupIds([]);
  };

  // Step-by-step sequential reveal
  const handleStepByStepReveal = () => {
    setIsAutoRevealing(true);
    setRevealedGroupIds([]);

    kelompokList.forEach((kel, index) => {
      setTimeout(() => {
        setRevealedGroupIds((prev) => Array.from(new Set([...prev, kel.id])));
        if (index === kelompokList.length - 1) {
          setIsAutoRevealing(false);
        }
      }, (index + 1) * 800);
    });
  };

  const allRevealed =
    kelompokList.length > 0 && revealedGroupIds.length === kelompokList.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-[95vw] sm:max-w-5xl flex-col overflow-hidden p-0 gap-0 border-border/80 shadow-2xl"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-5 py-3.5 bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Simulasi & Preview Undian Kasus Kelompok</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Gimmick interaktif untuk mengumumkan skenario kasus misteri kepada masing-masing kelompok peserta.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold h-7",
                allRevealed
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
              )}
            >
              {revealedGroupIds.length} / {kelompokList.length} Kasus Terbuka
            </Badge>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Tutup (Esc)"
            >
              <X className="size-4" />
              <span className="sr-only">Tutup</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-5 py-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStepByStepReveal}
              disabled={isAutoRevealing}
              className="h-8 gap-1.5 text-xs font-semibold bg-background shadow-2xs hover:border-purple-400 hover:text-purple-600"
            >
              <Play className="size-3.5 text-purple-500" />
              <span>Buka Satu per Satu (Berurutan)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRevealAll}
              disabled={isAutoRevealing || allRevealed}
              className="h-8 gap-1.5 text-xs font-semibold bg-background shadow-2xs hover:border-emerald-400 hover:text-emerald-600"
            >
              <Zap className="size-3.5 text-emerald-500" />
              <span>Buka Semua Sekaligus</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isAutoRevealing || revealedGroupIds.length === 0}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              <RotateCcw className="size-3.5" />
              <span>Kocok Ulang / Tutup Semua</span>
            </Button>
          </div>

          <span className="text-[11px] text-muted-foreground italic">
            Tip: Anda juga dapat mengklik masing-masing kotak misteri untuk membuka kartu secara manual.
          </span>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kelompokList.map((kel, index) => {
              const isRevealed = revealedGroupIds.includes(kel.id);
              const assignedCase = kel.kasus_id ? kasusMap.get(kel.kasus_id) : undefined;
              const ketuaStudent = kel.ketua_mhs_id ? studentMap.get(kel.ketua_mhs_id) : undefined;

              return (
                <div
                  key={kel.id}
                  className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-2xs transition-all hover:border-border"
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between border-b pb-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs font-bold shrink-0">
                        #{index + 1}
                      </Badge>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground leading-tight">
                          {kel.nama}
                        </span>
                        {ketuaStudent && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                            <Crown className="size-2.5" /> Ketua: {ketuaStudent.nama}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] bg-background">
                      {kel.mahasiswa_ids.length} Mhs
                    </Badge>
                  </div>

                  {/* Mystery Reveal Box Area */}
                  <div className="my-3.5">
                    {isRevealed && assignedCase ? (
                      /* Revealed Case View */
                      <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-emerald-600 text-white text-[10px] font-mono gap-1">
                            <Check className="size-3 stroke-[3]" /> {assignedCase.id}
                          </Badge>
                          <Badge variant="outline" className="bg-background text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                            <Layers className="size-3 mr-1" /> 5 Stase Ujian
                          </Badge>
                        </div>

                        <div className="mt-1 flex flex-col gap-1">
                          <span className="font-bold text-foreground text-sm leading-snug">
                            {assignedCase.nama}
                          </span>
                          <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                            {assignedCase.deskripsi}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Unrevealed Mystery Box */
                      <div
                        onClick={() => toggleRevealGroup(kel.id)}
                        className="group flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-500/40 bg-purple-500/5 p-4 text-center transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-md active:scale-98 select-none"
                      >
                        <div className="flex size-11 items-center justify-center rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white">
                          <HelpCircle className="size-6 stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-purple-700 dark:text-purple-300 group-hover:underline">
                            Kasus Misteri #0{index + 1}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Klik di sini untuk membuka kartu
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Toggle */}
                  <div className="border-t border-border/40 pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Status: {isRevealed ? <strong className="text-emerald-600 dark:text-emerald-400">Terbuka</strong> : "Terkunci"}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleRevealGroup(kel.id)}
                      className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      {isRevealed ? "Tutup Kartu" : "Buka Kartu"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 flex flex-row items-center justify-between border-t bg-card px-5 py-4 shrink-0">
          <span className="text-xs text-muted-foreground">
            Simulasi reveal telah selesai disiapkan untuk <strong>{kelompokList.length}</strong> kelompok.
          </span>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold"
          >
            Selesai Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
