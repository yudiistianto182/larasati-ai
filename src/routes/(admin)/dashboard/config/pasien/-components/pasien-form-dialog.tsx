import * as React from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { Pasien, PatientAttribute } from "./data";

interface PasienFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Pasien | null;
  onSubmit: (pasienData: Omit<Pasien, "id" | "created_at">) => void;
}

const QUICK_ATTRIBUTE_SUGGESTIONS = [
  "Golongan Darah",
  "Tekanan Darah",
  "Riwayat Alergi",
  "Kontak Darurat",
  "Berat Badan",
  "Tinggi Badan",
  "Usia Kehamilan",
  "Riwayat Penyakit",
];

export function PasienFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: PasienFormDialogProps) {
  const isEditing = Boolean(initialData);

  const [nama, setNama] = React.useState("");
  const [umur, setUmur] = React.useState<string>("");
  const [jenisKelamin, setJenisKelamin] = React.useState<"Perempuan" | "Laki-laki">("Perempuan");
  const [latarBelakang, setLatarBelakang] = React.useState("");
  const [atribut, setAtribut] = React.useState<PatientAttribute[]>([]);

  // Sync form when initialData or open state changes
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setNama(initialData.nama);
        setUmur(String(initialData.umur));
        setJenisKelamin(initialData.jenis_kelamin);
        setLatarBelakang(initialData.latar_belakang);
        setAtribut(initialData.atribut.map((a) => ({ ...a })));
      } else {
        setNama("");
        setUmur("");
        setJenisKelamin("Perempuan");
        setLatarBelakang("");
        setAtribut([
          { id: `attr-${Date.now()}-1`, key: "Golongan Darah", value: "" },
          { id: `attr-${Date.now()}-2`, key: "Tekanan Darah", value: "" },
        ]);
      }
    }
  }, [open, initialData]);

  const handleAddAttribute = (suggestedKey?: string) => {
    const newAttr: PatientAttribute = {
      id: `attr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      key: suggestedKey || "",
      value: "",
    };
    setAtribut((prev) => [...prev, newAttr]);
  };

  const handleRemoveAttribute = (id: string) => {
    setAtribut((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAttributeChange = (id: string, field: "key" | "value", val: string) => {
    setAtribut((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !umur.trim()) return;

    // Filter out attributes with empty key and value
    const cleanAtribut = atribut
      .map((a) => ({ ...a, key: a.key.trim(), value: a.value.trim() }))
      .filter((a) => a.key.length > 0 || a.value.length > 0);

    onSubmit({
      nama: nama.trim(),
      umur: Number(umur) || 0,
      jenis_kelamin: jenisKelamin,
      latar_belakang: latarBelakang.trim(),
      atribut: cleanAtribut,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Data Pasien" : "Tambah Pasien Baru"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui informasi pasien dan kelola atribut dinamis sesuai kebutuhan."
              : "Masukkan data pasien baru beserta atribut fleksibel (key-value dinamis)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Main Core Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="pasien-nama">
                Nama Pasien <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pasien-nama"
                placeholder="Contoh: Siti Rahmawati"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="pasien-umur">
                Umur (Tahun) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pasien-umur"
                type="number"
                min={0}
                max={150}
                placeholder="Contoh: 28"
                value={umur}
                onChange={(e) => setUmur(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="pasien-gender">Jenis Kelamin</Label>
              <Select
                value={jenisKelamin}
                onValueChange={(val) => setJenisKelamin(val as "Perempuan" | "Laki-laki")}
              >
                <SelectTrigger id="pasien-gender" className="w-full">
                  <SelectValue placeholder="Pilih Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="pasien-latar-belakang">Latar Belakang / Catatan Klinis</Label>
            <Textarea
              id="pasien-latar-belakang"
              rows={3}
              placeholder="Tuliskan riwayat medis singkat, keluhan utama, atau catatan penting pasien..."
              value={latarBelakang}
              onChange={(e) => setLatarBelakang(e.target.value)}
            />
          </div>

          {/* Dynamic Attributes Section */}
          <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/20 p-4">
            <div>
              <Label className="text-sm font-semibold text-foreground">
                Atribut Dinamis Pasien
              </Label>
              <p className="text-xs text-muted-foreground">
                Tambahkan parameter atau catatan khusus berupa key-value bebas.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="size-3" /> Saran cepat:
              </span>
              {QUICK_ATTRIBUTE_SUGGESTIONS.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer bg-background hover:bg-accent text-[11px] font-normal transition-colors"
                  onClick={() => handleAddAttribute(suggestion)}
                >
                  + {suggestion}
                </Badge>
              ))}
            </div>

            {/* Attribute Key-Value Inputs */}
            <div className="flex flex-col gap-2.5 pt-1">
              {atribut.length === 0 ? (
                <div className="rounded border border-dashed border-border/70 py-3 text-center text-xs text-muted-foreground">
                  Belum ada atribut dinamis. Klik tombol di bawah untuk menambahkan.
                </div>
              ) : (
                atribut.map((attr, index) => (
                  <div
                    key={attr.id}
                    className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
                  >
                    <Input
                      placeholder="Nama Atribut (e.g. Golongan Darah)"
                      value={attr.key}
                      onChange={(e) => handleAttributeChange(attr.id, "key", e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Nilai (e.g. O+)"
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(attr.id, "value", e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveAttribute(attr.id)}
                      title={`Hapus baris atribut ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))
              )}

              {/* Full Width Rectangular Add Attribute Button below the list */}
              <Button
                type="button"
                variant="outline"
                className="mt-1.5 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-primary/40 bg-background text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-[0.99]"
                onClick={() => handleAddAttribute()}
              >
                <Plus className="size-4 text-primary" />
                <span>Tambah Atribut</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!nama.trim() || !umur.trim()}>
              {isEditing ? "Simpan Perubahan" : "Tambah Pasien"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
