import * as React from "react";
import { Check, CheckCircle2, FileCheck, Layers, Users, X } from "lucide-react";

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
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import type { KelompokLomba } from "@/stores/contest-store";

interface GroupKasusPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kelompok: KelompokLomba | null;
  availableKasus: Kasus[];
  assignedOtherCaseIds: Set<string>;
  allowSharedKasus: boolean;
  onSelectKasus: (kelompokId: string, kasusId: string) => void;
}

export function GroupKasusPickerModal({
  open,
  onOpenChange,
  kelompok,
  availableKasus,
  assignedOtherCaseIds,
  allowSharedKasus,
  onSelectKasus,
}: GroupKasusPickerModalProps) {
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(kelompok?.kasus_id || "");

  React.useEffect(() => {
    if (open && kelompok) {
      setSelectedCaseId(kelompok.kasus_id || "");
    }
  }, [open, kelompok]);

  if (!kelompok) return null;

  const handleSave = () => {
    onSelectKasus(kelompok.id, selectedCaseId);
    onOpenChange(false);
  };

  const handleUnassign = () => {
    onSelectKasus(kelompok.id, "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-[95vw] sm:max-w-3xl flex-col overflow-hidden p-0 gap-0 border-border/80 shadow-2xl"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-5 py-3.5 bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Tautkan Kasus untuk {kelompok.nama}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Pilih satu skenario kasus ujian yang akan dikerjakan oleh kelompok ini.
              </DialogDescription>
            </div>
          </div>

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
        </DialogHeader>

        {/* Body: Case Cards */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {availableKasus.map((kasus) => {
              const isAssignedToOther =
                !allowSharedKasus &&
                assignedOtherCaseIds.has(kasus.id) &&
                kasus.id !== kelompok.kasus_id;
              const isSelected = selectedCaseId === kasus.id;
              const totalPasien = kasus.pasien_ids?.length || 0;

              return (
                <div
                  key={kasus.id}
                  onClick={() => {
                    if (!isAssignedToOther) {
                      setSelectedCaseId(kasus.id);
                    }
                  }}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-3.5 transition-all shadow-2xs select-none",
                    isAssignedToOther
                      ? "opacity-50 border-border/50 bg-muted/40 cursor-not-allowed"
                      : "cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : !isAssignedToOther && "border-border/80 bg-card hover:border-border hover:bg-muted/30",
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] bg-background">
                        {kasus.id}
                      </Badge>

                      <div
                        className={cn(
                          "flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-all",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                            : "border-border/80 bg-background",
                        )}
                      >
                        {isSelected && <Check className="size-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="my-2 flex flex-col gap-1">
                      <h4 className="font-bold text-xs text-foreground leading-snug">
                        {kasus.nama}
                      </h4>
                      <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                        {kasus.deskripsi}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3" /> {totalPasien} Pasien
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      <Layers className="size-3" /> 5 Stase Ujian
                    </span>
                  </div>

                  {isAssignedToOther && (
                    <div className="mt-2 rounded bg-destructive/10 px-2 py-1 text-[10px] text-destructive font-medium">
                      Sudah dipakai kelompok lain (Mode Eksklusif)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 flex flex-row items-center justify-between border-t bg-card px-5 py-4 shrink-0">
          <div>
            {kelompok.kasus_id && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUnassign}
                className="h-8 text-xs text-destructive hover:bg-destructive/10"
              >
                Lepas Kasus
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!selectedCaseId}
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Tautkan Kasus</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
