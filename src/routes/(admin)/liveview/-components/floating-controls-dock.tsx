import * as React from "react";
import {
  Dices,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Tv,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FloatingControlsDockProps {
  selectedContestId: string;
  onSelectContestId: (id: string) => void;
  contests: Array<{ id: string; judul: string; tanggal_mulai: string }>;
  isAutoRacing: boolean;
  onSimulateStep: () => void;
  onToggleAutoRace: () => void;
  onResetRace: () => void;
}

export function FloatingControlsDock({
  selectedContestId,
  onSelectContestId,
  contests,
  isAutoRacing,
  onSimulateStep,
  onToggleAutoRace,
  onResetRace,
}: FloatingControlsDockProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <aside aria-label="Liveview Floating Controls" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 rounded-2xl bg-[#18110b]/95 border-2 border-[#d4af37]/70 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.25)] backdrop-blur-md select-none text-[#fef08a] max-w-[95vw] overflow-x-auto">
      {/* 1. Contest Selector Dropdown */}
      <div className="flex items-center gap-1.5 px-2 border-r border-[#8c6d23]/40">
        <Trophy className="size-3.5 text-[#d4af37] shrink-0 hidden sm:inline" />
        <Select value={selectedContestId} onValueChange={onSelectContestId}>
          <SelectTrigger className="h-8 text-xs bg-[#24170d] text-[#fff8db] border-[#8c6d23]/60 rounded-xl min-w-[140px] sm:min-w-[180px] shadow-xs">
            <SelectValue placeholder="Pilih Lomba" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e130a] text-[#fef08a] border-[#8c6d23]">
            {contests.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-xs focus:bg-[#342416] focus:text-white">
                {c.judul}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Simulate Step Button */}
        <Button
          type="button"
          size="sm"
          onClick={onSimulateStep}
          className="h-8 px-3 text-xs font-serif font-bold tracking-wider bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 shadow-md border border-[#fff8db]/60 gap-1.5 cursor-pointer"
        >
          <Dices className="size-3.5 stroke-[2.5]" />
          <span>Simulasi</span>
        </Button>

        {/* Auto Race Toggle Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onToggleAutoRace}
          className={cn(
            "h-8 px-3 text-xs font-semibold gap-1.5 transition-all shadow-xs cursor-pointer",
            isAutoRacing
              ? "bg-[#854d0e] text-white border-[#fde047] animate-pulse"
              : "bg-[#251b11] hover:bg-[#382313] border-[#8c6d23]/70 text-[#fde047]",
          )}
        >
          {isAutoRacing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          <span>{isAutoRacing ? "Jeda" : "Auto Race"}</span>
        </Button>

        {/* Reset Race Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onResetRace}
          className="h-8 px-2.5 text-xs font-semibold gap-1 bg-[#251b11] hover:bg-[#382313] border-[#8c6d23]/70 text-[#e6cf9b] shadow-xs cursor-pointer"
          title="Reset Posisi Seluruh Tim ke Gerbang Awal"
        >
          <RotateCcw className="size-3.5 text-[#d4af37]" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        {/* Mode TV Fullscreen Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={toggleFullscreen}
          className="h-8 px-2.5 text-xs font-semibold gap-1 bg-[#251b11] hover:bg-[#382313] border-[#8c6d23]/70 text-[#fde047] shadow-xs cursor-pointer"
          title="Beralih Mode Layar Penuh (TV Proyektor)"
        >
          {isFullscreen ? <Minimize2 className="size-3.5 text-[#d4af37]" /> : <Maximize2 className="size-3.5 text-[#d4af37]" />}
          <span className="hidden sm:inline">{isFullscreen ? "Keluar TV" : "Mode TV"}</span>
        </Button>
      </div>
    </aside>
  );
}
