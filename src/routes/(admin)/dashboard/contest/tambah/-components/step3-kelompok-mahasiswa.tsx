import * as React from "react";
import {
  Check,
  Crown,
  GraduationCap,
  Plus,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type KelompokLomba, useContestStore } from "@/stores/contest-store";
import { MahasiswaPickerModal } from "./mahasiswa-picker-modal";

interface Step3KelompokMahasiswaProps {
  kelompokList: KelompokLomba[];
  onChange: (list: KelompokLomba[]) => void;
}

export function Step3KelompokMahasiswa({
  kelompokList,
  onChange,
}: Step3KelompokMahasiswaProps) {
  const { mahasiswaList } = useContestStore();
  const [activePickerKelompokId, setActivePickerKelompokId] = React.useState<string | null>(null);
  const [selectingKetuaForKelompokId, setSelectingKetuaForKelompokId] = React.useState<string | null>(null);

  // Map student ID to student object for quick lookup
  const studentMap = React.useMemo(() => {
    const map = new Map<string, { id: string; nama: string; nim: string }>();
    mahasiswaList.forEach((m) => map.set(m.id, m));
    return map;
  }, [mahasiswaList]);

  const handleAddKelompok = () => {
    const nextIndex = kelompokList.length + 1;
    const newKelompok: KelompokLomba = {
      id: `kel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nama: `Kelompok ${nextIndex}`,
      mahasiswa_ids: [],
    };
    onChange([...kelompokList, newKelompok]);
  };

  const handleRemoveKelompok = (id: string) => {
    onChange(kelompokList.filter((k) => k.id !== id));
  };

  const handleUpdateKelompokName = (id: string, newName: string) => {
    onChange(
      kelompokList.map((k) => (k.id === id ? { ...k, nama: newName } : k)),
    );
  };

  const handleSelectKetuaClick = (kelompokId: string, studentId: string) => {
    onChange(
      kelompokList.map((k) => {
        if (k.id === kelompokId) {
          // Toggle ketua
          return {
            ...k,
            ketua_mhs_id: k.ketua_mhs_id === studentId ? undefined : studentId,
          };
        }
        return k;
      }),
    );
    // End selection mode
    setSelectingKetuaForKelompokId(null);
  };

  const handleRemoveStudentFromGroup = (kelompokId: string, studentId: string) => {
    onChange(
      kelompokList.map((k) => {
        if (k.id === kelompokId) {
          const updatedIds = k.mahasiswa_ids.filter((id) => id !== studentId);
          return {
            ...k,
            mahasiswa_ids: updatedIds,
            ketua_mhs_id: k.ketua_mhs_id === studentId ? undefined : k.ketua_mhs_id,
          };
        }
        return k;
      }),
    );
  };

  const handleConfirmStudentsForGroup = (selectedStudentIds: string[]) => {
    if (!activePickerKelompokId) return;

    onChange(
      kelompokList.map((k) => {
        if (k.id === activePickerKelompokId) {
          const currentKetua = k.ketua_mhs_id;
          const validKetua = currentKetua && selectedStudentIds.includes(currentKetua)
            ? currentKetua
            : selectedStudentIds[0] || undefined;

          return {
            ...k,
            mahasiswa_ids: selectedStudentIds,
            ketua_mhs_id: validKetua,
          };
        }
        return {
          ...k,
          mahasiswa_ids: k.mahasiswa_ids.filter((id) => !selectedStudentIds.includes(id)),
          ketua_mhs_id: selectedStudentIds.includes(k.ketua_mhs_id || "") ? undefined : k.ketua_mhs_id,
        };
      }),
    );
  };

  const totalAssignedStudents = React.useMemo(() => {
    const set = new Set<string>();
    kelompokList.forEach((k) => k.mahasiswa_ids.forEach((id) => set.add(id)));
    return set.size;
  }, [kelompokList]);

  const activeKelompok = kelompokList.find((k) => k.id === activePickerKelompokId);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Manajemen Kelompok & Mahasiswa Peserta
            </h3>
            <p className="text-xs text-muted-foreground">
              Bagi peserta ujian ke dalam kelompok-kelompok sirkuit OSCE, tetapkan anggota, dan pilih ketua tim.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="h-7 text-xs font-semibold text-primary border-primary/30">
            {kelompokList.length} Kelompok &bull; {totalAssignedStudents} Mahasiswa Terdaftar
          </Badge>
        </div>
      </div>

      {/* Group Cards List */}
      <div className="flex flex-col gap-4">
        {kelompokList.map((kel, index) => {
          const memberCount = kel.mahasiswa_ids.length;
          const isSelectingKetua = selectingKetuaForKelompokId === kel.id;
          const ketuaStudent = kel.ketua_mhs_id ? studentMap.get(kel.ketua_mhs_id) : undefined;

          return (
            <div
              key={kel.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border p-4 transition-all shadow-2xs",
                isSelectingKetua
                  ? "border-amber-500/60 bg-amber-500/5 ring-2 ring-amber-500/20"
                  : "border-border/80 bg-muted/10 hover:border-border",
              )}
            >
              {/* Group Card Header: Name Input, Team Leader Button, and Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5 flex-1 max-w-md">
                  <Badge variant="secondary" className="font-mono text-xs font-bold shrink-0">
                    #{index + 1}
                  </Badge>
                  <Input
                    value={kel.nama}
                    onChange={(e) => handleUpdateKelompokName(kel.id, e.target.value)}
                    placeholder="Nama Kelompok..."
                    className="h-8 text-xs font-bold bg-background"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  {/* Button Pilih Ketua Tim */}
                  <Button
                    type="button"
                    variant={isSelectingKetua ? "default" : "outline"}
                    size="sm"
                    disabled={memberCount === 0}
                    onClick={() =>
                      setSelectingKetuaForKelompokId(isSelectingKetua ? null : kel.id)
                    }
                    className={cn(
                      "h-7 gap-1.5 text-xs font-semibold transition-all",
                      isSelectingKetua
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                        : kel.ketua_mhs_id
                          ? "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
                          : "bg-background",
                    )}
                  >
                    <Crown className="size-3.5 text-amber-500" />
                    <span>
                      {isSelectingKetua
                        ? "Batal Memilih Ketua"
                        : ketuaStudent
                          ? `Ketua: ${ketuaStudent.nama.split(" ")[0]}`
                          : "Pilih Ketua Tim"}
                    </span>
                  </Button>

                  <Badge variant="outline" className="h-7 text-xs font-medium bg-background">
                    {memberCount} Mahasiswa
                  </Badge>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setSelectingKetuaForKelompokId(null);
                      setActivePickerKelompokId(kel.id);
                    }}
                    className="h-7 gap-1.5 text-xs font-semibold"
                  >
                    <UserPlus className="size-3.5" />
                    <span>Pilih Mahasiswa</span>
                  </Button>

                  {kelompokList.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveKelompok(kel.id)}
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Hapus Kelompok"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Notice when selecting ketua */}
              {isSelectingKetua && (
                <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-300 animate-in fade-in">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Crown className="size-3.5" />
                    <strong>Mode Pilih Ketua Aktif:</strong> Silakan klik salah satu kartu mahasiswa di bawah ini untuk menjadikannya Ketua Tim.
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setSelectingKetuaForKelompokId(null)}
                    className="h-6 text-xs text-amber-900 dark:text-amber-200"
                  >
                    Selesai
                  </Button>
                </div>
              )}

              {/* Members List Chips Preview */}
              <div className="border-t border-border/40 pt-3">
                {memberCount === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/70 bg-background/60 py-3.5 text-center text-xs text-muted-foreground">
                    Belum ada mahasiswa dalam kelompok ini. Klik tombol <strong>&ldquo;Pilih Mahasiswa&rdquo;</strong> di atas untuk menambahkan.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {kel.mahasiswa_ids.map((mId) => {
                      const student = studentMap.get(mId);
                      if (!student) return null;
                      const isKetua = kel.ketua_mhs_id === mId;

                      return (
                        <div
                          key={mId}
                          onClick={() => {
                            if (isSelectingKetua) {
                              handleSelectKetuaClick(kel.id, mId);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs shadow-2xs transition-all select-none",
                            isKetua
                              ? "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30 text-foreground"
                              : isSelectingKetua
                                ? "border-amber-400/80 bg-background hover:border-amber-500 hover:bg-amber-500/10 hover:ring-2 hover:ring-amber-500/20 cursor-pointer animate-pulse"
                                : "border-border/80 bg-background",
                          )}
                          title={isSelectingKetua ? `Klik untuk jadikan ${student.nama} sebagai Ketua Tim` : undefined}
                        >
                          {isKetua && (
                            <Badge className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0 gap-0.5 shadow-2xs">
                              <Crown className="size-2.5" /> Ketua
                            </Badge>
                          )}

                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground leading-tight text-xs">
                              {student.nama}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground leading-tight">
                              NIM: {student.nim}
                            </span>
                          </div>

                          {!isSelectingKetua && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveStudentFromGroup(kel.id, mId);
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors ml-1 p-0.5 rounded"
                              title={`Hapus ${student.nama} dari kelompok`}
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Full-width Add Group Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAddKelompok}
          className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-primary/40 bg-background text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-[0.99]"
        >
          <Plus className="size-4 text-primary" />
          <span>Tambah Kelompok Baru</span>
        </Button>
      </div>

      {/* Mahasiswa Multi-Select Grid Modal */}
      {activePickerKelompokId && (
        <MahasiswaPickerModal
          open={activePickerKelompokId !== null}
          onOpenChange={(open) => !open && setActivePickerKelompokId(null)}
          activeKelompokId={activePickerKelompokId}
          kelompokList={kelompokList}
          initialSelectedIds={activeKelompok?.mahasiswa_ids || []}
          onConfirm={handleConfirmStudentsForGroup}
        />
      )}
    </div>
  );
}
