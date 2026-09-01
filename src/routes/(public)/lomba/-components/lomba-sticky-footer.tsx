import * as React from "react";
import { ArrowRight, Check, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playCtaClickSound, playTransitionChime } from "./lomba-sound-effects";

interface LombaStickyFooterProps {
  currentStep: number;
  totalSteps: number;
  hasAudioRecorder: boolean;
  onNext: () => void;
}

export function LombaStickyFooter({
  currentStep,
  totalSteps,
  hasAudioRecorder,
  onNext,
}: LombaStickyFooterProps) {
  const isFinalStase = currentStep === (hasAudioRecorder ? 7 : 6);

  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 border-t-2 border-[#8c6d23]/50 bg-[#140e09]/95 backdrop-blur-md px-6 sm:px-10 py-3.5 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4 text-[#f3e5ab]">
      {/* Left: Stage Progress Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-[#d4af37] font-serif font-bold tracking-wide">
          Pos <strong>0{currentStep - 1}</strong> dari <strong>0{hasAudioRecorder ? 6 : 5}</strong>
        </span>
        <span className="text-[11px] text-[#e6d59c]/60 hidden sm:inline">
          &bull; Selesaikan pos sebelum melanjutkan
        </span>
      </div>

      {/* Right: Next Stase Button */}
      <Button
        type="button"
        size="sm"
        onClick={() => {
          playCtaClickSound();
          playTransitionChime();
          onNext();
        }}
        className="h-10 px-7 text-xs font-serif font-bold tracking-widest uppercase bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-[#fff8db]/60 gap-2 cursor-pointer active:scale-98"
      >
        <span>
          {isFinalStase ? "Selesai ke Ringkasan" : "Lanjut Pos Selanjutnya"}
        </span>
        <ArrowRight className="size-4 stroke-[2.5]" />
      </Button>
    </footer>
  );
}
