import * as React from "react";
import {
  Eye,
  FileCheck,
  Layers,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { useKasusStore } from "@/stores/kasus-store";
import { DetailKasusModal } from "./detail-kasus-modal";
import { KasusPickerModal } from "./kasus-picker-modal";

interface Step2PilihKasusProps {
  selectedKasusIds: string[];
  onChange: (ids: string[]) => void;
}

export function Step2PilihKasus({ selectedKasusIds, onChange }: Step2PilihKasusProps) {
  const { kasusList } = useKasusStore();
  const [isPickerModalOpen, setIsPickerModalOpen] = React.useState(false);
  const [viewingKasus, setViewingKasus] = React.useState<Kasus | null>(null);

  const selectedKasusList = React.useMemo(() => {
    return kasusList.filter((k) => selectedKasusIds.includes(k.id));
  }, [kasusList, selectedKasusIds]);

  const handleRemoveKasus = (id: string) => {
    onChange(selectedKasusIds.filter((kId) => kId !== id));
  };

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileCheck className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Pilih Skenario Kasus Ujian
            </h3>
            <p className="text-xs text-muted-foreground">
              Tentukan satu atau lebih skenario kasus dari Master Kasus yang akan diujikan dalam sirkuit kompetisi ini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="h-7 text-xs font-semibold text-primary border-primary/30">
            {selectedKasusIds.length} Kasus Dipilih
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Selected Cases Cards List (3-4 Columns) */}
        {selectedKasusList.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-foreground">
              Daftar Kasus Terpilih ({selectedKasusList.length}):
            </span>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {selectedKasusList.map((kasus) => {
                const totalPasien = kasus.pasien_ids?.length || 0;

                return (
                  <div
                    key={kasus.id}
                    className="flex flex-col justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5 shadow-2xs transition-all hover:border-primary"
                  >
                    <div>
                      {/* Top Code Badge & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] bg-background">
                          {kasus.id}
                        </Badge>

                        <div className="flex items-center gap-1">
                          {/* View Detail Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setViewingKasus(kasus)}
                            className="size-7 text-primary hover:bg-primary/10"
                            title="Lihat Detail Skenario & Pos"
                          >
                            <Eye className="size-3.5" />
                          </Button>

                          {/* Delete/Unselect Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemoveKasus(kasus.id)}
                            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Hapus dari daftar pilihan"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="my-2.5 flex flex-col gap-1">
                        <h4 className="font-bold text-xs leading-snug text-foreground line-clamp-2">
                          {kasus.nama}
                        </h4>
                        <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                          {kasus.deskripsi}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info & View Detail trigger */}
                    <div className="border-t border-primary/15 pt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3 text-muted-foreground" />
                        <span>{totalPasien} Pasien</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setViewingKasus(kasus)}
                        className="flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <Layers className="size-3" />
                        <span>Lihat 5 Pos</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Large Dashed Box with Centered + to open Picker Modal */}
        <div
          onClick={() => setIsPickerModalOpen(true)}
          className="group flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 bg-muted/10 p-6 text-center transition-all duration-200 hover:border-primary/60 hover:bg-primary/5 active:scale-[0.99]"
        >
          <div className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-background shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground text-primary">
            <Plus className="size-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              {selectedKasusIds.length > 0 ? "+ Tambah / Kelola Skenario Kasus Lomba" : "+ Pilih Skenario Kasus Lomba"}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Klik di sini untuk membuka katalog skenario Master Kasus dan memilih instrumen ujian
            </span>
          </div>
        </div>
      </div>

      {/* Kasus Multi-Select Modal Dialog */}
      <KasusPickerModal
        open={isPickerModalOpen}
        onOpenChange={setIsPickerModalOpen}
        selectedIds={selectedKasusIds}
        onConfirmSelection={onChange}
      />

      {/* Detail Kasus & 5 Stase Explorer Modal */}
      <DetailKasusModal
        open={viewingKasus !== null}
        onOpenChange={(open) => !open && setViewingKasus(null)}
        kasus={viewingKasus}
      />
    </div>
  );
}
