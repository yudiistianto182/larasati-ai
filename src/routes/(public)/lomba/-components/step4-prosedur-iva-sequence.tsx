import * as React from "react";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { arrayMove } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  ListChecks,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string;
  text: string;
  correctOrder: number;
}

const INITIAL_STEPS_SHUFFLED: StepItem[] = [
  {
    id: "step-c",
    text: "Bersihkan porsio serviks dari cairan lendir keputihan menggunakan lidi kapas steril.",
    correctOrder: 3,
  },
  {
    id: "step-a",
    text: "Lakukan informed consent kepada pasien, siapkan pencahayaan lampu sorot, dan cuci tangan 6 langkah.",
    correctOrder: 1,
  },
  {
    id: "step-e",
    text: "Tunggu selama 1 menit (60 detik) dan lakukan inspeksi visual terhadap perubahan epitel asetowhite pada SSK.",
    correctOrder: 5,
  },
  {
    id: "step-b",
    text: "Pasang spekulum cocor bebek (Graves) secara perlahan dan posisikan hingga serviks terlihat jelas.",
    correctOrder: 2,
  },
  {
    id: "step-f",
    text: "Lepaskan spekulum secara hati-hati dan rendam alat dalam larutan klorin 0.5% selama 10 menit.",
    correctOrder: 6,
  },
  {
    id: "step-d",
    text: "Oleskan larutan asam asetat 3-5% secara merata pada seluruh permukaan porsio serviks.",
    correctOrder: 4,
  },
];

interface SortableStepRowProps {
  item: StepItem;
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SortableStepRow({
  item,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
}: SortableStepRowProps) {
  const { handleRef, isDragging, ref } = useSortable({
    id: item.id,
    index,
    type: "sop-step",
    accept: "sop-step",
    group: "sop-steps",
    modifiers: [RestrictToVerticalAxis],
  });

  const stepNumber = index + 1;
  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-md transition-all select-none cursor-grab active:cursor-grabbing",
        isDragging
          ? "relative z-30 opacity-70 border-[#d4af37] bg-[#3a2717] ring-2 ring-[#d4af37] scale-[1.02] shadow-2xl"
          : "border-[#8c6d23]/40 bg-[#1f150c]/90 hover:border-[#d4af37]/70 hover:bg-[#281b10]",
      )}
    >
      {/* Entire Left Area handles drag */}
      <div
        ref={handleRef}
        className="flex items-center gap-3 min-w-0 flex-1 cursor-grab active:cursor-grabbing"
      >
        <div className="flex size-7 items-center justify-center rounded-md text-[#d4af37]/60 hover:text-[#fff8db] hover:bg-[#d4af37]/10 shrink-0">
          <GripVertical className="size-4.5" />
        </div>

        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#8c6d23] to-[#d4af37] font-serif font-bold text-xs text-[#14100c] shadow-md">
          0{stepNumber}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-xs sm:text-sm text-[#fff8db] leading-snug">
            {item.text}
          </span>
          <span className="text-[10px] text-[#d4af37]/70 mt-0.5">
            Langkah Tahapan #{stepNumber} &bull; Klik dan tarik di mana saja pada kartu untuk menggeser
          </span>
        </div>
      </div>

      {/* Right: Up / Down Move Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={isFirst}
          onClick={onMoveUp}
          className="size-8 rounded-lg bg-[#291c10] border-[#8c6d23]/50 text-[#f3e5ab] hover:border-[#d4af37] hover:text-[#fff8db] disabled:opacity-30 cursor-pointer"
          title="Pindah ke atas"
        >
          <ArrowUp className="size-3.5 text-[#d4af37]" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={isLast}
          onClick={onMoveDown}
          className="size-8 rounded-lg bg-[#291c10] border-[#8c6d23]/50 text-[#f3e5ab] hover:border-[#d4af37] hover:text-[#fff8db] disabled:opacity-30 cursor-pointer"
          title="Pindah ke bawah"
        >
          <ArrowDown className="size-3.5 text-[#d4af37]" />
        </Button>
      </div>
    </div>
  );
}

interface Step4ProsedurIvaSequenceProps {
  steps?: StepItem[];
  onChange?: (steps: StepItem[]) => void;
}

export function Step4ProsedurIvaSequence({
  steps: initialSteps = INITIAL_STEPS_SHUFFLED,
  onChange,
}: Step4ProsedurIvaSequenceProps) {
  const [stepList, setStepList] = React.useState<StepItem[]>(initialSteps);

  const handleDragEnd = (event: DragEndEvent) => {
    const { source } = event.operation;
    if (event.canceled || !isSortable(source) || source.initialIndex === source.index) {
      return;
    }
    const reordered = arrayMove(stepList, source.initialIndex, source.index);
    setStepList(reordered);
    onChange?.(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = arrayMove(stepList, index, index - 1);
    setStepList(next);
    onChange?.(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= stepList.length - 1) return;
    const next = arrayMove(stepList, index, index + 1);
    setStepList(next);
    onChange?.(next);
  };

  const handleReset = () => {
    setStepList(INITIAL_STEPS_SHUFFLED);
    onChange?.(INITIAL_STEPS_SHUFFLED);
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none text-[#f3e5ab]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-4 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
            <ListChecks className="size-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#fff8db]">
              Urutkan Prosedur SOP Tindakan IVA (Drag & Drop Seluruh Badan Kartu)
            </h3>
            <p className="text-xs text-[#d4af37]/80">
              Klik dan geser pada badan kartu untuk memindahkan urutan langkah secara bebas dan responsif.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-8 gap-1.5 text-xs self-start sm:self-auto bg-[#24190f] text-[#f3e5ab] border-[#8c6d23]/50 hover:bg-[#342416]"
        >
          <RotateCcw className="size-3.5 text-[#d4af37]" />
          <span>Reset Urutan</span>
        </Button>
      </div>

      {/* Sequencer List Cards with Dynamic Live Swap Drag and Drop across entire card body */}
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-2.5">
          {stepList.map((item, index) => (
            <SortableStepRow
              key={item.id}
              item={item}
              index={index}
              totalCount={stepList.length}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}
