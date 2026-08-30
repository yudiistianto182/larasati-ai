import * as React from "react";
import {
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContestStore } from "@/stores/contest-store";
import { PenilaiPickerModal } from "./penilai-picker-modal";

interface Step5PilihPenilaiProps {
  selectedPenilaiIds: string[];
  onChange: (ids: string[]) => void;
}

export function Step5PilihPenilai({
  selectedPenilaiIds,
  onChange,
}: Step5PilihPenilaiProps) {
  const { penilaiList } = useContestStore();
  const [isPickerModalOpen, setIsPickerModalOpen] = React.useState(false);

  const selectedPenilaiList = React.useMemo(() => {
    return penilaiList.filter((p) => selectedPenilaiIds.includes(p.id));
  }, [penilaiList, selectedPenilaiIds]);

  const handleRemovePenilai = (id: string) => {
    onChange(selectedPenilaiIds.filter((pId) => pId !== id));
  };

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Pilih Penilai / Penguji Ujian Lomba
            </h3>
            <p className="text-xs text-muted-foreground">
              Tentukan dewan penguji, instruktur klinis, atau dokter ahli yang bertugas memberikan penilaian pada sirkuit kompetisi ini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="h-7 text-xs font-semibold text-primary border-primary/30">
            {selectedPenilaiIds.length} Penilai Ditugaskan
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Selected Penilai Cards Grid */}
        {selectedPenilaiList.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-foreground">
              Daftar Penguji Ditugaskan ({selectedPenilaiList.length}):
            </span>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {selectedPenilaiList.map((penilai) => (
                <div
                  key={penilai.id}
                  className="flex flex-col justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5 shadow-2xs transition-all hover:border-primary"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {penilai.role}
                      </Badge>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemovePenilai(penilai.id)}
                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Hapus dari penugasan"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="my-2 flex flex-col">
                      <span className="font-bold text-xs text-foreground leading-snug">
                        {penilai.nama}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground mt-0.5">
                        NIP: {penilai.nip}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-primary/15 pt-2 text-[10px] text-muted-foreground line-clamp-1">
                    <span className="font-medium text-foreground">Keahlian:</span> {penilai.spesialisasi}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/80 bg-background/50 py-8 text-center text-xs text-muted-foreground">
            <UserCheck className="size-7 text-muted-foreground/40 mx-auto mb-1.5" />
            <span className="font-semibold text-foreground">Belum ada penilai yang ditugaskan</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Klik tombol di bawah untuk memilih dosen penguji atau instruktur klinis dari database sistem.
            </p>
          </div>
        )}

        {/* Full-width Rectangular Add Button (Matches patient attribute button style) */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPickerModalOpen(true)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-background text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-[0.99]"
        >
          <Plus className="size-4 text-primary" />
          <span>Tambah Penilai Lomba</span>
        </Button>
      </div>

      {/* Penilai Picker Modal */}
      <PenilaiPickerModal
        open={isPickerModalOpen}
        onOpenChange={setIsPickerModalOpen}
        selectedIds={selectedPenilaiIds}
        onConfirmSelection={onChange}
      />
    </div>
  );
}
