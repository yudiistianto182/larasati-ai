import * as React from "react";
import { Check, Filter, Search, Tag, UserCheck, User, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fallbackPasien, type Pasien } from "@/routes/(admin)/dashboard/master/pasien/-components/data";

interface PasienPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onConfirmSelection: (selectedIds: string[]) => void;
}

export function PasienPickerModal({
  open,
  onOpenChange,
  selectedIds,
  onConfirmSelection,
}: PasienPickerModalProps) {
  const [tempSelected, setTempSelected] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [genderFilter, setGenderFilter] = React.useState<string>("all");

  // Sync tempSelected when modal opens
  React.useEffect(() => {
    if (open) {
      setTempSelected([...selectedIds]);
      setSearchQuery("");
      setGenderFilter("all");
    }
  }, [open, selectedIds]);

  const toggleSelect = (id: string) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const filteredPasien = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return fallbackPasien.filter((p) => {
      const matchGender = genderFilter === "all" || p.jenis_kelamin === genderFilter;
      if (!matchGender) return false;
      if (!q) return true;
      return (
        p.nama.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.jenis_kelamin.toLowerCase().includes(q) ||
        p.latar_belakang.toLowerCase().includes(q) ||
        p.atribut?.some(
          (a) =>
            a.key.toLowerCase().includes(q) ||
            a.value.toLowerCase().includes(q),
        )
      );
    });
  }, [searchQuery, genderFilter]);

  const handleSelectAll = () => {
    if (tempSelected.length === filteredPasien.length) {
      setTempSelected([]);
    } else {
      setTempSelected(filteredPasien.map((p) => p.id));
    }
  };

  const handleSave = () => {
    onConfirmSelection(tempSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-[95vw] sm:max-w-6xl flex-col overflow-hidden p-0 gap-0 border-border/80 shadow-2xl"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-5 py-3.5 bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Pilih Subjek Pasien</span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {tempSelected.length} Dipilih
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Pilih satu atau lebih profil pasien untuk dikaitkan dengan skenario kasus ini.
              </DialogDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Tutup (Esc)"
          >
            <X className="size-4" />
            <span className="sr-only">Tutup</span>
          </Button>
        </DialogHeader>

        {/* Search & Gender Filter & Selection Controls */}
        <div className="flex flex-col gap-2.5 p-5 pb-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <InputGroup className="h-8 w-full sm:w-72">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Cari nama, ID, atau atribut..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs"
                autoFocus
              />
            </InputGroup>

            {/* Gender Filter Select */}
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger size="sm" className="h-8 w-36 text-xs">
                <Filter className="size-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Semua Gender" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectGroup>
                  <SelectItem value="all">Semua Gender</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleSelectAll}
            >
              {tempSelected.length === filteredPasien.length
                ? "Batal Pilih Semua"
                : "Pilih Semua"}
            </Button>
            <Badge variant="secondary" className="h-8 px-2.5 text-xs font-semibold">
              {tempSelected.length} Dipilih
            </Badge>
          </div>
        </div>

        {/* Patient Cards Grid (Max 3 Columns for Broad Spacing) */}
        <div className="min-h-64 max-h-[55vh] flex-1 overflow-y-auto px-5 py-2.5">
          {filteredPasien.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed text-center text-xs text-muted-foreground">
              <User className="size-8 text-muted-foreground/50 mb-1.5" />
              <span>Tidak ada data pasien yang sesuai dengan filter atau kata kunci pencarian.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredPasien.map((pasien) => {
                const isSelected = tempSelected.includes(pasien.id);
                return (
                  <div
                    key={pasien.id}
                    onClick={() => toggleSelect(pasien.id)}
                    className={cn(
                      "group relative flex cursor-pointer flex-col justify-between gap-2.5 rounded-xl border p-3.5 transition-all select-none",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/30",
                    )}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Card Top Row: Checkbox, Name, Gender */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(pasien.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5"
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors leading-tight">
                              {pasien.nama}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {pasien.id} &bull; {pasien.umur} th
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={pasien.jenis_kelamin === "Perempuan" ? "secondary" : "outline"}
                          className="text-[10px] shrink-0"
                        >
                          {pasien.jenis_kelamin}
                        </Badge>
                      </div>

                      {/* Latar Belakang Snippet */}
                      <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                        {pasien.latar_belakang || "-"}
                      </p>
                    </div>

                    {/* Atribut Dinamis preview */}
                    {pasien.atribut && pasien.atribut.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 border-t border-border/40 pt-2">
                        {pasien.atribut.slice(0, 2).map((a) => (
                          <span
                            key={a.id}
                            className="inline-flex items-center gap-1 rounded bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border/40"
                          >
                            <span>{a.key}:</span>
                            <span className="font-semibold text-foreground">{a.value}</span>
                          </span>
                        ))}
                        {pasien.atribut.length > 2 && (
                          <span className="text-[10px] text-muted-foreground font-medium">
                            +{pasien.atribut.length - 2} lagi
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Dynamic Counter Button */}
        <DialogFooter className="m-0 flex flex-row items-center justify-between border-t bg-card px-5 py-4 shrink-0">
          <span className="text-xs text-muted-foreground">
            <strong>{tempSelected.length}</strong> pasien dipilih
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
              className="h-8 text-xs font-semibold gap-1.5 shadow-xs"
            >
              <UserCheck className="size-3.5" />
              <span>Pilih ({tempSelected.length} Pasien Terpilih)</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
