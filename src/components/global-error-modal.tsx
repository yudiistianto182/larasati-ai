import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useErrorAlertStore } from "@/stores/error-alert-store";

export function GlobalErrorModal() {
  const { isOpen, title, message, statusCode, closeError } = useErrorAlertStore();

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeError()}>
      <AlertDialogContent className="max-w-md w-full overflow-hidden border border-rose-500/25 bg-background/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(244,63,94,0.15)] p-0 rounded-2xl sm:rounded-3xl">
        {/* Glowing top ambient gradient line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-rose-500 to-transparent" />

        {/* Ambient background glow circle */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 size-48 rounded-full bg-rose-500/10 blur-3xl" />

        {/* Close Button at top-right */}
        <button
          type="button"
          onClick={closeError}
          className="absolute top-4 right-4 z-10 size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors focus:outline-hidden"
          aria-label="Tutup pesan peringatan"
        >
          <X className="size-4" />
        </button>

        <div className="p-6 sm:p-7 flex flex-col items-center text-center gap-4">
          {/* Glowing Animated Icon Container */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-rose-500/20 blur-md animate-pulse opacity-75" />
            <div className="relative flex size-16 items-center justify-center rounded-2xl bg-linear-to-b from-rose-500/20 to-rose-500/5 border border-rose-500/30 text-rose-500 shadow-inner">
              <ShieldAlert className="size-8 stroke-[2.2]" />
            </div>
          </div>

          {/* Header & Title */}
          <AlertDialogHeader className="flex flex-col items-center text-center gap-1.5 w-full">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <AlertDialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {title || "Peringatan Sistem"}
              </AlertDialogTitle>
              {statusCode ? (
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] px-2 py-0.5 rounded-full border-rose-500/30 bg-rose-500/10 text-rose-400 font-medium"
                >
                  HTTP {statusCode}
                </Badge>
              ) : null}
            </div>

            <AlertDialogDescription className="text-xs text-muted-foreground leading-normal max-w-xs mx-auto">
              Sistem mendeteksi kendala pada permintaan data. Mohon periksa rincian di bawah ini.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Structured Error Message Card */}
          <div className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-left transition-all">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-400/90 mb-1.5">
              <AlertTriangle className="size-3.5" />
              <span>Detail Kesalahan:</span>
            </div>
            <p className="text-xs md:text-sm font-mono text-foreground/90 break-words leading-relaxed whitespace-pre-wrap select-all">
              {message || "Terjadi kesalahan yang tidak diketahui saat menghubungi server."}
            </p>
          </div>

          {/* Helper hint */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 self-start text-left">
            <Info className="size-3.5 shrink-0 text-muted-foreground" />
            <span>Pastikan seluruh isian formulir telah sesuai dengan ketentuan format.</span>
          </div>

          {/* Footer Action Button */}
          <AlertDialogFooter className="w-full mt-2 sm:justify-center">
            <Button
              type="button"
              onClick={closeError}
              className="w-full h-10 rounded-xl font-medium bg-linear-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-950/40 border border-rose-500/30 transition-all duration-150 active:scale-[0.98]"
            >
              Mengerti & Periksa Kembali
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
