import * as React from "react";
import {
  Check,
  CheckCircle2,
  Filter,
  GraduationCap,
  Search,
  User,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type KelompokLomba, type Mahasiswa, useContestStore } from "@/stores/contest-store";

interface MahasiswaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeKelompokId: string;
  kelompokList: KelompokLomba[];
  initialSelectedIds: string[];
  onConfirm: (selectedIds: string[]) => void;
}

export function MahasiswaPickerModal({
  open,
  onOpenChange,
  activeKelompokId,
  kelompokList,
  initialSelectedIds,
  onConfirm,
}: MahasiswaPickerModalProps) {
  const { mahasiswaList } = useContestStore();
  const [selectedIds, setSelectedIds] = React.useState<string[]>(initialSelectedIds);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "unassigned" | "selected">("all");

  // Sync state on open
  React.useEffect(() => {
    if (open) {
      setSelectedIds(initialSelectedIds);
      setSearchQuery("");
      setFilterMode("all");
    }
  }, [open, initialSelectedIds]);

  const activeKelompok = kelompokList.find((k) => k.id === activeKelompokId);

  // Map each student to which group they are assigned to (if any)
  const studentAssignmentMap = React.useMemo(() => {
    const map = new Map<string, { kelompokId: string; kelompokName: string }>();
    kelompokList.forEach((k) => {
      k.mahasiswa_ids.forEach((mId) => {
        map.set(mId, { kelompokId: k.id, kelompokName: k.nama });
      });
    });
    return map;
  }, [kelompokList]);

  const toggleStudent = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((mId) => mId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredStudents.map((s) => s.id);
    const combined = Array.from(new Set([...selectedIds, ...allFilteredIds]));
    setSelectedIds(combined);
  };

  const handleDeselectAllFiltered = () => {
    const filteredSet = new Set(filteredStudents.map((s) => s.id));
    setSelectedIds(selectedIds.filter((id) => !filteredSet.has(id)));
  };

  const filteredStudents = React.useMemo(() => {
    return mahasiswaList.filter((mhs) => {
      const matchSearch =
        mhs.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mhs.nim.toLowerCase().includes(searchQuery.toLowerCase());

      const assigned = studentAssignmentMap.get(mhs.id);
      const isAssignedToOther = assigned && assigned.kelompokId !== activeKelompokId;

      if (filterMode === "unassigned") {
        return matchSearch && (!assigned || assigned.kelompokId === activeKelompokId);
      }
      if (filterMode === "selected") {
        return matchSearch && selectedIds.includes(mhs.id);
      }
      return matchSearch;
    });
  }, [mahasiswaList, searchQuery, filterMode, selectedIds, studentAssignmentMap, activeKelompokId]);

  const handleSave = () => {
    onConfirm(selectedIds);
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
              <GraduationCap className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Pilih Mahasiswa untuk {activeKelompok?.nama || "Kelompok"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Pilih mahasiswa peserta ujian yang akan dimasukkan ke dalam kelompok ini.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 h-7">
              {selectedIds.length} Mahasiswa Dipilih
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

        {/* Toolbar: Search, Filter, Quick Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/20 px-5 py-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="w-full sm:w-64">
              <InputGroupAddon>
                <Search className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-8 text-xs"
                placeholder="Cari nama atau NIM mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <Select
              value={filterMode}
              onValueChange={(val) => setFilterMode(val as "all" | "unassigned" | "selected")}
            >
              <SelectTrigger className="h-8 w-44 text-xs">
                <Filter className="size-3 text-muted-foreground mr-1" />
                <SelectValue placeholder="Filter Mahasiswa" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectGroup>
                  <SelectItem value="all">Semua Mahasiswa ({mahasiswaList.length})</SelectItem>
                  <SelectItem value="unassigned">Belum Berkelompok</SelectItem>
                  <SelectItem value="selected">Hanya Terpilih ({selectedIds.length})</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleSelectAllFiltered}
              className="h-7 text-xs text-primary hover:bg-primary/10"
            >
              Pilih Semua ({filteredStudents.length})
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleDeselectAllFiltered}
              className="h-7 text-xs text-muted-foreground hover:bg-muted"
            >
              Reset Pilihan
            </Button>
          </div>
        </div>

        {/* Student Cards in 3-4 Column Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-muted-foreground">
              <User className="size-8 text-muted-foreground/40 mb-2" />
              <span className="font-semibold text-foreground">Mahasiswa tidak ditemukan</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Coba ubah kata kunci pencarian atau ubah filter status kelompok.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredStudents.map((mhs) => {
                const isSelected = selectedIds.includes(mhs.id);
                const assigned = studentAssignmentMap.get(mhs.id);
                const isAssignedToOther = assigned && assigned.kelompokId !== activeKelompokId;

                return (
                  <div
                    key={mhs.id}
                    onClick={() => toggleStudent(mhs.id)}
                    className={cn(
                      "group relative flex flex-col justify-between rounded-xl border p-3 transition-all cursor-pointer select-none shadow-2xs",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:border-border hover:bg-muted/40",
                      isAssignedToOther && !isSelected && "opacity-75 bg-muted/20",
                    )}
                  >
                    {/* Header: Name, NIM & Selection Checkbox */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors leading-tight">
                          {mhs.nama}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground mt-0.5">
                          NIM: {mhs.nim}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-all mt-0.5",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                            : "border-border/80 bg-background group-hover:border-foreground/40",
                        )}
                      >
                        {isSelected && <Check className="size-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Footer: Group Assignment Tag if in another group */}
                    {isAssignedToOther && (
                      <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px]">
                        <span className="text-amber-700 dark:text-amber-300 font-medium">
                          Di: {assigned.kelompokName}
                        </span>
                        <span className="text-muted-foreground italic">Pindah ke sini?</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="m-0 flex flex-row items-center justify-between border-t bg-card px-5 py-4 shrink-0">
          <span className="text-xs text-muted-foreground">
            <strong>{selectedIds.length}</strong> mahasiswa akan dimasukkan ke dalam <strong>{activeKelompok?.nama || "Kelompok"}</strong>
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
              <span>Pilih ({selectedIds.length} Mahasiswa)</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
