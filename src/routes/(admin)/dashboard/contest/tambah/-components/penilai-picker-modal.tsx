import * as React from "react";
import {
  Check,
  CheckCircle2,
  GraduationCap,
  Search,
  ShieldCheck,
  UserCheck,
  X,
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { type Penilai, useContestStore } from "@/stores/contest-store";

interface PenilaiPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onConfirmSelection: (selectedIds: string[]) => void;
}

export function PenilaiPickerModal({
  open,
  onOpenChange,
  selectedIds: initialSelectedIds,
  onConfirmSelection,
}: PenilaiPickerModalProps) {
  const { penilaiList } = useContestStore();
  const [selectedIds, setSelectedIds] = React.useState<string[]>(initialSelectedIds);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Sync state on open
  React.useEffect(() => {
    if (open) {
      setSelectedIds(initialSelectedIds);
      setSearchQuery("");
    }
  }, [open, initialSelectedIds]);

  const togglePenilai = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((pId) => pId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredPenilai = React.useMemo(() => {
    return penilaiList.filter((p) => {
      return (
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.spesialisasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [penilaiList, searchQuery]);

  const handleSave = () => {
    onConfirmSelection(selectedIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-[95vw] sm:max-w-5xl flex-col overflow-hidden p-0 gap-0 border-border/80 shadow-2xl"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-5 py-3.5 bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Pilih Penilai / Penguji Ujian</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Tentukan dosen penguji, instruktur klinis, atau dokter penilai yang bertugas mengevaluasi kompetisi.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 h-7">
              {selectedIds.length} Penilai Dipilih
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

        {/* Toolbar: Search */}
        <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-3 shrink-0">
          <InputGroup className="w-full sm:w-80">
            <InputGroupAddon>
              <Search className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-8 text-xs"
              placeholder="Cari nama penilai, NIP, atau spesialisasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <span className="text-xs text-muted-foreground">
            Total {filteredPenilai.length} Penguji Tersedia
          </span>
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredPenilai.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-muted-foreground">
              <UserCheck className="size-8 text-muted-foreground/40 mb-2" />
              <span className="font-semibold text-foreground">Penilai tidak ditemukan</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Coba ubah kata kunci pencarian Anda.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {filteredPenilai.map((penilai) => {
                const isSelected = selectedIds.includes(penilai.id);

                return (
                  <div
                    key={penilai.id}
                    onClick={() => togglePenilai(penilai.id)}
                    className={cn(
                      "group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer select-none shadow-2xs",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:border-border hover:bg-muted/30",
                    )}
                  >
                    <div>
                      {/* Header: Role Badge & Checkbox */}
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                          {penilai.role}
                        </Badge>

                        <div
                          className={cn(
                            "flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-all",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                              : "border-border/80 bg-background group-hover:border-foreground/40",
                          )}
                        >
                          {isSelected && <Check className="size-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Content: Name & NIP */}
                      <div className="my-2 flex flex-col">
                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors leading-snug">
                          {penilai.nama}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground mt-0.5">
                          NIP: {penilai.nip}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Spesialisasi */}
                    <div className="border-t border-border/40 pt-2 text-[10px] text-muted-foreground line-clamp-1">
                      <span className="font-medium text-foreground">Keahlian:</span> {penilai.spesialisasi}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="m-0 flex flex-row items-center justify-between border-t bg-card px-5 py-4 shrink-0">
          <span className="text-xs text-muted-foreground">
            <strong>{selectedIds.length}</strong> penguji dipilih untuk bertugas
          </span>

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
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Pilih ({selectedIds.length} Penilai)</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
