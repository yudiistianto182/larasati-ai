import * as React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OneMinuteAlertProps {
  show: boolean;
}

export function OneMinuteAlert({ show }: OneMinuteAlertProps) {
  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
      <div className="flex items-center gap-2.5 rounded-full border-2 border-amber-500 bg-amber-950/90 px-5 py-2.5 text-amber-200 shadow-2xl backdrop-blur-md">
        <div className="flex size-6 items-center justify-center rounded-full bg-amber-500 text-amber-950 animate-ping">
          <Clock className="size-3.5 stroke-[3]" />
        </div>
        <span className="font-bold text-xs sm:text-sm tracking-wide">
          ⚠️ Perhatian: Waktu stase tersisa 1 Menit lagi!
        </span>
      </div>
    </div>
  );
}
