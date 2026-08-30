import * as React from "react";
import {
  Check,
  CheckCircle2,
  FileCheck,
  Layers,
  Search,
  Users,
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
import { useKasusStore } from "@/stores/kasus-store";

interface KasusPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onConfirmSelection: (selectedIds: string[]) => void;
}

export function KasusPickerModal({
  open,
  onOpenChange,
  selectedIds: initialSelectedIds,
  onConfirmSelection,
}: KasusPickerModalProps) {
  const { kasusList } = useKasusStore();
  const [selectedIds, setSelectedIds] = React.useState<string[]>(initialSelectedIds);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Sync state on open
  React.useEffect(() => {
    if (open) {
      setSelectedIds(initialSelectedIds);
      setSearchQuery("");
    }
  }, [open, initialSelectedIds]);

  const toggleKasus = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((kId) => kId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredKasus = React.useMemo(() => {
    return kasusList.filter((k) => {
      return (
        k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [kasusList, searchQuery]);

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
              <FileCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Pilih Skenario Kasus Ujian</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Pilih satu atau beberapa skenario kasus dari Master Kasus untuk kompetisi ini.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 h-7">
              {selectedIds.length} Kasus Dipilih
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
              placeholder="Cari nama skenario kasus atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <span className="text-xs text-muted-foreground">
            Total {filteredKasus.length} Kasus Tersedia
          </span>
        </div>

        {/* Card Grid in 3-4 Columns */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredKasus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-muted-foreground">
              <FileCheck className="size-8 text-muted-foreground/40 mb-2" />
              <span className="font-semibold text-foreground">Skenario kasus tidak ditemukan</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Coba ubah kata kunci pencarian Anda.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredKasus.map((kasus) => {
                const isSelected = selectedIds.includes(kasus.id);
                const totalPasien = kasus.pasien_ids?.length || 0;

                return (
                  <div
                    key={kasus.id}
                    onClick={() => toggleKasus(kasus.id)}
                    className={cn(
                      "group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer select-none shadow-2xs",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:border-border hover:bg-muted/30",
                    )}
                  >
                    {/* Header: ID Badge & Checkbox */}
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] bg-background">
                        {kasus.id}
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

                    {/* Content */}
                    <div className="my-2.5 flex flex-col gap-1">
                      <h4 className="font-bold text-xs leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {kasus.nama}
                      </h4>
                      <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                        {kasus.deskripsi}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        <span>{totalPasien} Pasien</span>
                      </span>

                      <span className="flex items-center gap-1 font-medium text-primary">
                        <Layers className="size-3" />
                        <span>5 Stase Ujian</span>
                      </span>
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
            <strong>{selectedIds.length}</strong> kasus terpilih untuk kompetisi
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
              <span>Pilih ({selectedIds.length} Kasus)</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
