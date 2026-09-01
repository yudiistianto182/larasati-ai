import * as React from "react";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { arrayMove } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  Layers,
  ListChecks,
  ListOrdered,
  Plus,
  RotateCcw,
  Sparkles,
  Undo2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import {
  playCtaClickSound,
  playReorderTickSound,
  playTransitionChime,
} from "./lomba-sound-effects";

export interface StepItem {
  id: string;
  text: string;
  correctOrder: number;
}

const MAX_TOTAL_SLOTS = 10;

const FALLBACK_STEPS: StepItem[] = [
  {
    id: "step-1",
    text: "Bidan mencuci tangan 6 langkah dan menggunakan APD lengkap secara aseptik.",
    correctOrder: 1,
  },
  {
    id: "step-2",
    text: "Mempersiapkan alat, lampu sorot, dan memposisikan pasien litotomi dengan nyaman.",
    correctOrder: 2,
  },
  {
    id: "step-3",
    text: "Melakukan vulva hygiene dan membersihkan porsio serviks dari cairan keputihan.",
    correctOrder: 3,
  },
  {
    id: "step-4",
    text: "Memasang spekulum cocor bebek secara perlahan hingga serviks dan SSK terlihat jelas.",
    correctOrder: 4,
  },
  {
    id: "step-5",
    text: "Mengaplikasikan lidi kapas berasam asetat 3–5% secara merata pada seluruh permukaan porsio.",
    correctOrder: 5,
  },
  {
    id: "step-6",
    text: "Mengamati perubahan epitel asetowhite selama 1–2 menit, lalu membersihkan dan melepas spekulum.",
    correctOrder: 6,
  },
  {
    id: "step-d1",
    text: "Mengoleskan larutan asam asetat sebelum memasang spekulum cocor bebek.",
    correctOrder: 99,
  },
  {
    id: "step-d2",
    text: "Melakukan tindakan pemeriksaan langsung tanpa informed consent persetujuan pasien.",
    correctOrder: 99,
  },
];

// ============================================================================
// SORTABLE ITEM IN RIGHT COLUMN (PAPAN URUTAN TERPILIH)
// ============================================================================
interface SortableSelectedStepRowProps {
  item: StepItem;
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

function SortableSelectedStepRow({
  item,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SortableSelectedStepRowProps) {
  const { handleRef, isDragging, ref } = useSortable({
    id: item.id,
    index,
    type: "selected-sop-step",
    accept: "selected-sop-step",
    group: "selected-sop-steps",
    modifiers: [RestrictToVerticalAxis],
  });

  const stepNumber = index + 1;
  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-2.5 rounded-2xl border p-3 sm:p-3.5 shadow-md transition-all select-none",
        isDragging
          ? "relative z-30 opacity-85 border-[#d4af37] bg-[#3a2717] ring-2 ring-[#d4af37] scale-[1.02] shadow-2xl"
          : "border-[#8c6d23]/50 bg-gradient-to-r from-[#261a10] to-[#1c130b] hover:border-[#d4af37]/80 hover:bg-[#2e1f13]",
      )}
    >
      {/* Drag handle & Step Info */}
      <div
        ref={handleRef}
        className="flex items-center gap-3 min-w-0 flex-1 cursor-grab active:cursor-grabbing"
      >
        <div className="flex size-7 items-center justify-center rounded-md text-[#d4af37]/60 hover:text-[#fff8db] hover:bg-[#d4af37]/15 shrink-0">
          <GripVertical className="size-4.5" />
        </div>

        {/* Big Chronological Step Badge */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8c6d23] to-[#d4af37] font-serif font-black text-xs text-[#14100c] shadow-md border border-[#fff8db]/50">
          {String(stepNumber).padStart(2, "0")}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-xs sm:text-sm text-[#fff8db] leading-snug">
            {item.text}
          </span>
          <span className="text-[10px] text-[#d4af37]/75 mt-0.5">
            Langkah Ke-{stepNumber} &bull; Tarik kartu atau gunakan tombol panah untuk mengatur urutan
          </span>
        </div>
      </div>

      {/* Action Controls: Move Up, Move Down, Return to Left Tray */}
      <div
        className="flex items-center gap-1 shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={isFirst}
          onClick={() => {
            playReorderTickSound("up");
            onMoveUp();
          }}
          className="size-7.5 rounded-lg bg-[#291c10] border-[#8c6d23]/50 text-[#f3e5ab] hover:border-[#d4af37] hover:text-[#fff8db] disabled:opacity-25 cursor-pointer"
          title="Geser langkah ke atas"
        >
          <ArrowUp className="size-3.5 text-[#d4af37]" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={isLast}
          onClick={() => {
            playReorderTickSound("down");
            onMoveDown();
          }}
          className="size-7.5 rounded-lg bg-[#291c10] border-[#8c6d23]/50 text-[#f3e5ab] hover:border-[#d4af37] hover:text-[#fff8db] disabled:opacity-25 cursor-pointer"
          title="Geser langkah ke bawah"
        >
          <ArrowDown className="size-3.5 text-[#d4af37]" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => {
            playCtaClickSound();
            onRemove();
          }}
          className="size-7.5 rounded-lg bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-900/60 hover:text-white cursor-pointer ml-1"
          title="Kembalikan kartu ke baki kiri"
        >
          <Undo2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: 2-COLUMN SIDE-BY-SIDE INTERACTION WITH 10 PLACEHOLDERS
// ============================================================================
interface Step4ProsedurIvaSequenceProps {
  steps?: StepItem[];
  onChange?: (steps: StepItem[]) => void;
  kasus?: Kasus;
}

export function Step4ProsedurIvaSequence({
  steps: initialSteps,
  onChange,
  kasus,
}: Step4ProsedurIvaSequenceProps) {
  // Extract steps from active case or fallback
  const allCaseSteps: StepItem[] = React.useMemo(() => {
    const rawSteps = kasus?.stase_data?.stase3?.langkah_prosedur;
    if (rawSteps && rawSteps.length > 0) {
      return rawSteps.map((s) => ({
        id: s.id,
        text: s.nama_langkah,
        correctOrder: s.order,
      }));
    }
    return FALLBACK_STEPS;
  }, [kasus]);

  // Left column: available steps not yet chosen
  const [availableSteps, setAvailableSteps] = React.useState<StepItem[]>([]);
  // Right column: selected steps arranged in order
  const [selectedSteps, setSelectedSteps] = React.useState<StepItem[]>([]);

  // Initialize: if initialSteps provided, populate right and leave remaining in left. Otherwise place all in left tray.
  React.useEffect(() => {
    if (initialSteps && initialSteps.length > 0) {
      const selectedIds = new Set(initialSteps.map((s) => s.id));
      const remaining = allCaseSteps.filter((s) => !selectedIds.has(s.id));
      setSelectedSteps(initialSteps);
      setAvailableSteps(remaining);
    } else {
      // Deterministically shuffle available steps in left tray
      const shuffled = [...allCaseSteps].sort((a, b) => b.id.localeCompare(a.id));
      setAvailableSteps(shuffled);
      setSelectedSteps([]);
    }
  }, [allCaseSteps]);

  // Transfer single step from Left -> Right
  const handleSelectStep = (item: StepItem) => {
    playReorderTickSound("swap");
    const nextAvailable = availableSteps.filter((s) => s.id !== item.id);
    const nextSelected = [...selectedSteps, item];
    setAvailableSteps(nextAvailable);
    setSelectedSteps(nextSelected);
    onChange?.(nextSelected);
  };

  // Transfer single step from Right -> Left
  const handleUnselectStep = (item: StepItem) => {
    playCtaClickSound();
    const nextSelected = selectedSteps.filter((s) => s.id !== item.id);
    const nextAvailable = [...availableSteps, item];
    setSelectedSteps(nextSelected);
    setAvailableSteps(nextAvailable);
    onChange?.(nextSelected);
  };

  // Transfer all remaining steps to Right
  const handleSelectAll = () => {
    playTransitionChime();
    const nextSelected = [...selectedSteps, ...availableSteps];
    setSelectedSteps(nextSelected);
    setAvailableSteps([]);
    onChange?.(nextSelected);
  };

  // Reset all steps back to Left tray
  const handleResetToLeft = () => {
    playCtaClickSound();
    const shuffled = [...allCaseSteps].sort((a, b) => b.id.localeCompare(a.id));
    setAvailableSteps(shuffled);
    setSelectedSteps([]);
    onChange?.([]);
  };

  // Drag and Drop reordering on Right Column
  const handleDragEnd = (event: DragEndEvent) => {
    const { source } = event.operation;
    if (event.canceled || !isSortable(source) || source.initialIndex === source.index) {
      return;
    }
    playReorderTickSound("swap");
    const reordered = arrayMove(selectedSteps, source.initialIndex, source.index);
    setSelectedSteps(reordered);
    onChange?.(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    playReorderTickSound("up");
    const next = arrayMove(selectedSteps, index, index - 1);
    setSelectedSteps(next);
    onChange?.(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= selectedSteps.length - 1) return;
    playReorderTickSound("down");
    const next = arrayMove(selectedSteps, index, index + 1);
    setSelectedSteps(next);
    onChange?.(next);
  };

  // Calculate remaining empty placeholder slots up to 10
  const remainingPlaceholderCount = Math.max(0, MAX_TOTAL_SLOTS - selectedSteps.length);

  return (
    <div className="flex flex-col gap-4 w-full select-none text-[#f3e5ab]">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8c6d23] to-[#d4af37] text-[#14100c] shadow-md font-serif font-black">
            <ListOrdered className="size-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#fff8db] leading-snug">
              Penyusunan & Pengurutan Langkah Prosedur IVA
            </h3>
            <p className="text-xs text-[#d4af37]/80">
              Pilih kartu langkah di sebelah kiri &rarr; Atur urutan kronologis SOP di sebelah kanan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {availableSteps.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 px-3 gap-1.5 text-xs bg-[#24190f] text-[#fde047] border-[#8c6d23]/60 hover:bg-[#342416] hover:text-[#fff8db] cursor-pointer"
              title="Pindahkan semua kartu ke panel kanan"
            >
              <ArrowRight className="size-3.5 text-[#d4af37]" />
              <span>Pilih Semua ke Kanan</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToLeft}
            className="h-8 px-3 gap-1.5 text-xs bg-[#24190f] text-[#f3e5ab] border-[#8c6d23]/50 hover:bg-[#342416] cursor-pointer"
            title="Kembalikan semua langkah ke baki kiri"
          >
            <RotateCcw className="size-3.5 text-[#d4af37]" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* 2-Column Responsive Grid Layout (Left: Available Tray; Right: Ordered 10-Slot Board) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ============================================================ */}
        {/* LEFT COLUMN: BAKI KARTU LANGKAH SOP BELUM TERPILIH (Col 5)   */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col gap-3 rounded-2xl border border-[#8c6d23]/40 bg-[#160f0a]/90 p-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#8c6d23]/30 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-[#d4af37]" />
              <span className="font-serif font-bold text-xs sm:text-sm text-[#fff8db]">
                1. Baki Langkah Prosedur
              </span>
            </div>
            <Badge className="bg-[#2a1c11] text-[#d4af37] border border-[#8c6d23]/60 text-[10px] font-mono">
              {availableSteps.length} Tersedia
            </Badge>
          </div>

          <p className="text-[11px] text-[#e6d59c]/70 leading-relaxed">
            Klik kartu di bawah untuk memindahkannya ke alur urutan prosedur di sebelah kanan:
          </p>

          {/* List of Available Cards */}
          <div className="flex flex-col gap-2.5 min-h-[260px]">
            {availableSteps.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-emerald-500/40 bg-emerald-950/20 gap-2 my-auto">
                <CheckCircle2 className="size-7 text-emerald-400 animate-bounce" />
                <span className="font-serif font-bold text-xs text-emerald-300">
                  Semua Langkah Telah Dipilih
                </span>
                <p className="text-[11px] text-[#e6d59c]/70 max-w-xs">
                  Seluruh kartu telah masuk ke panel kanan. Sekarang silakan atur urutan kronologisnya dengan benar.
                </p>
              </div>
            ) : (
              availableSteps.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectStep(item)}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-[#8c6d23]/40 bg-[#22160d] hover:bg-[#322013] hover:border-[#d4af37] p-3 text-xs text-[#f3e5ab] transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:scale-[1.01] active:scale-99"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#2e1d10] border border-[#8c6d23]/50 text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#14100c] transition-colors mt-0.5">
                      <Plus className="size-3.5" />
                    </div>
                    <span className="text-xs sm:text-[13px] text-[#fff8db] leading-snug font-medium">
                      {item.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-[#d4af37] font-mono text-[10px] font-bold group-hover:text-[#f9f586] transition-colors pl-2">
                    <span className="hidden sm:inline">Pilih</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: PAPAN ALUR URUTAN SOP TERPILIH (10 SLOTS - Col 7) */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col gap-3 rounded-2xl border-2 border-[#d4af37]/60 bg-[#160f09]/95 p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#8c6d23]/40 pb-2.5">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4.5 text-[#d4af37]" />
              <span className="font-serif font-bold text-xs sm:text-sm text-[#fff8db]">
                2. Alur Urutan Prosedur IVA
              </span>
            </div>
            <Badge className="bg-gradient-to-r from-[#8c6d23] to-[#d4af37] text-[#14100c] font-black text-[10px] font-mono px-2 py-0.5 shadow-sm">
              {selectedSteps.length} / {MAX_TOTAL_SLOTS} Slot Terisi
            </Badge>
          </div>

          <p className="text-[11px] text-[#e6d59c]/80 leading-relaxed">
            Susun tahapan prosedur dari langkah <strong>01</strong> (pertama) hingga langkah terakhir menggunakan tombol panah atau geser kartu:
          </p>

          {/* Sortable Drag-Drop Container with 10 slots */}
          <div className="flex flex-col gap-2.5 min-h-[360px]">
            {/* 1. Active Selected & Sortable Steps */}
            {selectedSteps.length > 0 && (
              <DragDropProvider onDragEnd={handleDragEnd}>
                <div className="flex flex-col gap-2.5">
                  {selectedSteps.map((item, index) => (
                    <SortableSelectedStepRow
                      key={item.id}
                      item={item}
                      index={index}
                      totalCount={selectedSteps.length}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      onRemove={() => handleUnselectStep(item)}
                    />
                  ))}
                </div>
              </DragDropProvider>
            )}

            {/* 2. Remaining 10 Placeholder Slots */}
            {Array.from({ length: remainingPlaceholderCount }).map((_, idx) => {
              const slotNumber = selectedSteps.length + idx + 1;
              const isNextTarget = idx === 0;

              return (
                <div
                  key={`placeholder-slot-${slotNumber}`}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 border-dashed p-3 sm:p-3.5 transition-all select-none",
                    isNextTarget
                      ? "border-[#d4af37]/60 bg-[#25190e]/60 text-[#f9f586] shadow-sm animate-pulse"
                      : "border-[#8c6d23]/30 bg-[#170f08]/50 text-[#d4af37]/40",
                  )}
                >
                  <div className="flex size-7 items-center justify-center rounded-md text-[#d4af37]/25 shrink-0">
                    <GripVertical className="size-4 opacity-25" />
                  </div>

                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl font-serif font-black text-xs border",
                      isNextTarget
                        ? "bg-[#332010] text-[#f9f586] border-[#d4af37]/60 shadow-xs"
                        : "bg-[#1f150b] text-[#d4af37]/40 border-[#8c6d23]/30",
                    )}
                  >
                    {String(slotNumber).padStart(2, "0")}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        "font-mono text-xs font-semibold",
                        isNextTarget ? "text-[#f9f586]" : "text-[#d4af37]/45 italic",
                      )}
                    >
                      {isNextTarget
                        ? `[Target Slot Urutan #${String(slotNumber).padStart(2, "0")} - Pilih kartu di baki kiri]`
                        : `[Slot Urutan Langkah #${String(slotNumber).padStart(2, "0")} - Belum Terisi]`}
                    </span>
                    <span className="text-[10px] text-[#e6d59c]/40">
                      {isNextTarget
                        ? "Langkah selanjutnya yang Anda pilih akan mengisi posisi ini"
                        : `Area susunan langkah ke-${slotNumber}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Guide Note */}
          <div className="border-t border-[#8c6d23]/30 pt-2.5 flex items-center justify-between text-[10px] text-[#d4af37]/75 font-mono">
            <span>💡 Suara tick aktif saat kartu bergeser posisi</span>
            <span>Total Terisi: {selectedSteps.length} / {MAX_TOTAL_SLOTS} Slot</span>
          </div>
        </div>

      </div>
    </div>
  );
}
