import * as React from "react";
import { Calendar, FileText, Trophy } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/date-range-picker";
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
import { fallbackContestPeriodes } from "../../-components/data";

interface Step1InfoLombaProps {
  nama: string;
  onNamaChange: (val: string) => void;
  periodeId: number;
  onPeriodeIdChange: (val: number) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (val: DateRange | undefined) => void;
  deskripsi: string;
  onDeskripsiChange: (val: string) => void;
}

export function Step1InfoLomba({
  nama,
  onNamaChange,
  periodeId,
  onPeriodeIdChange,
  dateRange,
  onDateRangeChange,
  deskripsi,
  onDeskripsiChange,
}: Step1InfoLombaProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center gap-2.5 border-b pb-3.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Trophy className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Informasi Dasar Agenda Lomba</h3>
          <p className="text-xs text-muted-foreground">
            Lengkapi nama agenda lomba, periode akademik, jadwal pelaksanaan, dan petunjuk umum.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Row 1: Nama Lomba (Full width) */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lomba-nama" className="text-xs font-semibold text-foreground">
            Nama Agenda Lomba <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lomba-nama"
            placeholder="Contoh: Midwife OSCE Circuit Challenge 2026..."
            value={nama}
            onChange={(e) => onNamaChange(e.target.value)}
            className="h-8 text-xs font-semibold"
          />
        </div>

        {/* Row 2: Balanced 2-Column Grid (Periode 50% & Tanggal 50%) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Periode Akademik */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lomba-periode" className="text-xs font-semibold text-foreground">
              Periode Akademik <span className="text-destructive">*</span>
            </Label>
            <Select
              value={String(periodeId)}
              onValueChange={(val) => onPeriodeIdChange(Number(val) || 1)}
            >
              <SelectTrigger id="lomba-periode" className="h-8 w-full text-xs font-medium bg-background">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectGroup>
                  {fallbackContestPeriodes.map((p) => (
                    <SelectItem key={p.periode_id} value={String(p.periode_id)}>
                      {p.periode_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Jadwal Pelaksanaan (DateRangePicker) */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" /> Jadwal Pelaksanaan (Rentang Tanggal) <span className="text-destructive">*</span>
            </Label>
            <div className="w-full">
              <DateRangePicker
                date={dateRange}
                onDateChange={onDateRangeChange}
                placeholder="Pilih rentang tanggal pelaksanaan..."
                className="w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Deskripsi Lomba (Full width) */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lomba-deskripsi" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="size-3.5 text-muted-foreground" /> Deskripsi & Petunjuk Teknis Lomba
          </Label>
          <Textarea
            id="lomba-deskripsi"
            rows={4}
            placeholder="Tuliskan petunjuk umum, latar belakang sirkuit kompetisi, atau kriteria khusus bagi peserta..."
            value={deskripsi}
            onChange={(e) => onDeskripsiChange(e.target.value)}
            className="text-xs leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
