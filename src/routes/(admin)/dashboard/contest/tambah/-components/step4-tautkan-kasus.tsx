import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Dices,
  Eye,
  FileCheck,
  HelpCircle,
  Layers,
  Link2,
  Lock,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { KelompokLomba } from "@/stores/contest-store";
import { useContestStore } from "@/stores/contest-store";
import { useKasusStore } from "@/stores/kasus-store";
import { GroupKasusPickerModal } from "./group-kasus-picker-modal";
import { MysteryRevealModal } from "./mystery-reveal-modal";

interface Step4TautkanKasusProps {
  selectedKasusIds: string[];
  kelompokList: KelompokLomba[];
  allowSharedKasus: boolean;
  onAllowSharedKasusChange: (val: boolean) => void;
  onKelompokListChange: (list: KelompokLomba[]) => void;
}

export function Step4TautkanKasus({
  selectedKasusIds,
  kelompokList,
  allowSharedKasus,
  onAllowSharedKasusChange,
  onKelompokListChange,
}: Step4TautkanKasusProps) {
  const { kasusList } = useKasusStore();
  const { mahasiswaList } = useContestStore();

  const [activePickerKelompok, setActivePickerKelompok] = React.useState<KelompokLomba | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState<boolean>(false);

  const isSingleKasus = selectedKasusIds.length === 1;

  // Filter only valid cases selected in Step 2
  const availableKasus = React.useMemo(() => {
    const matched = kasusList.filter((k) => selectedKasusIds.includes(k.id));
    return matched.length > 0 ? matched : kasusList;
  }, [kasusList, selectedKasusIds]);

  // Valid case ID pool
  const validKasusPool = React.useMemo(() => {
    return availableKasus.map((k) => k.id);
  }, [availableKasus]);

  // Case lookup map
  const kasusMap = React.useMemo(() => {
    const map = new Map<string, (typeof kasusList)[0]>();
    kasusList.forEach((k) => map.set(k.id, k));
    return map;
  }, [kasusList]);

  // Student lookup map
  const studentMap = React.useMemo(() => {
    const map = new Map<string, { id: string; nama: string }>();
    mahasiswaList.forEach((m) => map.set(m.id, m));
    return map;
  }, [mahasiswaList]);

  // BRIEF ENFORCEMENT:
  // If only 1 case selected in Step 2:
  // 1. Auto-assign all groups to that single case
  // 2. Lock allowSharedKasus to true (multi-kelompok)
  React.useEffect(() => {
    if (isSingleKasus && validKasusPool.length > 0) {
      const singleCaseId = validKasusPool[0];
      const needsUpdate = kelompokList.some((k) => k.kasus_id !== singleCaseId);
      if (needsUpdate) {
        onKelompokListChange(
          kelompokList.map((k) => ({
            ...k,
            kasus_id: singleCaseId,
          })),
        );
      }
      if (!allowSharedKasus) {
        onAllowSharedKasusChange(true);
      }
    }
  }, [isSingleKasus, validKasusPool, kelompokList, allowSharedKasus, onKelompokListChange, onAllowSharedKasusChange]);

  const handleAssignKasusToKelompok = (kelompokId: string, kasusId: string) => {
    onKelompokListChange(
      kelompokList.map((k) => (k.id === kelompokId ? { ...k, kasus_id: kasusId || undefined } : k)),
    );
  };

  // Shuffle / Acak Kasus ke Seluruh Kelompok (Dijamin Semua Kelompok Langsung Dapat Kasus)
  const handleShuffleKasus = () => {
    if (validKasusPool.length === 0 || kelompokList.length === 0) return;

    if (allowSharedKasus) {
      // Mode Bebas / Multi-Kelompok:
      // Setiap kelompok mendapatkan satu kasus acak dari pool kasus yang terpilih
      const updated = kelompokList.map((k) => {
        const randomIndex = Math.floor(Math.random() * validKasusPool.length);
        return {
          ...k,
          kasus_id: validKasusPool[randomIndex],
        };
      });
      onKelompokListChange(updated);
    } else {
      // Mode Eksklusif (1 Kasus 1 Kelompok):
      // Acak urutan pool kasus menggunakan algoritma Fisher-Yates
      const shuffledCases = [...validKasusPool];
      for (let i = shuffledCases.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCases[i], shuffledCases[j]] = [shuffledCases[j], shuffledCases[i]];
      }

      // Bagikan ke setiap kelompok secara adil tanpa ada yang tertinggal
      const updated = kelompokList.map((k, index) => {
        const assignedCaseId = shuffledCases[index % shuffledCases.length];
        return {
          ...k,
          kasus_id: assignedCaseId,
        };
      });
      onKelompokListChange(updated);
    }
  };

  // Set of assigned case IDs across other groups (for exclusivity checking)
  const getAssignedCaseIdsExcluding = (currentKelompokId: string) => {
    const assignedSet = new Set<string>();
    kelompokList.forEach((k) => {
      if (k.id !== currentKelompokId && k.kasus_id) {
        assignedSet.add(k.kasus_id);
      }
    });
    return assignedSet;
  };

  const allKelompokAssigned = kelompokList.every((k) => !!k.kasus_id);
  const totalStudents = kelompokList.reduce((acc, k) => acc + (k.mahasiswa_ids?.length || 0), 0);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Link2 className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Penautan Skenario Kasus ke Setiap Kelompok
            </h3>
            <p className="text-xs text-muted-foreground">
              Tentukan kasus ujian yang akan dikerjakan oleh masing-masing kelompok peserta.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Tombol Acak Kasus (Aktif jika kasus > 1) */}
          {selectedKasusIds.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShuffleKasus}
              className="h-7 gap-1.5 text-xs font-semibold bg-background shadow-2xs hover:border-primary hover:text-primary"
            >
              <Dices className="size-3.5 text-primary" />
              <span>Acak Kasus ke Kelompok</span>
            </Button>
          )}

          {/* Tombol Preview Gimmick Mystery Reveal */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewModalOpen(true)}
            className="h-7 gap-1.5 text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/20 shadow-2xs"
          >
            <Sparkles className="size-3.5 text-purple-500" />
            <span>Preview Undian Kasus</span>
          </Button>

          <Badge
            variant="outline"
            className={cn(
              "h-7 text-xs font-semibold",
              allKelompokAssigned
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
            )}
          >
            {allKelompokAssigned ? "Semua Kelompok Tertaut" : "Sebagian Belum Tertaut"}
          </Badge>
        </div>
      </div>

      {/* Global Setting: Allow Shared Cases Toggle with Dynamic Background Color */}
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs transition-all duration-300",
          allowSharedKasus
            ? "border-indigo-500/50 bg-gradient-to-r from-indigo-500/15 via-blue-500/10 to-indigo-500/15 ring-1 ring-indigo-500/20"
            : "border-amber-500/30 bg-amber-500/5",
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-xl mt-0.5 transition-colors",
              allowSharedKasus
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-amber-500/20 text-amber-700 dark:text-amber-300",
            )}
          >
            <Share2 className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="shared-kasus-switch"
                className="text-xs font-bold text-foreground cursor-pointer"
              >
                Izinkan Kasus yang Sama untuk Beberapa Kelompok?
              </Label>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold bg-background",
                  isSingleKasus && "border-primary/40 text-primary",
                )}
              >
                {isSingleKasus ? (
                  <span className="flex items-center gap-1">
                    <Lock className="size-2.5" /> Terkunci (Hanya 1 Kasus Tersedia)
                  </span>
                ) : allowSharedKasus ? (
                  "Multi-Kelompok (Bebas)"
                ) : (
                  "Eksklusif (1 Kasus 1 Kelompok)"
                )}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {isSingleKasus
                ? "Karena hanya 1 kasus yang dipilih di Step 2, semua kelompok otomatis ditautkan ke kasus ini secara bersamaan."
                : allowSharedKasus
                  ? "Satu skenario kasus yang sama dapat ditautkan ke lebih dari satu kelompok secara bebas."
                  : "Setiap kasus bersifat eksklusif per kelompok. Kasus yang sudah dipilih kelompok lain tidak dapat dipilih kembali."}
            </p>
          </div>
        </div>

        <div className="self-end sm:self-auto flex items-center gap-2">
          <Switch
            id="shared-kasus-switch"
            checked={allowSharedKasus}
            onCheckedChange={onAllowSharedKasusChange}
            disabled={isSingleKasus}
          />
        </div>
      </div>

      {/* Warning if no cases selected in Step 2 */}
      {availableKasus.length === 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            Anda belum memilih kasus pada <strong>Step 2 (Pilih Kasus)</strong>. Silakan kembali ke Step 2 dan centang minimal satu skenario kasus terlebih dahulu.
          </span>
        </div>
      )}

      {/* Group Mapping Cards Grid (2-3 Columns) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">
            Daftar Kelompok & Penautan Skenario Kasus:
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {kelompokList.filter((k) => !!k.kasus_id).length} dari {kelompokList.length} kelompok telah tertaut
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kelompokList.map((kel, index) => {
            const assignedCase = kel.kasus_id ? kasusMap.get(kel.kasus_id) : undefined;
            const ketuaStudent = kel.ketua_mhs_id ? studentMap.get(kel.ketua_mhs_id) : undefined;

            return (
              <div
                key={kel.id}
                className={cn(
                  "flex flex-col justify-between rounded-xl border p-4 transition-all shadow-2xs",
                  assignedCase
                    ? "border-border/80 bg-card hover:border-primary/50"
                    : "border-amber-500/40 bg-amber-500/5",
                )}
              >
                <div>
                  {/* Card Header: Group Name & Badge */}
                  <div className="flex items-start justify-between border-b pb-2.5 gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs font-bold shrink-0">
                        #{index + 1}
                      </Badge>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground leading-tight">
                          {kel.nama}
                        </span>
                        {ketuaStudent && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium mt-0.5">
                            <Crown className="size-2.5" /> Ketua: {ketuaStudent.nama.split(" ")[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] bg-background">
                      {kel.mahasiswa_ids.length} Mhs
                    </Badge>
                  </div>

                  {/* Body: Assigned Case Preview */}
                  <div className="my-3">
                    {assignedCase ? (
                      <div className="flex flex-col gap-1.5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-[10px] bg-background">
                            {assignedCase.id}
                          </Badge>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                            <Layers className="size-3" /> 5 Stase
                          </span>
                        </div>
                        <span className="font-bold text-foreground line-clamp-1 mt-0.5">
                          {assignedCase.nama}
                        </span>
                        <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                          {assignedCase.deskripsi}
                        </p>
                      </div>
                    ) : (
                      <div className="flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/40 bg-background/50 p-3 text-center text-xs text-amber-700 dark:text-amber-300">
                        <HelpCircle className="size-5 text-amber-500/60 mb-1" />
                        <span className="font-medium">Belum Ada Kasus Ditautkan</span>
                        <span className="text-[10px] text-muted-foreground">
                          Klik tombol di bawah untuk memilih skenario
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions: Pilih Kasus Modal Trigger */}
                <div className="border-t border-border/40 pt-2.5 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant={assignedCase ? "outline" : "default"}
                    size="sm"
                    onClick={() => setActivePickerKelompok(kel)}
                    className={cn(
                      "flex-1 h-7.5 text-xs font-semibold gap-1.5 shadow-2xs",
                      !assignedCase && "bg-primary text-primary-foreground",
                    )}
                  >
                    <Plus className="size-3.5" />
                    <span>{assignedCase ? "Ubah Skenario Kasus" : "Pilih Kasus"}</span>
                  </Button>

                  {assignedCase && !isSingleKasus && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleAssignKasusToKelompok(kel.id, "")}
                      className="size-7.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Lepas Penautan Kasus"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Matrix Box */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
        <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
          <FileCheck className="size-3.5 text-primary" /> Ringkasan Penautan Skenario Kasus
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
          <div className="flex flex-col p-2 rounded-lg bg-background border">
            <span className="text-[10px] text-muted-foreground">Total Kasus Terpilih</span>
            <span className="font-bold text-foreground text-sm">{selectedKasusIds.length} Skenario</span>
          </div>
          <div className="flex flex-col p-2 rounded-lg bg-background border">
            <span className="text-[10px] text-muted-foreground">Jumlah Kelompok</span>
            <span className="font-bold text-foreground text-sm">{kelompokList.length} Kelompok</span>
          </div>
          <div className="flex flex-col p-2 rounded-lg bg-background border">
            <span className="text-[10px] text-muted-foreground">Total Mahasiswa</span>
            <span className="font-bold text-foreground text-sm">{totalStudents} Peserta</span>
          </div>
          <div className="flex flex-col p-2 rounded-lg bg-background border">
            <span className="text-[10px] text-muted-foreground">Status Penautan</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {kelompokList.filter((k) => !!k.kasus_id).length} / {kelompokList.length} Tertaut
            </span>
          </div>
        </div>
      </div>

      {/* Modal Dialog Picker for Individual Group */}
      {activePickerKelompok && (
        <GroupKasusPickerModal
          open={activePickerKelompok !== null}
          onOpenChange={(open) => !open && setActivePickerKelompok(null)}
          kelompok={activePickerKelompok}
          availableKasus={availableKasus}
          assignedOtherCaseIds={getAssignedCaseIdsExcluding(activePickerKelompok.id)}
          allowSharedKasus={allowSharedKasus}
          onSelectKasus={handleAssignKasusToKelompok}
        />
      )}

      {/* Mystery Reveal Simulation Modal */}
      <MysteryRevealModal
        open={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        kelompokList={kelompokList}
      />
    </div>
  );
}
