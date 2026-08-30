import * as React from "react";
import {
  Check,
  CheckCircle2,
  Edit2,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  InterpretasiImageItem,
  InterpretasiOption,
} from "../../../-components/data";

interface Stase4InterpretasiProps {
  images: Array<string | InterpretasiImageItem>;
  onImagesChange: (images: Array<string | InterpretasiImageItem>) => void;
  pilihanJawaban: InterpretasiOption[];
  onPilihanJawabanChange: (options: InterpretasiOption[]) => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function Stase4Interpretasi({
  images,
  onImagesChange,
  pilihanJawaban,
  onPilihanJawabanChange,
}: Stase4InterpretasiProps) {
  // Normalize images to InterpretasiImageItem structure for rich editing
  const normalizedImages: InterpretasiImageItem[] = React.useMemo(() => {
    return images.map((img, idx) => {
      if (typeof img === "string") {
        return {
          id: `img-${idx + 1}-${img.slice(-8)}`,
          url: img,
          nama: `Foto ${idx + 1}`,
          keterangan: "",
        };
      }
      return img;
    });
  }, [images]);

  const [imageUrlInput, setImageUrlInput] = React.useState("");
  const [imageNameInput, setImageNameInput] = React.useState("");
  const [imageDescInput, setImageDescInput] = React.useState("");

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;

    const newItem: InterpretasiImageItem = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: imageUrlInput.trim(),
      nama: imageNameInput.trim() || `Foto ${images.length + 1}`,
      keterangan: imageDescInput.trim(),
    };

    onImagesChange([...normalizedImages, newItem]);
    setImageUrlInput("");
    setImageNameInput("");
    setImageDescInput("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, fIdx) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          const fileNameClean = file.name.replace(/\.[^/.]+$/, "");
          const newItem: InterpretasiImageItem = {
            id: `img-${Date.now()}-${fIdx}`,
            url: result,
            nama: fileNameClean || `Foto ${normalizedImages.length + fIdx + 1}`,
            keterangan: "",
          };
          onImagesChange([...normalizedImages, newItem]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateImage = (
    index: number,
    field: "nama" | "keterangan" | "url",
    val: string,
  ) => {
    const updated = [...normalizedImages];
    updated[index] = { ...updated[index], [field]: val };
    onImagesChange(updated);
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(normalizedImages.filter((_, idx) => idx !== index));
  };

  const handleAddOption = () => {
    const newOption: InterpretasiOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: "",
      is_correct: pilihanJawaban.length === 0, // first option default correct if empty
      skor: pilihanJawaban.length === 0 ? 25 : 0,
    };
    onPilihanJawabanChange([...pilihanJawaban, newOption]);
  };

  const handleRemoveOption = (id: string) => {
    onPilihanJawabanChange(pilihanJawaban.filter((o) => o.id !== id));
  };

  const handleSetCorrectAnswer = (id: string) => {
    onPilihanJawabanChange(
      pilihanJawaban.map((o) => ({
        ...o,
        is_correct: o.id === id,
        skor: o.id === id ? (o.skor > 0 ? o.skor : 25) : 0,
      })),
    );
  };

  const handleOptionChange = (
    id: string,
    field: "label" | "skor",
    val: string | number,
  ) => {
    onPilihanJawabanChange(
      pilihanJawaban.map((o) => (o.id === id ? { ...o, [field]: val } : o)),
    );
  };

  const correctOption = pilihanJawaban.find((o) => o.is_correct);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-2xs">
      {/* Header Info */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
            <ImageIcon className="size-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Pos 4: Single Choice Image & Interpretasi Klinis
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Upload foto serviks/klinis beserta nama dan keterangannya, buat opsi jawaban, dan tentukan 1 kunci jawaban benar.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "h-6 text-xs font-semibold self-start sm:self-auto",
            correctOption
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
          )}
        >
          {correctOption
            ? `Kunci: Opsi #${pilihanJawaban.indexOf(correctOption) + 1} (${correctOption.skor} Poin)`
            : "Belum Ada Kunci"}
        </Badge>
      </div>

      {/* 1. Multiple Image Upload Section with Nama & Keterangan */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ImageIcon className="size-3.5 text-primary" /> Daftar Foto / Gambar Pemeriksaan ({normalizedImages.length})
          </Label>
          <span className="text-[10px] text-muted-foreground">
            Lengkapi nama dan keterangan pada masing-masing foto
          </span>
        </div>

        {/* Images Cards List */}
        {normalizedImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {normalizedImages.map((imgItem, idx) => (
              <div
                key={imgItem.id || `img-${idx}`}
                className="group relative flex flex-col sm:flex-row gap-3 rounded-xl border border-border/80 bg-muted/20 p-3 shadow-xs transition-all hover:border-emerald-500/40"
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-4/3 w-full sm:w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-black/5">
                  <img
                    src={imgItem.url}
                    alt={imgItem.nama}
                    className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">
                    #{idx + 1}
                  </div>
                </div>

                {/* Name & Description Inputs */}
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Input
                      placeholder="Nama Foto (misal: Serviks Pasca Asam Asetat 3%)"
                      value={imgItem.nama}
                      onChange={(e) => handleUpdateImage(idx, "nama", e.target.value)}
                      className="h-7 text-xs font-semibold"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveImage(idx)}
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      title="Hapus foto"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Keterangan foto (misal: Tampak plak asetowhite tebal pada SSK jam 11-02...)"
                    value={imgItem.keterangan}
                    onChange={(e) => handleUpdateImage(idx, "keterangan", e.target.value)}
                    rows={2}
                    className="text-[11px] min-h-[46px] resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Dropzone & Add via URL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* File Upload Dropzone */}
          <label className="sm:col-span-1 flex min-h-[90px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border/80 bg-muted/10 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all text-center p-3">
            <Upload className="size-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-foreground">Upload Foto Baru</span>
            <span className="text-[10px] text-muted-foreground">PNG/JPG (Bisa multi-file)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Add via URL Form */}
          <form
            onSubmit={handleAddImageUrl}
            className="sm:col-span-2 flex flex-col justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 p-3"
          >
            <span className="text-[11px] font-semibold text-muted-foreground">
              Atau Tambah Foto via URL Eksternal:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="URL Gambar (https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="h-7 text-xs"
              />
              <Input
                placeholder="Nama Foto (opsional)"
                value={imageNameInput}
                onChange={(e) => setImageNameInput(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Keterangan singkat foto (opsional)"
                value={imageDescInput}
                onChange={(e) => setImageDescInput(e.target.value)}
                className="h-7 text-xs flex-1"
              />
              <Button
                type="submit"
                size="xs"
                variant="outline"
                disabled={!imageUrlInput.trim()}
                className="h-7 text-xs gap-1 shrink-0"
              >
                <Plus className="size-3" /> Tambah
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Multiple Choice Options Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs font-bold text-foreground">
              Opsi Pilihan Jawaban ({pilihanJawaban.length} Opsi)
            </Label>
            <p className="text-[10px] text-muted-foreground">
              Pilih satu opsi sebagai kunci jawaban benar dengan mengklik tombol centang radio.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleAddOption}
            className="h-7 gap-1 text-xs font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
          >
            <Plus className="size-3.5" /> Tambah Opsi
          </Button>
        </div>

        {pilihanJawaban.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center text-muted-foreground">
            <p className="text-xs">Belum ada opsi jawaban. Klik tombol di atas untuk menambah.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pilihanJawaban.map((option, idx) => {
              const letter = OPTION_LETTERS[idx] || `${idx + 1}`;
              const isCorrect = option.is_correct;

              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-2.5 transition-all shadow-2xs",
                    isCorrect
                      ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                      : "border-border/80 bg-card hover:bg-muted/30",
                  )}
                >
                  {/* Select as Correct Radio Button */}
                  <button
                    type="button"
                    onClick={() => handleSetCorrectAnswer(option.id)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg border font-bold text-xs shrink-0 transition-all cursor-pointer shadow-xs",
                      isCorrect
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-border bg-muted/40 text-muted-foreground hover:border-emerald-500 hover:text-emerald-600",
                    )}
                    title={isCorrect ? "Kunci Jawaban Benar" : "Jadikan Kunci Jawaban"}
                  >
                    {isCorrect ? <Check className="size-4 stroke-[3]" /> : letter}
                  </button>

                  {/* Option Label Input */}
                  <div className="flex-1">
                    <Input
                      placeholder={`Teks opsi ${letter} (misal: IVA Positif - Lesi Acetowhite SSK)...`}
                      value={option.label}
                      onChange={(e) => handleOptionChange(option.id, "label", e.target.value)}
                      className={cn(
                        "h-8 text-xs",
                        isCorrect && "font-semibold text-emerald-950 dark:text-emerald-200 border-emerald-500/40",
                      )}
                    />
                  </div>

                  {/* Score Input (Active for Correct Option) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Label className="text-[11px] text-muted-foreground">Skor:</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={option.skor}
                      onChange={(e) =>
                        handleOptionChange(option.id, "skor", Number(e.target.value) || 0)
                      }
                      className="h-8 w-16 text-xs text-center font-bold"
                    />
                  </div>

                  {/* Delete Option Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemoveOption(option.id)}
                    className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    title="Hapus opsi"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
