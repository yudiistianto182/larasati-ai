import * as React from "react";
import {
  Mic,
  Pause,
  Play,
  Square,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step7AudioRecorderProps {
  onRecorded?: (hasAudio: boolean) => void;
}

export function Step7AudioRecorder({ onRecorded }: Step7AudioRecorderProps) {
  const [recordingState, setRecordingState] = React.useState<"idle" | "recording" | "paused" | "recorded" | "playing">("idle");
  const [recordSeconds, setRecordSeconds] = React.useState(0);
  const [playSeconds, setPlaySeconds] = React.useState(0);

  // Timer while recording
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === "recording") {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  // Timer while playing
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === "playing") {
      interval = setInterval(() => {
        setPlaySeconds((prev) => {
          if (prev >= recordSeconds) {
            setRecordingState("recorded");
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState, recordSeconds]);

  const handleStartRecord = () => {
    setRecordingState("recording");
    setRecordSeconds(0);
    setPlaySeconds(0);
    onRecorded?.(false);
  };

  const handlePauseRecord = () => {
    setRecordingState("paused");
  };

  const handleResumeRecord = () => {
    setRecordingState("recording");
  };

  const handleStopRecord = () => {
    setRecordingState("recorded");
    onRecorded?.(true);
  };

  const handlePlayAudio = () => {
    setRecordingState("playing");
    setPlaySeconds(0);
  };

  const handlePausePlay = () => {
    setRecordingState("recorded");
  };

  const handleResetRecord = () => {
    setRecordingState("idle");
    setRecordSeconds(0);
    setPlaySeconds(0);
    onRecorded?.(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-6 sm:p-10 shadow-xl min-h-[460px] text-[#f3e5ab]">
      {/* Header Info */}
      <div className="text-center max-w-md">
        <Badge variant="outline" className="text-xs font-mono border-[#d4af37]/40 text-[#d4af37] mb-2 bg-[#140e08]">
          Perekaman Pembicaraan Klinis
        </Badge>
        <h3 className="text-base sm:text-lg font-serif font-bold text-[#fff8db]">
          Rekam Suara Kesimpulan & Laporan Asuhan Kebidanan
        </h3>
        <p className="text-xs text-[#e6d59c]/90 mt-1 leading-relaxed">
          Silakan bicara dengan jelas untuk menyampaikan kesimpulan diagnosis, tindakan yang telah diambil, dan rencana rujukan/edukasi pasien kepada dewan penguji.
        </p>
      </div>

      {/* Main Recording Center Stage */}
      <div className="relative flex flex-col items-center justify-center gap-4 w-full max-w-lg rounded-2xl border border-[#8c6d23]/50 bg-[#251b11] p-6 sm:p-8 shadow-inner">
        {/* Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-16 w-full px-4">
          {[24, 40, 16, 60, 32, 70, 48, 80, 20, 64, 36, 50, 75, 28, 44, 60, 20, 45, 80, 30].map((height, i) => {
            const isPlayingOrRecording = recordingState === "recording" || recordingState === "playing";

            return (
              <div
                key={i}
                style={{
                  height: isPlayingOrRecording ? `${Math.max(12, height * (0.4 + Math.random() * 0.6))}%` : "12%",
                }}
                className={cn(
                  "w-1.5 rounded-full transition-all duration-150",
                  recordingState === "recording"
                    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"
                    : recordingState === "playing"
                      ? "bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                      : "bg-[#8c6d23]/30",
                )}
              />
            );
          })}
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-[#fff8db]">
            {recordingState === "playing" ? formatTime(playSeconds) : formatTime(recordSeconds)}
          </span>
          <span className="text-[11px] text-[#d4af37]/80 mt-0.5">
            {recordingState === "idle" && "Siap Merekam"}
            {recordingState === "recording" && "🔴 Sedang Merekam Suara..."}
            {recordingState === "paused" && "⏸️ Rekaman Dijeda"}
            {recordingState === "recorded" && "✅ Rekaman Tersimpan"}
            {recordingState === "playing" && "🔊 Memutar Hasil Rekaman..."}
          </span>
        </div>

        {/* Recording Action Buttons */}
        <div className="flex items-center gap-3 mt-2">
          {recordingState === "idle" && (
            <Button
              type="button"
              size="lg"
              onClick={handleStartRecord}
              className="h-12 px-8 rounded-full bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-bold gap-2 shadow-lg shadow-rose-900/40 border border-rose-400/40"
            >
              <Mic className="size-5" />
              <span>Mulai Rekam Suara</span>
            </Button>
          )}

          {recordingState === "recording" && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handlePauseRecord}
                className="size-11 rounded-full bg-[#1a130d] border-[#8c6d23] text-[#f3e5ab] shadow-md"
                title="Jeda"
              >
                <Pause className="size-5" />
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={handleStopRecord}
                className="h-11 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 shadow-md"
              >
                <Square className="size-4 fill-white" />
                <span>Selesai Rekam</span>
              </Button>
            </div>
          )}

          {recordingState === "paused" && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleResumeRecord}
                className="h-11 px-5 rounded-full bg-[#1a130d] border-[#8c6d23] text-[#f3e5ab] font-bold gap-2 shadow-md"
              >
                <Mic className="size-4 text-rose-400" />
                <span>Lanjutkan</span>
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={handleStopRecord}
                className="h-11 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 shadow-md"
              >
                <Square className="size-4 fill-white" />
                <span>Selesai Rekam</span>
              </Button>
            </div>
          )}

          {(recordingState === "recorded" || recordingState === "playing") && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="lg"
                onClick={recordingState === "playing" ? handlePausePlay : handlePlayAudio}
                className="h-11 px-7 rounded-full font-bold gap-2 shadow-md bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110"
              >
                {recordingState === "playing" ? (
                  <>
                    <Pause className="size-4" />
                    <span>Jeda Putar</span>
                  </>
                ) : (
                  <>
                    <Play className="size-4 fill-current" />
                    <span>Putar Ulang Rekaman</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleResetRecord}
                className="size-10 rounded-full text-[#d4af37]/70 hover:text-rose-400 hover:bg-rose-500/10"
                title="Hapus dan Rekam Ulang"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
