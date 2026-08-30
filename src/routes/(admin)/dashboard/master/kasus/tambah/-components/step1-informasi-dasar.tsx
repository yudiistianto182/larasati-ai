import { Plus, Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { KasusAttribute } from "../../-components/data";

interface Step1InformasiDasarProps {
  nama: string;
  onNamaChange: (value: string) => void;
  deskripsi: string;
  onDeskripsiChange: (value: string) => void;
  teksPerkenalan: string;
  onTeksPerkenalanChange: (value: string) => void;
  atribut: KasusAttribute[];
  onAtributChange: (atribut: KasusAttribute[]) => void;
}

const QUICK_KASUS_SUGGESTIONS = [
  "Diagnosis Utama",
  "Keluhan Utama",
  "Tingkat Kegawatan",
  "Riwayat Penyakit",
  "Tekanan Darah",
  "Golongan Darah",
  "Tindakan Medis",
  "Obat / Terapi",
];

export function Step1InformasiDasar({
  nama,
  onNamaChange,
  deskripsi,
  onDeskripsiChange,
  teksPerkenalan,
  onTeksPerkenalanChange,
  atribut,
  onAtributChange,
}: Step1InformasiDasarProps) {
  const handleAddAttribute = (suggestedKey?: string) => {
    const newAttr: KasusAttribute = {
      id: `k-attr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      key: suggestedKey || "",
      value: "",
    };
    onAtributChange([...atribut, newAttr]);
  };

  const handleRemoveAttribute = (id: string) => {
    onAtributChange(atribut.filter((a) => a.id !== id));
  };

  const handleAttributeChange = (id: string, field: "key" | "value", val: string) => {
    onAtributChange(
      atribut.map((a) => (a.id === id ? { ...a, [field]: val } : a)),
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 border-b pb-3">
        <h3 className="text-base font-semibold text-foreground">
          Step 1: Informasi Dasar & Atribut Kasus
        </h3>
        <p className="text-xs text-muted-foreground">
          Masukkan judul skenario kasus, deskripsi tujuan, narasi pengantar, serta parameter dinamis kasus.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Nama Kasus */}
        <div className="grid gap-1.5">
          <Label htmlFor="kasus-nama" className="text-xs font-semibold">
            Nama Kasus <span className="text-destructive">*</span>
          </Label>
          <Input
            id="kasus-nama"
            placeholder="Contoh: Penanganan Persalinan Normal Primigravida Kala I Fase Aktif"
            value={nama}
            onChange={(e) => onNamaChange(e.target.value)}
            className="h-9 text-sm"
            required
            autoFocus
          />
        </div>

        {/* Deskripsi Kasus */}
        <div className="grid gap-1.5">
          <Label htmlFor="kasus-deskripsi" className="text-xs font-semibold">
            Deskripsi Kasus
          </Label>
          <Textarea
            id="kasus-deskripsi"
            rows={2}
            placeholder="Tuliskan gambaran ringkas dan tujuan pembelajaran dari kasus ini..."
            value={deskripsi}
            onChange={(e) => onDeskripsiChange(e.target.value)}
            className="text-xs leading-relaxed"
          />
        </div>

        {/* Teks Perkenalan / Skenario Awal */}
        <div className="grid gap-1.5">
          <Label htmlFor="kasus-perkenalan" className="text-xs font-semibold">
            Teks Perkenalan / Skenario Pengantar Kasus
          </Label>
          <Textarea
            id="kasus-perkenalan"
            rows={4}
            placeholder="Tuliskan narasi situasi klinis saat peserta pertama kali menghadapi kasus (misal: kondisi saat pasien datang ke PMB / Puskesmas)..."
            value={teksPerkenalan}
            onChange={(e) => onTeksPerkenalanChange(e.target.value)}
            className="text-xs leading-relaxed"
          />
        </div>

        {/* Dynamic Attributes Section */}
        <div className="mt-1 flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-4">
          <div>
            <Label className="text-sm font-semibold text-foreground">
              Atribut Dinamis Kasus
            </Label>
            <p className="text-xs text-muted-foreground">
              Tambahkan parameter diagnosis, kriteria klinis, atau catatan khusus kasus secara dinamis (key-value).
            </p>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="size-3 text-primary" /> Saran cepat:
            </span>
            {QUICK_KASUS_SUGGESTIONS.map((suggestion) => (
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

          {/* Attribute Inputs List */}
          <div className="flex flex-col gap-2.5 pt-1">
            {atribut.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 py-4 text-center text-xs text-muted-foreground">
                Belum ada atribut dinamis. Tambahkan atribut melalui tombol di bawah atau gunakan saran cepat di atas.
              </div>
            ) : (
              atribut.map((attr, index) => (
                <div
                  key={attr.id}
                  className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
                >
                  <Input
                    placeholder="Nama Atribut (e.g. Diagnosis Utama)"
                    value={attr.key}
                    onChange={(e) => handleAttributeChange(attr.id, "key", e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Nilai (e.g. Inpartu Kala I)"
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

            {/* Full-width Rectangular Add Button */}
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
      </div>
    </div>
  );
}
