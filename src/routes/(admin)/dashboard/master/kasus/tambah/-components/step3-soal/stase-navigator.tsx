import * as React from "react";
import {
  Activity,
  Bot,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  HeartHandshake,
  Image as ImageIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StaseSoalData } from "../../../-components/data";

export interface StaseInfo {
  id: 1 | 2 | 3 | 4 | 5;
  title: string;
  shortTitle: string;
  badgeLabel: string;
  icon: React.ElementType;
  colorClass: string;
}

export const STASE_LIST: StaseInfo[] = [
  {
    id: 1,
    title: "Pos 1: Interaktif dengan AI",
    shortTitle: "1. Interaktif AI",
    badgeLabel: "Wawancara AI",
    icon: Bot,
    colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: 2,
    title: "Pos 2: Multi Select Jawaban",
    shortTitle: "2. Multi Select",
    badgeLabel: "Multi Jawaban",
    icon: Activity,
    colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: 3,
    title: "Pos 3: Mengurutkan Langkah",
    shortTitle: "3. Urutkan Langkah",
    badgeLabel: "SOP Prosedur",
    icon: ClipboardList,
    colorClass: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  {
    id: 4,
    title: "Pos 4: Single Choice Image",
    shortTitle: "4. Single Choice Image",
    badgeLabel: "Gambar & Kunci",
    icon: ImageIcon,
    colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: 5,
    title: "Pos 5: Interaktif dengan AI",
    shortTitle: "5. Interaktif AI",
    badgeLabel: "Konseling AI",
    icon: HeartHandshake,
    colorClass: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
];

interface StaseNavigatorProps {
  activeStase: 1 | 2 | 3 | 4 | 5;
  onStaseChange: (staseId: 1 | 2 | 3 | 4 | 5) => void;
  staseData: StaseSoalData;
}

export function StaseNavigator({
  activeStase,
  onStaseChange,
  staseData,
}: StaseNavigatorProps) {
  const getItemCount = (id: 1 | 2 | 3 | 4 | 5) => {
    switch (id) {
      case 1:
        return `${staseData.stase1.triggers.length} Trigger`;
      case 2:
        return `${staseData.stase2.faktor_risiko.length} Faktor`;
      case 3:
        return `${staseData.stase3.langkah_prosedur.length} Langkah`;
      case 4:
        return `${staseData.stase4.pilihan_jawaban.length} Opsi`;
      case 5:
        return `${staseData.stase5.triggers.length} Asuhan`;
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-muted/20 p-2.5 shadow-2xs">
      <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <span>Stase Ujian Kasus (5 Pos Pemeriksaan)</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Posisi: <strong className="text-foreground">Stase {activeStase} dari 5</strong>
        </span>
      </div>

      {/* Station Pills Row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {STASE_LIST.map((stase) => {
          const Icon = stase.icon;
          const isActive = stase.id === activeStase;
          const countBadge = getItemCount(stase.id);

          return (
            <button
              type="button"
              key={stase.id}
              onClick={() => onStaseChange(stase.id)}
              className={cn(
                "group relative flex flex-col gap-1.5 rounded-xl border p-2.5 text-left transition-all duration-200 select-none",
                isActive
                  ? "border-primary bg-background shadow-xs ring-2 ring-primary/20 scale-[1.02]"
                  : "border-border/60 bg-card/60 hover:border-border hover:bg-card hover:shadow-2xs opacity-80 hover:opacity-100",
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : stase.colorClass,
                  )}
                >
                  <Icon className="size-3.5" />
                </div>

                <Badge
                  variant={isActive ? "default" : "outline"}
                  className="text-[9px] px-1.5 py-0 h-4 font-normal"
                >
                  {countBadge}
                </Badge>
              </div>

              <div className="flex flex-col">
                <span
                  className={cn(
                    "truncate text-xs font-semibold leading-snug",
                    isActive ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {stase.shortTitle}
                </span>
                <span className="truncate text-[10px] text-muted-foreground/80">
                  {stase.badgeLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
