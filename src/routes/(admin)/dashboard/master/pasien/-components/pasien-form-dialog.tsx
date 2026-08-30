import * as React from "react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown, Plus, Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { calculateAge, type Pasien, type PatientAttribute } from "./data";

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
  const [tanggalLahir, setTanggalLahir] = React.useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [jenisKelamin, setJenisKelamin] = React.useState<"Perempuan" | "Laki-laki">("Perempuan");
  const [latarBelakang, setLatarBelakang] = React.useState("");
  const [atribut, setAtribut] = React.useState<PatientAttribute[]>([]);

  // Sync form when initialData or open state changes
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setNama(initialData.nama);
        setTanggalLahir(initialData.tanggal_lahir || (initialData.umur ? `${new Date().getFullYear() - initialData.umur}-01-01` : ""));
        setJenisKelamin(initialData.jenis_kelamin);
        setLatarBelakang(initialData.latar_belakang);
        setAtribut(initialData.atribut.map((a) => ({ ...a })));
      } else {
        setNama("");
        setTanggalLahir("");
        setJenisKelamin("Perempuan");
        setLatarBelakang("");
        setAtribut([
          { id: `attr-${Date.now()}-1`, key: "Golongan Darah", value: "" },
          { id: `attr-${Date.now()}-2`, key: "Tekanan Darah", value: "" },
        ]);
      }
    }
  }, [open, initialData]);

  const parsedDate = React.useMemo(() => {
    if (!tanggalLahir) return undefined;
    const d = parseISO(tanggalLahir);
    return isNaN(d.getTime()) ? undefined : d;
  }, [tanggalLahir]);

  const calculatedAge = React.useMemo(() => {
    return calculateAge(tanggalLahir);
  }, [tanggalLahir]);

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
    if (!nama.trim() || !tanggalLahir) return;

    // Filter out attributes with empty key and value
    const cleanAtribut = atribut
      .map((a) => ({ ...a, key: a.key.trim(), value: a.value.trim() }))
      .filter((a) => a.key.length > 0 || a.value.length > 0);

    onSubmit({
      nama: nama.trim(),
      tanggal_lahir: tanggalLahir,
      umur: calculatedAge,
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
              : "Pilih tanggal lahir dengan kalender interaktif dan lengkapi atribut dinamis profil pasien."}
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

            {/* Rich DatePicker using Popover & Calendar component */}
            <div className="grid gap-1.5">
              <Label htmlFor="pasien-tgl-lahir-btn" className="flex items-center justify-between">
                <span>
                  Tanggal Lahir <span className="text-destructive">*</span>
                </span>
                {tanggalLahir && (
                  <Badge variant="secondary" className="text-[10px] font-semibold text-primary px-1.5 py-0">
                    {calculatedAge} Tahun
                  </Badge>
                )}
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id="pasien-tgl-lahir-btn"
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal text-xs bg-background h-9",
                        !tanggalLahir && "text-muted-foreground",
                      )}
                    />
                  }
                >
                  <span className="flex items-center gap-2 truncate">
                    <CalendarIcon className="size-3.5 text-primary shrink-0" />
                    {parsedDate ? (
                      format(parsedDate, "dd MMMM yyyy", { locale: idLocale })
                    ) : (
                      <span>Pilih Tanggal Lahir</span>
                    )}
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parsedDate}
                    onSelect={(selected) => {
                      if (selected) {
                        setTanggalLahir(format(selected, "yyyy-MM-dd"));
                        setIsCalendarOpen(false);
                      }
                    }}
                    defaultMonth={parsedDate || new Date(2000, 0, 1)}
                    captionLayout="dropdown"
                    disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="pasien-gender">Jenis Kelamin</Label>
              <Select
                value={jenisKelamin}
                onValueChange={(val) => setJenisKelamin(val as "Perempuan" | "Laki-laki")}
              >
                <SelectTrigger id="pasien-gender" className="w-full h-9">
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

            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="pasien-latar">Latar Belakang / Riwayat Medis Singkat</Label>
              <Textarea
                id="pasien-latar"
                placeholder="Contoh: Ibu hamil trimester 3 dengan riwayat kehamilan normal..."
                value={latarBelakang}
                onChange={(e) => setLatarBelakang(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          {/* Dynamic Attributes Section */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">Atribut Dinamis Pasien</span>
                <span className="text-[11px] text-muted-foreground">
                  Tambahkan parameter fleksibel seperti Tekanan Darah, Riwayat Alergi, dsb.
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleAddAttribute()}
                className="h-7 gap-1 text-xs"
              >
                <Plus className="size-3" /> Tambah Atribut
              </Button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-primary" /> Saran cepat:
              </span>
              {QUICK_ATTRIBUTE_SUGGESTIONS.map((sug) => (
                <Badge
                  key={sug}
                  variant="outline"
                  className="cursor-pointer bg-background hover:bg-accent text-[10px] font-normal transition-colors"
                  onClick={() => handleAddAttribute(sug)}
                >
                  + {sug}
                </Badge>
              ))}
            </div>

            {/* Attributes Inputs List */}
            {atribut.length === 0 ? (
              <div className="rounded-lg border border-dashed py-4 text-center text-xs text-muted-foreground">
                Belum ada atribut dinamis. Klik tombol di atas untuk menambahkan.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {atribut.map((attr) => (
                  <div key={attr.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Nama Atribut (Key)"
                      value={attr.key}
                      onChange={(e) => handleAttributeChange(attr.id, "key", e.target.value)}
                      className="h-8 text-xs flex-1 bg-background"
                    />
                    <Input
                      placeholder="Nilai Atribut (Value)"
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(attr.id, "value", e.target.value)}
                      className="h-8 text-xs flex-1 bg-background"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveAttribute(attr.id)}
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                      title="Hapus Atribut"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!nama.trim() || !tanggalLahir}>
              {isEditing ? "Simpan Perubahan" : "Tambah Pasien"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
