import { Clock, FileText, Mail, Tag } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StaseHeaderData } from "../../../-components/data";

interface StaseHeaderFormProps {
  header: StaseHeaderData;
  onChange: (updatedHeader: StaseHeaderData) => void;
  staseNumber: number;
}

export function StaseHeaderForm({
  header,
  onChange,
  staseNumber,
}: StaseHeaderFormProps) {
  const handleFieldChange = (field: keyof StaseHeaderData, value: string | number) => {
    onChange({
      ...header,
      [field]: value,
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
      <div className="flex items-center justify-between border-b pb-2.5">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Tag className="size-3.5 text-primary" /> Pengaturan Wajib Stase {staseNumber}
        </span>
        <span className="text-[11px] font-mono text-muted-foreground">
          {header.kode_amplop || `AMP-0${staseNumber}`}
        </span>
      </div>

      {/* Row 1: Nama Stase (50%), Kode Amplop (25%), Durasi (25%) in one aligned row */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
        {/* Nama Stase (50% Width) */}
        <div className="grid gap-1.5 md:col-span-6">
          <Label htmlFor={`stase-${staseNumber}-nama`} className="text-xs font-medium">
            Nama Stase Ujian <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`stase-${staseNumber}-nama`}
            value={header.nama_stase}
            onChange={(e) => handleFieldChange("nama_stase", e.target.value)}
            placeholder="Contoh: Anamnesis (Wawancara Klinis)"
            className="h-8 text-xs font-medium"
          />
        </div>

        {/* Kode Amplop (25% Width) */}
        <div className="grid gap-1.5 md:col-span-3">
          <Label htmlFor={`stase-${staseNumber}-amplop`} className="text-xs font-medium flex items-center gap-1">
            <Mail className="size-3 text-muted-foreground" /> Kode Amplop <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`stase-${staseNumber}-amplop`}
            value={header.kode_amplop}
            onChange={(e) => handleFieldChange("kode_amplop", e.target.value)}
            placeholder="Contoh: AMP-01"
            className="h-8 text-xs font-mono"
          />
        </div>

        {/* Durasi Pengerjaan (25% Width) */}
        <div className="grid gap-1.5 md:col-span-3">
          <Label htmlFor={`stase-${staseNumber}-durasi`} className="text-xs font-medium flex items-center gap-1">
            <Clock className="size-3 text-muted-foreground" /> Durasi (Menit) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`stase-${staseNumber}-durasi`}
            type="number"
            min={1}
            max={120}
            value={header.durasi_menit}
            onChange={(e) => handleFieldChange("durasi_menit", Number(e.target.value) || 1)}
            className="h-8 text-xs font-medium"
          />
        </div>

        {/* Row 2: Petunjuk Soal (Full Width) */}
        <div className="grid gap-1.5 md:col-span-12">
          <Label htmlFor={`stase-${staseNumber}-petunjuk`} className="text-xs font-medium flex items-center gap-1">
            <FileText className="size-3 text-muted-foreground" /> Petunjuk & Skenario Soal untuk Peserta / Penguji
          </Label>
          <Textarea
            id={`stase-${staseNumber}-petunjuk`}
            rows={3}
            value={header.petunjuk_soal}
            onChange={(e) => handleFieldChange("petunjuk_soal", e.target.value)}
            placeholder="Tuliskan instruksi langkah klinis, batasan tugas, dan petunjuk teknis pelaksanaan stase ini..."
            className="text-xs leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
