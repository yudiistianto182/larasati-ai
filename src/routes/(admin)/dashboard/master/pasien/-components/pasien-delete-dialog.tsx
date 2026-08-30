import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { Pasien } from "./data";

interface PasienDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pasien: Pasien | null;
  onConfirm: () => void;
}

export function PasienDeleteDialog({
  open,
  onOpenChange,
  pasien,
  onConfirm,
}: PasienDeleteDialogProps) {
  if (!pasien) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Data Pasien</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus data pasien <strong>{pasien.nama}</strong> ({pasien.id})? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Hapus Pasien
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
