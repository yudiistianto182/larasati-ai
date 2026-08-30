import * as React from "react";
import {
  Check,
  CheckCircle2,
  GripHorizontal,
  HelpCircle,
  Magnet,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RiskFactorOption {
  id: string;
  label: string;
  category: "Obstetri & Reproduksi" | "Kebiasaan & Perilaku" | "Klinis & Simtomatik";
}

const RISK_FACTOR_POOL: RiskFactorOption[] = [
  {
    id: "rf-1",
    label: "Perdarahan Kontak Pasca Senggama (Post-Coital Bleeding)",
    category: "Klinis & Simtomatik",
  },
  {
    id: "rf-2",
    label: "Keputihan Patologis Kental, Kuning Kehijauan & Berbau",
    category: "Klinis & Simtomatik",
  },
  {
    id: "rf-3",
    label: "Riwayat Paritas Tinggi (Multiparitas G2P1A0)",
    category: "Obstetri & Reproduksi",
  },
  {
    id: "rf-4",
    label: "Penggunaan Kontrasepsi Hormonal Suntik 3 Bulan",
    category: "Obstetri & Reproduksi",
  },
  {
    id: "rf-5",
    label: "Usia Menikah / Kontak Seksual Pertama Dini (< 20 Tahun)",
    category: "Kebiasaan & Perilaku",
  },
  {
    id: "rf-6",
    label: "Riwayat Infeksi Menular Seksual (IMS) Berulang",
    category: "Klinis & Simtomatik",
  },
  {
    id: "rf-7",
    label: "Paparan Asap Rokok Lingkungan (Perokok Pasif)",
    category: "Kebiasaan & Perilaku",
  },
  {
    id: "rf-8",
    label: "Riwayat Vaksinasi HPV Lengkap 3 Dosis",
    category: "Obstetri & Reproduksi",
  },
];

const PIN_COLORS = [
  "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]",
  "bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]",
  "bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.8)]",
  "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]",
  "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]",
];

interface Step3FaktorRisikoMagnetProps {
  selectedIds?: string[];
  onChange?: (ids: string[]) => void;
}

export function Step3FaktorRisikoMagnet({
  selectedIds: initialSelectedIds = ["rf-1", "rf-2"],
  onChange,
}: Step3FaktorRisikoMagnetProps) {
  const [pinnedIds, setPinnedIds] = React.useState<string[]>(initialSelectedIds);
  const [isDragOverBoard, setIsDragOverBoard] = React.useState(false);

  const handleTogglePin = (id: string) => {
    const next = pinnedIds.includes(id)
      ? pinnedIds.filter((pId) => pId !== id)
      : [...pinnedIds, id];
    setPinnedIds(next);
    onChange?.(next);
  };

  const handleResetBoard = () => {
    setPinnedIds([]);
    onChange?.([]);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOverBoard = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverBoard(true);
  };

  const handleDragLeaveBoard = () => {
    setIsDragOverBoard(false);
  };

  const handleDropOnBoard = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverBoard(false);
    const droppedId = e.dataTransfer.getData("text/plain");
    if (droppedId && !pinnedIds.includes(droppedId)) {
      const next = [...pinnedIds, droppedId];
      setPinnedIds(next);
      onChange?.(next);
    }
  };

  const unpinnedPool = RISK_FACTOR_POOL.filter((item) => !pinnedIds.includes(item.id));
  const pinnedList = RISK_FACTOR_POOL.filter((item) => pinnedIds.includes(item.id));

  return (
    <div className="flex flex-col gap-4 w-full max-w-full overflow-x-hidden select-none">
      {/* 1. Upper Options Tray */}
      <div className="flex flex-col gap-2.5 rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-4 shadow-md text-[#f3e5ab] w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#8c6d23]/30 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
              <Plus className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#fff8db]">
                Baki Kartu Faktor Risiko (Bisa Diklik atau Di-Drag)
              </h3>
              <p className="text-[10px] text-[#d4af37]/80">
                Tarik kartu atau klik tombol <strong>+</strong> untuk menempelkan ke Papan Magnet.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold">
            {unpinnedPool.length} Kartu Tersedia
          </Badge>
        </div>

        {unpinnedPool.length === 0 ? (
          <div className="py-3 text-center text-xs text-[#d4af37]/60 italic">
            Semua kartu telah ditempelkan ke Papan Magnet di bawah.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {unpinnedPool.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => handleTogglePin(item.id)}
                className="group flex flex-col justify-between rounded-xl border border-[#8c6d23]/40 bg-[#251b11] p-3 text-xs transition-all hover:border-[#d4af37] hover:bg-[#322315] hover:shadow-md cursor-grab active:cursor-grabbing"
                title="Klik atau Drag ke Papan Magnet"
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-[9px] font-semibold bg-[#1a130d] text-[#e6d59c] border border-[#8c6d23]/40">
                    {item.category}
                  </Badge>
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-[10px] group-hover:bg-[#d4af37] group-hover:text-[#14100c] transition-colors">
                    +
                  </span>
                </div>

                <p className="my-1.5 font-semibold text-[#fff8db] text-xs leading-snug group-hover:text-[#f9f586] transition-colors">
                  {item.label}
                </p>

                <span className="text-[9px] text-[#d4af37]/60 flex items-center gap-1">
                  <GripHorizontal className="size-2.5" /> Drag / Klik untuk Pasang
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive Magnet Board */}
      <div
        onDragOver={handleDragOverBoard}
        onDragLeave={handleDragLeaveBoard}
        onDrop={handleDropOnBoard}
        className={cn(
          "relative rounded-2xl border-4 p-5 shadow-2xl transition-all duration-300 w-full max-w-full overflow-hidden",
          isDragOverBoard
            ? "border-[#d4af37] bg-[#2d1e11] ring-4 ring-[#d4af37]/40"
            : "border-[#8c6d23] bg-[#1f150c]",
        )}
      >
        {/* Board Header Bar */}
        <div className="flex items-center justify-between border-b border-[#8c6d23]/40 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#8c6d23] to-[#d4af37] text-[#14100c] shadow-md">
              <Magnet className="size-4.5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#fff8db] flex items-center gap-2">
                <span>Papan Magnet Faktor Risiko Terpilih</span>
                <Badge className="bg-[#d4af37] text-[#14100c] text-[10px] font-bold shadow-xs">
                  {pinnedList.length} Kartu Tertempel
                </Badge>
              </h3>
              <p className="text-[11px] text-[#d4af37]/80">
                Drop area aktif: Kartu yang tertempel di papan ini adalah kesimpulan identifikasi faktor risiko Anda.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleResetBoard}
            disabled={pinnedList.length === 0}
            className="h-7 text-xs text-[#d4af37]/80 hover:text-rose-400 hover:bg-rose-500/10 gap-1"
          >
            <RotateCcw className="size-3" />
            <span>Kosongkan Papan</span>
          </Button>
        </div>

        {/* Board Canvas */}
        <div
          className={cn(
            "min-h-64 rounded-xl border-2 border-dashed p-4 transition-colors shadow-inner flex flex-col justify-center",
            isDragOverBoard
              ? "border-[#d4af37] bg-[#3a2717]/60"
              : "border-[#8c6d23]/50 bg-[#150e08]/80",
          )}
        >
          {pinnedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-[#d4af37]/60">
              <Magnet className="size-10 text-[#d4af37]/30 mb-2 animate-bounce" />
              <span className="font-serif font-bold text-sm text-[#fff8db]">Papan Magnet Masih Kosong</span>
              <p className="text-[11px] text-[#d4af37]/80 mt-0.5 max-w-sm">
                Tarik (*drag*) kartu dari baki di atas atau klik langsung untuk menempelkannya pada area papan magnet ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              {pinnedList.map((item, index) => {
                const pinColor = PIN_COLORS[index % PIN_COLORS.length];

                return (
                  <div
                    key={item.id}
                    className="relative flex flex-col justify-between rounded-xl border-2 border-[#d4af37] bg-gradient-to-r from-[#8c6d23]/40 via-[#d4af37]/25 to-[#8c6d23]/30 p-3.5 ring-2 ring-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-transform hover:-translate-y-0.5 animate-in zoom-in-95 duration-200"
                  >
                    {/* Magnetic Pin Dot in Gold */}
                    <div
                      className={cn(
                        "absolute -top-2.5 left-1/2 -translate-x-1/2 size-4.5 rounded-full border-2 border-[#fff8db] shadow-md",
                        pinColor,
                      )}
                    />

                    <div className="flex items-start justify-between gap-2 mt-1">
                      <Badge className="text-[9px] font-bold bg-[#140e08] text-[#f9f586] border border-[#d4af37] shadow-xs">
                        {item.category}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(item.id)}
                        className="text-[#fff8db]/70 hover:text-rose-400 transition-colors p-0.5 rounded"
                        title="Lepas dari papan magnet"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>

                    <p className="my-2.5 font-serif font-bold text-xs text-[#fff8db] leading-snug drop-shadow">
                      {item.label}
                    </p>

                    <div className="border-t border-[#d4af37]/40 pt-1.5 flex items-center justify-between text-[10px] text-[#f9f586] font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-[#d4af37]" /> Tertempel di Papan
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(item.id)}
                        className="text-[#fff8db]/80 hover:text-rose-300 hover:underline text-[10px]"
                      >
                        Lepas
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
