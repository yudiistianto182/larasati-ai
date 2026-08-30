import * as React from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  Clock,
  Headphones,
  ImageIcon,
  ListChecks,
  Lock,
  Magnet,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GroupRaceState } from "./liveview-types";
import { CIRCUIT_WAYPOINTS } from "./liveview-types";

interface WaypointDetailModalProps {
  waypointPos: number | null;
  groups: GroupRaceState[];
  onClose: () => void;
}

export function WaypointDetailModal({
  waypointPos,
  groups,
  onClose,
}: WaypointDetailModalProps) {
  if (waypointPos === null) return null;

  const waypoint =
    CIRCUIT_WAYPOINTS.find((w) => w.pos === waypointPos) || CIRCUIT_WAYPOINTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-[#d4af37] bg-gradient-to-b from-[#20150c]/98 via-[#150d07]/98 to-[#0c0804]/98 p-5 sm:p-7 text-[#fef08a] shadow-[0_0_60px_rgba(212,175,55,0.4)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#8c6d23]/40 pb-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-[#8c6d23] to-[#d4af37] text-[#14100c] flex items-center justify-center font-serif font-black text-lg shadow-lg">
              {waypoint.pos === 0 ? "00" : waypoint.pos === 6 ? <Trophy className="size-6 stroke-[2.5]" /> : `0${waypoint.pos}`}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif font-black text-lg sm:text-xl text-[#fff8db]">
                  {waypoint.name}
                </h2>
                <Badge className="bg-[#1a1108] text-[#fde047] border border-[#8c6d23] text-[10px] font-bold">
                  {waypoint.subtitle}
                </Badge>
              </div>
              <p className="text-xs text-[#d4af37]/80 mt-0.5">
                Perbandingan Status & Live Jawaban Seluruh Kelompok Peserta pada Pos ini
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-full text-[#d4af37] hover:text-white hover:bg-[#342416]"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* 4 Groups Station Cards Grid */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-3.5 pr-1.5 scrollbar-thin scrollbar-thumb-[#8c6d23]/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {groups.map((group) => {
              const isPassed = group.pos > waypointPos;
              const isLive = group.pos === waypointPos && waypointPos > 0;
              const isLocked = group.pos < waypointPos;
              const staseData = group.staseData[waypointPos];

              return (
                <div
                  key={group.id}
                  className={cn(
                    "rounded-2xl border-2 p-4 flex flex-col justify-between gap-3 transition-all duration-200 shadow-lg",
                    isLive
                      ? "border-[#fde047] bg-gradient-to-br from-[#3d2714] via-[#24170c] to-[#160d06] ring-2 ring-[#fde047]/50 shadow-[0_0_25px_rgba(253,224,71,0.25)]"
                      : isPassed
                        ? "border-[#d4af37]/60 bg-[#1e130a]/90"
                        : "border-[#8c6d23]/30 bg-[#120a05]/60 opacity-55",
                  )}
                >
                  {/* Group Top Info */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#8c6d23]/30 pb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="size-7 rounded-full flex items-center justify-center font-black text-xs text-black shadow-md shrink-0"
                        style={{ backgroundColor: group.color }}
                      >
                        0{group.groupNum}
                      </div>
                      <span className="font-serif font-bold text-xs sm:text-sm text-[#fff8db] truncate">
                        {group.name}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPassed ? (
                        <Badge className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold">
                          Selesai &bull; Nilai: {staseData?.score || 90}/100
                        </Badge>
                      ) : isLive ? (
                        <Badge className="bg-amber-400 text-black font-extrabold text-[10px] animate-pulse">
                          ⚡ Sedang Mengerjakan
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px] border-[#8c6d23]/40">
                          <Lock className="size-2.5 mr-1 inline" /> Belum Sampai
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Body: Live / Submitted Answer Details */}
                  <div className="flex-1 flex flex-col justify-center min-h-[90px] text-xs">
                    {isLocked ? (
                      <div className="py-4 text-center text-[#d4af37]/50 italic text-[11px]">
                        Kelompok ini saat ini masih berada di Pos 0{group.pos}. Belum ada data pengerjaan untuk pos ini.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {/* Live Activity Banner if currently working */}
                        {isLive && (
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-950/60 border border-amber-500/60 text-[11px] text-amber-200 font-semibold animate-pulse">
                            <Activity className="size-3.5 text-amber-400 shrink-0" />
                            <span>{staseData?.liveActivity || "Sedang aktif berinteraksi pada stase ini..."}</span>
                          </div>
                        )}

                        {/* Submitted Answers Representation */}
                        {waypointPos === 1 && (
                          <div className="rounded-xl bg-[#140b05] border border-[#8c6d23]/40 p-2.5 space-y-1 text-[11px]">
                            <span className="font-bold text-[#d4af37] block">Transkrip Anamnesis:</span>
                            <p className="text-[#fff8db]/90 line-clamp-2">
                              &ldquo;Ibu, sudah berapa lama keputihannya dan apakah ada riwayat flek darah setelah dengan suami?&rdquo;
                            </p>
                          </div>
                        )}

                        {waypointPos === 2 && (
                          <div className="rounded-xl bg-[#140b05] border border-[#8c6d23]/40 p-2.5 space-y-1.5 text-[11px]">
                            <span className="font-bold text-[#d4af37] block">Faktor Risiko Terpilih:</span>
                            <div className="flex flex-wrap gap-1">
                              <Badge className="bg-[#2a1b0f] text-[#fde047] border border-[#d4af37] text-[9px]">
                                Perdarahan Kontak
                              </Badge>
                              <Badge className="bg-[#2a1b0f] text-[#fde047] border border-[#d4af37] text-[9px]">
                                Keputihan Patologis
                              </Badge>
                              <Badge className="bg-[#2a1b0f] text-[#fde047] border border-[#d4af37] text-[9px]">
                                Multiparitas G2P1A0
                              </Badge>
                            </div>
                          </div>
                        )}

                        {waypointPos === 3 && (
                          <div className="rounded-xl bg-[#140b05] border border-[#8c6d23]/40 p-2.5 text-[11px]">
                            <span className="font-bold text-[#d4af37] block mb-0.5">Urutan Prosedur SOP:</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> Langkah 1 s.d. 6 Tersusun Rapi & Valid
                            </span>
                          </div>
                        )}

                        {waypointPos === 4 && (
                          <div className="rounded-xl bg-[#140b05] border border-[#8c6d23]/40 p-2.5 text-[11px]">
                            <span className="font-bold text-[#d4af37] block mb-0.5">Pilihan Diagnosis MCQ:</span>
                            <span className="text-[#fff8db] font-bold">
                              C. IVA Positif (Plak Asetowhite SSK Jam 11-02)
                            </span>
                          </div>
                        )}

                        {waypointPos === 5 && (
                          <div className="rounded-xl bg-[#140b05] border border-[#8c6d23]/40 p-2.5 text-[11px]">
                            <span className="font-bold text-[#d4af37] block mb-0.5">Asuhan & Konseling AI:</span>
                            <p className="text-[#fff8db]/90 line-clamp-2">
                              Edukasi empatik berhasil disampaikan. Pasien tenang memahami lesi pra-kanker dapat diobati.
                            </p>
                          </div>
                        )}

                        {waypointPos === 6 && (
                          <div className="rounded-xl bg-[#140b05] border border-[#8c6d23]/40 p-2.5 text-[11px] flex items-center justify-between">
                            <span className="font-bold text-[#d4af37]">Rekaman Suara:</span>
                            <span className="text-emerald-400 font-bold">Tersedia (03:14)</span>
                          </div>
                        )}

                        {waypointPos === 0 && (
                          <div className="rounded-xl bg-[#140b05] border border-[#8c6d23]/40 p-2.5 text-[11px]">
                            <span className="text-emerald-400 font-semibold">Telah membaca instruksi & petunjuk kasus.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Time Info */}
                  <div className="border-t border-[#8c6d23]/30 pt-2 flex items-center justify-between text-[10px] text-[#c4a46a]">
                    <span>Waktu Pengerjaan: {staseData?.timeSpentFormatted || "-"}</span>
                    {staseData?.score && (
                      <span className="font-bold text-[#fde047]">Skor: {staseData.score} Poin</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#8c6d23]/40 pt-3.5 mt-4 flex items-center justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="h-9 px-5 text-xs font-serif font-bold bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 rounded-xl"
          >
            Tutup Dialog
          </Button>
        </div>
      </div>
    </div>
  );
}
