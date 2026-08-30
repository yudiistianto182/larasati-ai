import { User, Calendar, FileText, Tag, HeartPulse } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

import type { Pasien } from "./data";

interface PasienDetailDialogProps {
  pasien: Pasien | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (pasien: Pasien) => void;
}

export function PasienDetailDialog({
  pasien,
  open,
  onOpenChange,
  onEdit,
}: PasienDetailDialogProps) {
  if (!pasien) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{pasien.nama}</DialogTitle>
              <DialogDescription className="text-xs">ID Pasien: {pasien.id}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 text-sm">
          {/* Quick Demographics Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/20 p-2.5">
              <span className="text-xs text-muted-foreground">Umur</span>
              <p className="font-semibold text-foreground">{pasien.umur} Tahun</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-2.5">
              <span className="text-xs text-muted-foreground">Jenis Kelamin</span>
              <p className="font-semibold text-foreground">
                <Badge
                  variant={pasien.jenis_kelamin === "Perempuan" ? "secondary" : "outline"}
                  className="mt-0.5 text-xs font-normal"
                >
                  {pasien.jenis_kelamin}
                </Badge>
              </p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-2.5 col-span-2 sm:col-span-1">
              <span className="text-xs text-muted-foreground">Terdaftar</span>
              <p className="font-medium text-xs text-foreground mt-0.5 flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" /> {pasien.created_at}
              </p>
            </div>
          </div>

          <Separator />

          {/* Latar Belakang */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <FileText className="size-4 text-primary" />
              <span>Latar Belakang / Catatan Klinis</span>
            </div>
            <p className="rounded-md border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
              {pasien.latar_belakang || "Tidak ada catatan latar belakang tambahan."}
            </p>
          </div>

          <Separator />

          {/* Dynamic Attributes */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Tag className="size-4 text-primary" />
                <span>Atribut Dinamis Pasien ({pasien.atribut.length})</span>
              </div>
            </div>

            {pasien.atribut.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Belum ada atribut dinamis.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {pasien.atribut.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex flex-col rounded-md border border-border/80 bg-muted/10 p-2 text-xs"
                  >
                    <span className="text-muted-foreground font-medium">{attr.key}</span>
                    <span className="text-foreground font-semibold mt-0.5">{attr.value || "-"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:gap-0">
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onEdit(pasien);
              }}
            >
              Ubah Data
            </Button>
          )}
          <Button type="button" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
