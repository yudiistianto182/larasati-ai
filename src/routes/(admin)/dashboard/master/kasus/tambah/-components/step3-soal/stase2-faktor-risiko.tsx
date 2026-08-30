import { Activity, Plus, Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AiKeywordTrigger, FaktorRisikoItem } from "../../../-components/data";

interface Stase2FaktorRisikoProps {
  faktorRisiko: FaktorRisikoItem[];
  onChange: (items: FaktorRisikoItem[]) => void;
  stase1Triggers: AiKeywordTrigger[];
}

const QUICK_FAKTOR_SUGGESTIONS = [
  "Usia Hubungan Seksual Pertama Kali < 20 Tahun",
  "Riwayat Perdarahan Kontak (Post-Coital Bleeding)",
  "Paritas Tinggi (Melahirkan Lebih dari 3 Kali)",
  "Riwayat Berganti Pasangan Seksual",
  "Riwayat Merokok Aktif / Pasif",
  "Penggunaan Kontrasepsi Hormonal Jangka Panjang",
];

export function Stase2FaktorRisiko({
  faktorRisiko,
  onChange,
  stase1Triggers,
}: Stase2FaktorRisikoProps) {
  const handleAddItem = (suggestedName?: string) => {
    const newItem: FaktorRisikoItem = {
      id: `fkr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nama_jawaban: suggestedName || "",
      syarat_id: "tanpa_syarat",
      skor: 10,
    };
    onChange([...faktorRisiko, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onChange(faktorRisiko.filter((f) => f.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof FaktorRisikoItem,
    val: string | number,
  ) => {
    onChange(
      faktorRisiko.map((f) => (f.id === id ? { ...f, [field]: val } : f)),
    );
  };

  const totalScore = faktorRisiko.reduce((acc, f) => acc + (Number(f.skor) || 0), 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-2xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
            <Activity className="size-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Pos 2: Multi Select Jawaban (Faktor Risiko Klinis)
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Tentukan faktor risiko klinis yang harus diidentifikasi peserta. Pilihan syarat terhubung langsung dengan temuan di Stase 1.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="h-6 bg-background text-xs font-semibold text-amber-600 dark:text-amber-400 self-start sm:self-auto">
          Total Skor: {totalScore} Poin
        </Badge>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="size-3 text-amber-500" /> Saran faktor risiko:
        </span>
        {QUICK_FAKTOR_SUGGESTIONS.map((sug) => (
          <Badge
            key={sug}
            variant="outline"
            className="cursor-pointer bg-background hover:bg-accent text-[11px] font-normal transition-colors"
            onClick={() => handleAddItem(sug)}
          >
            + {sug}
          </Badge>
        ))}
      </div>

      {/* Faktor Items List */}
      <div className="flex flex-col gap-2.5 pt-1">
        <div className="hidden grid-cols-[2fr_1.8fr_90px_auto] items-center gap-2 px-1 text-[11px] font-semibold text-muted-foreground sm:grid">
          <span>Nama Jawaban / Temuan Faktor Risiko</span>
          <span>Syarat Terkait (Trigger dari Stase 1)</span>
          <span className="text-center">Skor</span>
          <span className="w-8" />
        </div>

        {faktorRisiko.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-background/50 py-6 text-center text-xs text-muted-foreground">
            Belum ada faktor risiko. Klik tombol di bawah untuk menambahkan item evaluasi.
          </div>
        ) : (
          faktorRisiko.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-card p-2.5 shadow-2xs sm:grid-cols-[2fr_1.8fr_90px_auto] sm:items-center"
            >
              <Input
                placeholder="e.g. Usia Hubungan Seksual Pertama < 20 Tahun"
                value={item.nama_jawaban}
                onChange={(e) => handleItemChange(item.id, "nama_jawaban", e.target.value)}
                className="h-8 text-xs font-medium"
              />

              {/* Syarat Select Dropdown */}
              <Select
                value={item.syarat_id}
                onValueChange={(val) => handleItemChange(item.id, "syarat_id", val)}
              >
                <SelectTrigger size="sm" className="h-8 w-full text-xs">
                  <SelectValue placeholder="Pilih Syarat" />
                </SelectTrigger>
                <SelectContent side="bottom" className="max-h-56">
                  <SelectGroup>
                    <SelectItem value="tanpa_syarat" className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Tanpa Syarat (Default)
                    </SelectItem>
                    {stase1Triggers.map((trg) => (
                      <SelectItem key={trg.id} value={trg.id} className="text-xs">
                        {trg.konteks || `Trigger ${trg.id}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Input
                type="number"
                min={0}
                max={100}
                placeholder="Skor"
                value={item.skor}
                onChange={(e) => handleItemChange(item.id, "skor", Number(e.target.value) || 0)}
                className="h-8 text-center text-xs font-bold"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-self-end sm:justify-self-auto"
                onClick={() => handleRemoveItem(item.id)}
                title="Hapus faktor risiko"
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
          className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-amber-500/40 bg-background text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-amber-500 hover:bg-amber-500/5 hover:text-amber-600 active:scale-[0.99]"
          onClick={() => handleAddItem()}
        >
          <Plus className="size-4 text-amber-500" />
          <span>Tambah Faktor Risiko</span>
        </Button>
      </div>
    </div>
  );
}
