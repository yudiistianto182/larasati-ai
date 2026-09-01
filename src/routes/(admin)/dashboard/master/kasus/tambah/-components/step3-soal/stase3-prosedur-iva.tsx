import * as React from "react";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { arrayMove } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  GripVertical,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProsedurStepItem } from "../../../-components/data";

interface Stase3ProsedurIvaProps {
  langkahProsedur: ProsedurStepItem[];
  onChange: (items: ProsedurStepItem[]) => void;
}

const QUICK_PROSEDUR_SUGGESTIONS = [
  "Informed consent dan posisikan pasien pada meja ginekologi (posisi litotomi)",
  "Pasang spekulum cocor bebek (Cusco) hingga porsio terlihat jelas",
  "Bersihkan porsio dan cairan serviks dengan kapas lidi DTT",
  "Oleskan larutan asam asetat 3-5% secara merata ke seluruh SSK serviks",
  "Tunggu 1 menit dan amati timbulnya plak epitel asetowhite",
  "Lepaskan spekulum perlahan dan rendam alat dalam larutan klorin 0.5%",
];

export function Stase3ProsedurIva({
  langkahProsedur,
  onChange,
}: Stase3ProsedurIvaProps) {
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  const handleAddStep = (suggestedText?: string) => {
    const newOrder = langkahProsedur.length + 1;
    const newStep: ProsedurStepItem = {
      id: `prc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nama_langkah: suggestedText || "",
      skor: 10,
      order: newOrder,
    };
    onChange([...langkahProsedur, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    const updated = langkahProsedur
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, order: idx + 1 }));
    onChange(updated);
  };

  const handleStepChange = (
    id: string,
    field: keyof ProsedurStepItem,
    val: string | number,
  ) => {
    onChange(
      langkahProsedur.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= langkahProsedur.length) return;
    const reordered = arrayMove(langkahProsedur, index, targetIndex).map(
      (s, idx) => ({ ...s, order: idx + 1 }),
    );
    onChange(reordered);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { source } = event.operation;
    if (event.canceled || !isSortable(source) || source.initialIndex === source.index) {
      return;
    }
    const reordered = arrayMove(langkahProsedur, source.initialIndex, source.index).map(
      (s, idx) => ({ ...s, order: idx + 1 }),
    );
    onChange(reordered);
  };

  const totalScore = langkahProsedur.reduce((acc, s) => acc + (Number(s.skor) || 0), 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 shadow-2xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-purple-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500 text-white shadow-xs">
            <ClipboardList className="size-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Pos 3: Mengurutkan Langkah (Prosedur IVA)
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Susun tahapan prosedur klinis. Anda dapat mengubah urutan langkah secara bebas dan memilih tata letak List atau Grid.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle Button Group */}
          <div className="flex items-center rounded-lg border border-border/80 bg-background p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all",
                viewMode === "list"
                  ? "bg-muted text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Tampilan List"
            >
              <List className="size-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all",
                viewMode === "grid"
                  ? "bg-muted text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Tampilan Grid Card (Max 3 Kolom)"
            >
              <LayoutGrid className="size-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <Badge variant="outline" className="h-7 bg-background text-xs font-semibold text-purple-600 dark:text-purple-400">
            Total: {totalScore} Poin
          </Badge>
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="size-3 text-purple-500" /> Saran SOP IVA:
        </span>
        {QUICK_PROSEDUR_SUGGESTIONS.map((sug, idx) => (
          <Badge
            key={sug}
            variant="outline"
            className="cursor-pointer bg-background hover:bg-accent text-[11px] font-normal transition-colors"
            onClick={() => handleAddStep(sug)}
          >
            + Langkah {idx + 1}
          </Badge>
        ))}
      </div>

      {/* Reorderable Steps Container */}
      <div className="flex flex-col gap-2 pt-1">
        {langkahProsedur.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-background/50 py-8 text-center text-xs text-muted-foreground">
            Belum ada langkah prosedur. Tambahkan langkah melalui tombol di bawah.
          </div>
        ) : (
          <DragDropProvider onDragEnd={handleDragEnd}>
            {viewMode === "list" ? (
              // LIST VIEW
              <div className="flex flex-col gap-2">
                <div className="hidden grid-cols-[36px_50px_1fr_90px_60px_36px] items-center gap-2 px-1 text-[11px] font-semibold text-muted-foreground sm:grid">
                  <span className="text-center">Grip</span>
                  <span>Urutan</span>
                  <span>Nama Langkah / Instruksi Prosedur</span>
                  <span className="text-center">Skor</span>
                  <span className="text-center">Geser</span>
                  <span className="w-8" />
                </div>

                {langkahProsedur.map((step, index) => (
                  <SortableStepListRow
                    key={step.id}
                    step={step}
                    index={index}
                    totalCount={langkahProsedur.length}
                    onChange={(field, val) => handleStepChange(step.id, field, val)}
                    onRemove={() => handleRemoveStep(step.id)}
                    onMove={(dir) => handleMove(index, dir)}
                  />
                ))}
              </div>
            ) : (
              // GRID VIEW (Max 3 Columns)
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {langkahProsedur.map((step, index) => (
                  <SortableStepGridCard
                    key={step.id}
                    step={step}
                    index={index}
                    totalCount={langkahProsedur.length}
                    onChange={(field, val) => handleStepChange(step.id, field, val)}
                    onRemove={() => handleRemoveStep(step.id)}
                    onMove={(dir) => handleMove(index, dir)}
                  />
                ))}
              </div>
            )}
          </DragDropProvider>
        )}

        {/* Full-width Rectangular Add Button */}
        <Button
          type="button"
          variant="outline"
          className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-purple-500/40 bg-background text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-purple-500 hover:bg-purple-500/5 hover:text-purple-600 active:scale-[0.99]"
          onClick={() => handleAddStep()}
        >
          <Plus className="size-4 text-purple-500" />
          <span>Tambah Langkah Prosedur</span>
        </Button>
      </div>
    </div>
  );
}

// 1. Sortable Row Component for List View
function SortableStepListRow({
  step,
  index,
  totalCount,
  onChange,
  onRemove,
  onMove,
}: {
  step: ProsedurStepItem;
  index: number;
  totalCount: number;
  onChange: (field: keyof ProsedurStepItem, val: string | number) => void;
  onRemove: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const { handleRef, isDragging, ref } = useSortable({
    id: step.id,
    index,
    type: "prosedur-step",
    accept: "prosedur-step",
    group: "prosedur-steps",
    modifiers: [RestrictToVerticalAxis],
  });

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-card p-2.5 shadow-2xs transition-all sm:grid-cols-[36px_50px_1fr_90px_60px_36px] sm:items-center",
        isDragging && "relative z-20 opacity-50 shadow-md ring-2 ring-purple-500",
      )}
    >
      {/* Drag Grip Handle */}
      <button
        ref={handleRef}
        type="button"
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-grab active:cursor-grabbing justify-self-start sm:justify-self-center"
        title="Geser urutan langkah"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Step Order Badge */}
      <Badge
        variant="secondary"
        className="h-6 w-9 justify-center text-xs font-mono font-bold"
      >
        #{index + 1}
      </Badge>

      {/* Nama Langkah Input */}
      <Input
        placeholder={`Deskripsi langkah ke-${index + 1}`}
        value={step.nama_langkah}
        onChange={(e) => onChange("nama_langkah", e.target.value)}
        className="h-8 text-xs font-medium"
      />

      {/* Skor Input */}
      <Input
        type="number"
        min={0}
        max={100}
        placeholder="Skor"
        value={step.skor}
        onChange={(e) => onChange("skor", Number(e.target.value) || 0)}
        className="h-8 text-center text-xs font-bold"
      />

      {/* Up / Down button controls */}
      <div className="flex items-center justify-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-6 text-muted-foreground disabled:opacity-30"
          disabled={index === 0}
          onClick={() => onMove("up")}
          title="Pindah ke atas"
        >
          <ArrowUp className="size-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-6 text-muted-foreground disabled:opacity-30"
          disabled={index === totalCount - 1}
          onClick={() => onMove("down")}
          title="Pindah ke bawah"
        >
          <ArrowDown className="size-3" />
        </Button>
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-self-end sm:justify-self-auto"
        onClick={onRemove}
        title="Hapus langkah"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

// 2. Sortable Card Component for Grid View (Max 3 Columns)
function SortableStepGridCard({
  step,
  index,
  totalCount,
  onChange,
  onRemove,
  onMove,
}: {
  step: ProsedurStepItem;
  index: number;
  totalCount: number;
  onChange: (field: keyof ProsedurStepItem, val: string | number) => void;
  onRemove: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const { handleRef, isDragging, ref } = useSortable({
    id: step.id,
    index,
    type: "prosedur-step",
    accept: "prosedur-step",
    group: "prosedur-steps",
  });

  return (
    <div
      ref={ref}
      className={cn(
        "group flex flex-col justify-between gap-2.5 rounded-xl border border-border/70 bg-card p-3 shadow-2xs transition-all hover:border-purple-500/40 hover:shadow-xs",
        isDragging && "relative z-20 opacity-50 shadow-md ring-2 ring-purple-500 scale-102",
      )}
    >
      {/* Card Header: Grip, Order Badge, Move & Delete Controls */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            ref={handleRef}
            type="button"
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground cursor-grab active:cursor-grabbing"
            title="Geser urutan kartu"
          >
            <GripVertical className="size-3.5" />
          </button>
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[11px] font-mono font-bold"
          >
            Langkah #{index + 1}
          </Badge>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 text-muted-foreground disabled:opacity-30"
            disabled={index === 0}
            onClick={() => onMove("up")}
            title="Pindah sebelum"
          >
            <ArrowUp className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 text-muted-foreground disabled:opacity-30"
            disabled={index === totalCount - 1}
            onClick={() => onMove("down")}
            title="Pindah setelah"
          >
            <ArrowDown className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-0.5"
            onClick={onRemove}
            title="Hapus langkah"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Card Body: Textarea for Step Description */}
      <div className="flex flex-col gap-1">
        <Textarea
          rows={3}
          placeholder={`Deskripsi instruksi tindakan langkah ke-${index + 1}...`}
          value={step.nama_langkah}
          onChange={(e) => onChange("nama_langkah", e.target.value)}
          className="text-xs leading-relaxed resize-none"
        />
      </div>

      {/* Card Footer: Skor Control */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
        <span className="text-[11px] text-muted-foreground font-medium">Bobot Skor:</span>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            max={100}
            value={step.skor}
            onChange={(e) => onChange("skor", Number(e.target.value) || 0)}
            className="h-7 w-16 text-center text-xs font-bold"
          />
          <span className="text-[11px] text-muted-foreground">Poin</span>
        </div>
      </div>
    </div>
  );
}
