import * as React from "react";
import { Award, Sparkles, Trophy, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GroupRaceState } from "./liveview-types";

interface LiveviewWinnerModalProps {
  winner: GroupRaceState | null;
  onClose: () => void;
}

export function LiveviewWinnerModal({ winner, onClose }: LiveviewWinnerModalProps) {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300 p-4 select-none">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-[#fde047] bg-gradient-to-b from-[#24170d] via-[#160f08] to-[#0c0805] p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(253,224,71,0.5)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#d4af37]/70 hover:text-[#fff8db] hover:bg-[#382313] transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Bouncing Gold Trophy */}
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#eab308] via-[#fde047] to-[#ca8a04] text-[#140e09] shadow-2xl animate-bounce">
          <Trophy className="size-10 stroke-[2.5]" />
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#3d2714]/80 border border-[#eab308]/60 text-[11px] font-bold text-[#fde047] uppercase tracking-wider mb-2">
          <Sparkles className="size-3 text-[#fde047]" /> Juara Telah Ditetapkan!
        </div>

        <h3 className="font-serif font-black text-2xl sm:text-3xl uppercase tracking-wider bg-gradient-to-r from-[#fffbeb] via-[#fde047] to-[#ca8a04] bg-clip-text text-transparent drop-shadow-md">
          Selamat!
        </h3>

        <p className="font-serif font-extrabold text-lg text-[#fff] mt-2 mb-1">
          🏆 {winner.name} Telah Mencapai Finish!
        </p>

        <p className="text-xs text-[#d1b17a] max-w-xs mx-auto leading-relaxed mb-6">
          Kelompok ini berhasil menyelesaikan seluruh tahapan skenario asuhan kebidanan pada Sirkuit Larasati Journey.
        </p>

        <Button
          type="button"
          onClick={onClose}
          className="w-full h-11 text-xs sm:text-sm font-serif font-black tracking-wider uppercase bg-gradient-to-r from-[#eab308] via-[#fde047] to-[#ca8a04] text-[#140e09] hover:brightness-110 shadow-lg border border-[#fff8db]/70"
        >
          Tutup & Lanjutkan Pemantauan
        </Button>
      </div>
    </div>
  );
}
