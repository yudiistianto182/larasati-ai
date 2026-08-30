import { Calendar, FileText, Tag, User } from "lucide-react";

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

import { calculateAge, type Pasien } from "./data";

interface PasienDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pasien: Pasien | null;
  onEdit: (pasien: Pasien) => void;
}

export function PasienDetailDialog({
  open,
  onOpenChange,
  pasien,
  onEdit,
}: PasienDetailDialogProps) {
  if (!pasien) return null;

  const age = pasien.tanggal_lahir ? calculateAge(pasien.tanggal_lahir) : (pasien.umur ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <User className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base">{pasien.nama}</DialogTitle>
              <DialogDescription className="font-mono text-xs">
                {pasien.id} &bull; Dibuat pada {pasien.created_at}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Profile Overview */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/20 p-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block mb-0.5">Umur Pasien:</span>
              <span className="font-semibold text-foreground text-sm">{age} Tahun</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Tanggal Lahir:</span>
              <span className="font-medium text-foreground flex items-center gap-1 font-mono">
                <Calendar className="size-3 text-muted-foreground" />
                {pasien.tanggal_lahir || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Jenis Kelamin:</span>
              <Badge
                variant={pasien.jenis_kelamin === "Perempuan" ? "secondary" : "outline"}
                className="text-xs font-normal"
              >
                {pasien.jenis_kelamin}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Jumlah Atribut:</span>
              <span className="font-medium text-foreground">{pasien.atribut?.length || 0} parameter</span>
            </div>
          </div>

          {/* Latar Belakang */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" /> Latar Belakang & Riwayat Medis
            </span>
            <div className="rounded-xl border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
              {pasien.latar_belakang || "Tidak ada informasi latar belakang."}
            </div>
          </div>

          {/* Atribut Dinamis */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="size-3.5 text-primary" /> Atribut & Karakteristik Pasien
            </span>

            {!pasien.atribut || pasien.atribut.length === 0 ? (
              <div className="rounded-xl border border-dashed py-4 text-center text-xs text-muted-foreground">
                Belum ada atribut dinamis yang tercatat.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {pasien.atribut.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex flex-col rounded-xl border bg-card p-2.5 shadow-2xs"
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {attr.key}
                    </span>
                    <span className="text-xs font-medium text-foreground mt-0.5">
                      {attr.value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onEdit(pasien);
            }}
          >
            Ubah Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
