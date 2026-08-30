import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Pasien } from "./data";

interface PasienDeleteDialogProps {
  pasien: Pasien | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function PasienDeleteDialog({ pasien, onOpenChange, onConfirm }: PasienDeleteDialogProps) {
  return (
    <Dialog open={pasien !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Data Pasien</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus data pasien <strong>{pasien?.nama}</strong> (ID: {pasien?.id})?
            Tindakan ini akan menghapus seluruh profil serta atribut pasien terkait dan tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Ya, Hapus Pasien
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
