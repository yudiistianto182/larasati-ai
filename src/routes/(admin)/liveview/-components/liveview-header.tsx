import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Layers,
  LayoutGrid,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LiveviewMode } from "./liveview-types";

interface LiveviewHeaderProps {
  currentMode: LiveviewMode;
  onModeChange: (mode: LiveviewMode) => void;
  selectedContestId: string;
  onSelectContestId: (id: string) => void;
  contests: Array<{ id: string; nama?: string; judul?: string; tanggal_mulai?: string }>;
}

const VIEW_MODES: Array<{
  id: LiveviewMode;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}> = [
  {
    id: "panoramic",
    label: "Arena Sirkuit Wayang",
    shortLabel: "Peta Sirkuit",
    icon: MapIcon,
  },
  {
    id: "parallax",
    label: "Paralaks Jalur Larasati",
    shortLabel: "Paralaks 3D",
    icon: Layers,
  },
  {
    id: "matrix",
    label: "Matriks Monitor & Telemetri",
    shortLabel: "Matriks Telemetri",
    icon: LayoutGrid,
  },
  {
    id: "leaderboard",
    label: "Papan Peringkat Podium",
    shortLabel: "Leaderboard",
    icon: Trophy,
  },
];

export function LiveviewHeader({
  currentMode,
  onModeChange,
  selectedContestId,
  onSelectContestId,
  contests,
}: LiveviewHeaderProps) {
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
    <nav className="relative z-20 w-full px-4 sm:px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-4 select-none">
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
        <Link
          to="/dashboard/contest"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#26190e]/90 border border-[#854d0e]/60 text-[#fde047] hover:bg-[#3d2714] hover:border-[#fde047] transition-all text-xs font-serif font-bold shadow-lg backdrop-blur"
        >
          <ArrowLeft className="size-3.5" />
          <span>Dashboard Lomba</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-[#854d0e] to-[#543209] text-[#fef08a] border border-[#eab308]/60 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            🔴 Live Tracking
          </Badge>
          <span className="text-xs text-[#d1b17a] hidden sm:inline font-medium">
            Monitor Sirkuit Kompetisi
          </span>
        </div>
      </div>

      {/* Center: View Mode Tabs Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#1a120b]/90 border border-[#854d0e]/60 shadow-xl backdrop-blur-md overflow-x-auto max-w-full">
        {VIEW_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif transition-all whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-gradient-to-r from-[#854d0e] via-[#b8860b] to-[#854d0e] text-[#140e09] font-extrabold shadow-[0_0_15px_rgba(234,179,8,0.4)] border border-[#fff8db]/60"
                  : "text-[#d1b17a] hover:text-[#fef08a] hover:bg-[#2e1d10]",
              )}
            >
              <Icon className={cn("size-3.5", isActive ? "text-[#140e09] stroke-[2.5]" : "text-[#eab308]")} />
              <span className="hidden sm:inline">{mode.label}</span>
              <span className="sm:hidden">{mode.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Contest Selector & Fullscreen Toggle */}
      <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
        {/* Contest Select */}
        <Select value={selectedContestId} onValueChange={(val) => onSelectContestId(val || "")}>
          <SelectTrigger className="h-8.5 text-xs bg-[#24160c] text-[#fef08a] border-[#854d0e]/70 rounded-xl max-w-[200px] shadow-sm">
            <SelectValue placeholder="Pilih Lomba" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e130a] text-[#fef08a] border-[#854d0e]">
            {contests.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-xs focus:bg-[#382313] focus:text-[#fff]">
                {c.nama || c.judul}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Fullscreen Mode Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="h-8.5 px-3 text-xs bg-[#26190e]/90 text-[#fde047] border-[#854d0e]/60 hover:bg-[#3d2714] rounded-xl shadow-md gap-1"
          title="Tampilan Layar Penuh (TV Proyektor)"
        >
          {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          <span className="hidden sm:inline">{isFullscreen ? "Keluar" : "Mode TV"}</span>
        </Button>
      </div>
    </nav>
  );
}
