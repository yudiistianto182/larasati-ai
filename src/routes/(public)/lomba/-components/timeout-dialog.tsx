import * as React from "react";
import { ArrowRight, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { playCtaClickSound, playTransitionChime } from "./lomba-sound-effects";

interface TimeoutDialogProps {
  open: boolean;
  onNextStase: () => void;
  nextStaseName: string;
}

export function TimeoutDialog({
  open,
  onNextStase,
  nextStaseName,
}: TimeoutDialogProps) {
  const [countdown, setCountdown] = React.useState(3);

  React.useEffect(() => {
    if (!open) {
      setCountdown(3);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNextStase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onNextStase]);

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw] sm:max-w-md flex flex-col p-6 gap-4 border-destructive/40 bg-card text-foreground shadow-2xl"
      >
        <DialogHeader className="flex flex-col items-center text-center gap-2">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive animate-pulse">
            <Clock className="size-7 stroke-[2.5]" />
          </div>
          <DialogTitle className="text-lg font-bold text-destructive">
            Waktu Stase Telah Habis!
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Durasi waktu pengerjaan untuk pos ini telah selesai. Anda akan dialihkan secara otomatis ke pos berikutnya:
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-center">
          <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
            Pos Selanjutnya
          </span>
          <h4 className="font-bold text-sm text-foreground mt-0.5">
            {nextStaseName}
          </h4>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Beralih otomatis dalam <strong className="text-foreground text-sm font-mono">{countdown}</strong> detik...
        </div>

        <DialogFooter className="m-0 flex flex-row items-center justify-center pt-2">
          <Button
            type="button"
            onClick={() => {
              playCtaClickSound();
              playTransitionChime();
              onNextStase();
            }}
            className="h-9 px-6 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <span>Lanjut Sekarang</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
