import * as React from "react";
import {
  Activity,
  Award,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  Headphones,
  ImageIcon,
  ListChecks,
  Lock,
  Magnet,
  Mic,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  Volume2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GroupRaceState, StaseDetailData } from "./liveview-types";
import { CIRCUIT_WAYPOINTS } from "./liveview-types";

interface GroupStaseDetailViewProps {
  group: GroupRaceState;
  onClose: () => void;
}

export function GroupStaseDetailView({ group, onClose }: GroupStaseDetailViewProps) {
  const [expandedStase, setExpandedStase] = React.useState<number>(
    group.pos > 0 && group.pos <= 5 ? group.pos : 1,
  );

  const stasesList = [1, 2, 3, 4, 5].map((pos) => {
    return (
      group.staseData[pos] || {
        pos,
        name: `Pos 0${pos}`,
        kodeAmplop: `AMP-0${pos}`,
        status: group.pos >= pos ? (group.pos === pos ? "in_progress" : "completed") : "locked",
        maxScore: 100,
        timeSpentFormatted: "-",
        summaryAnswer: "Belum ada data pengerjaan.",
      }
    );
  });

  // Calculate live total score from completed & in_progress stases
  const totalScoreSum = stasesList.reduce((acc, st) => acc + (st.score || 0), 0);

  return (
    <div className="size-full flex flex-col rounded-3xl border-2 border-[#d4af37]/80 bg-[#160e08]/95 backdrop-blur-md p-4 sm:p-6 shadow-2xl text-[#fef08a] select-none overflow-hidden">
      {/* 1. Header Bar: Team Demographics & Close Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#8c6d23]/40 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "size-12 rounded-2xl flex items-center justify-center font-serif font-black text-xl border-2 shrink-0 shadow-lg",
              group.borderClass,
            )}
            style={{ backgroundColor: `${group.color}25`, color: group.color }}
          >
            0{group.groupNum}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#fff8db]">
                {group.name}
              </h2>
              <Badge
                className={cn(
                  "text-[10px] font-bold shadow-xs",
                  group.pos === 5
                    ? "bg-emerald-500 text-black animate-bounce"
                    : group.pos > 0
                      ? "bg-[#d4af37] text-black"
                      : "bg-[#251b11] text-[#d4af37] border border-[#8c6d23]",
                )}
              >
                {group.pos === 5 ? "🏆 FINISH" : `Pos Aktif: 0${group.pos} / 05`}
              </Badge>
            </div>
            <span className="text-xs text-[#d4af37]/80">
              Inspeksi Jawaban & Telemetri Live &bull; Nilai Total Akumulasi:{" "}
              <strong className="text-[#fde047] text-sm">{totalScoreSum}</strong> Poin
            </span>
          </div>
        </div>

        {/* Right Actions: Back to Circuit Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-serif font-bold tracking-wider bg-[#261b11] text-[#fde047] border-[#d4af37]/60 hover:bg-[#382313] hover:text-white rounded-xl shadow-md gap-1.5 cursor-pointer"
          >
            <X className="size-4 text-[#d4af37]" />
            <span>Tutup & Kembali ke Peta</span>
          </Button>
        </div>
      </div>

      {/* 2. Scrollable Stases Detail List (Pos 1 s.d. Pos 5) */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1.5 scrollbar-thin scrollbar-thumb-[#8c6d23]/50">
        {stasesList.map((stase) => {
          const isPassed = group.pos > stase.pos;
          const isLive = group.pos === stase.pos && group.pos > 0;
          const isLocked = group.pos < stase.pos;
          const isExpanded = expandedStase === stase.pos;

          return (
            <div
              key={stase.pos}
              className={cn(
                "rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-md",
                isLive
                  ? "border-[#fde047] bg-gradient-to-r from-[#382412]/95 via-[#23160a]/95 to-[#160d06]/95 ring-2 ring-[#fde047]/50 shadow-[0_0_25px_rgba(253,224,71,0.25)]"
                  : isPassed
                    ? "border-[#d4af37]/60 bg-[#20150d]/85"
                    : "border-[#8c6d23]/30 bg-[#140d07]/60 opacity-60",
              )}
            >
              {/* Accordion Stase Header Row */}
              <div
                onClick={() => !isLocked && setExpandedStase(isExpanded ? 0 : stase.pos)}
                className={cn(
                  "flex items-center justify-between p-3.5 sm:p-4 gap-3 select-none",
                  !isLocked ? "cursor-pointer hover:bg-[#2e1d10]/40" : "cursor-not-allowed",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Indicator Icon */}
                  <div
                    className={cn(
                      "size-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm",
                      isPassed
                        ? "bg-gradient-to-br from-[#8c6d23] to-[#d4af37] text-black"
                        : isLive
                          ? "bg-[#fde047] text-black animate-pulse"
                          : "bg-[#1f140c] text-[#8c6d23]/70 border border-[#8c6d23]/40",
                    )}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="size-4 text-emerald-950 stroke-[3]" />
                    ) : isLive ? (
                      <Activity className="size-4 text-black animate-spin" />
                    ) : (
                      <Lock className="size-3.5" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-xs sm:text-sm text-[#fff8db] truncate">
                        {stase.name}
                      </span>
                      <Badge variant="outline" className="text-[9px] font-mono border-[#8c6d23]/50 text-[#d4af37] bg-[#140e08]">
                        {stase.kodeAmplop}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-[#e6cf9b]/80 line-clamp-1 mt-0.5">
                      {isLive ? (
                        <span className="text-[#fde047] font-semibold animate-pulse">
                          ⚡ Sedang Dikerjakan: {stase.liveActivity}
                        </span>
                      ) : isPassed ? (
                        <span>Jawaban: {stase.summaryAnswer}</span>
                      ) : (
                        <span className="italic text-muted-foreground">Menunggu giliran stase</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: Score Badge & Expand Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  {isPassed && stase.score !== undefined && (
                    <Badge className="bg-[#d4af37] text-black font-extrabold text-xs px-2.5 py-1 shadow-xs">
                      Nilai: {stase.score} / {stase.maxScore}
                    </Badge>
                  )}

                  {isLive && (
                    <Badge className="bg-amber-400 text-black font-extrabold text-xs px-2.5 py-1 animate-pulse">
                      Live Skor: {stase.score || 70}
                    </Badge>
                  )}

                  {!isLocked && (
                    <div className="size-6 rounded-lg bg-[#291b10] flex items-center justify-center text-[#d4af37]">
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                  )}
                </div>
              </div>

              {/* Accordion Expanded Detail Content */}
              {isExpanded && !isLocked && (
                <div className="border-t border-[#8c6d23]/40 bg-[#180f08]/90 p-4 sm:p-5 flex flex-col gap-3.5">
                  {/* Pos 1 & Pos 5: Chat Dialogue Transcript */}
                  {stase.details?.type === "chat" && stase.details.chatMessages && (
                    <div className="flex flex-col gap-2 rounded-xl border border-[#8c6d23]/40 bg-[#120a05] p-3.5">
                      <span className="text-xs font-serif font-bold text-[#d4af37] flex items-center gap-1.5">
                        <Bot className="size-3.5" /> Transkrip Wawancara Suara & Dialog:
                      </span>
                      <div className="space-y-2 mt-1 max-h-48 overflow-y-auto pr-1">
                        {stase.details.chatMessages.map((msg, mIdx) => (
                          <div
                            key={mIdx}
                            className={cn(
                              "p-2.5 rounded-xl text-xs leading-relaxed max-w-[90%]",
                              msg.sender === "Bidan"
                                ? "ml-auto bg-[#382512] text-[#fff8db] border border-[#d4af37]/40 font-medium"
                                : "mr-auto bg-[#20140b] text-[#e6d59c] border border-[#8c6d23]/30",
                            )}
                          >
                            <span className="font-bold text-[10px] block opacity-75 mb-0.5">
                              {msg.sender}:
                            </span>
                            <p>{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pos 2: Magnet Board Pinned Factors */}
                  {stase.details?.type === "magnet" && stase.details.items && (
                    <div className="flex flex-col gap-2 rounded-xl border border-[#8c6d23]/40 bg-[#120a05] p-3.5">
                      <span className="text-xs font-serif font-bold text-[#d4af37] flex items-center gap-1.5">
                        <Magnet className="size-3.5" /> Kartu Faktor Risiko yang Tertempel di Papan Magnet:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {stase.details.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-[#d4af37] bg-gradient-to-r from-[#8c6d23]/30 to-[#d4af37]/20 text-xs font-bold text-[#fff8db] shadow-xs"
                          >
                            <CheckCircle2 className="size-3.5 text-[#d4af37] shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pos 3: Ordered SOP Sequence */}
                  {stase.details?.type === "sequence" && stase.details.items && (
                    <div className="flex flex-col gap-2 rounded-xl border border-[#8c6d23]/40 bg-[#120a05] p-3.5">
                      <span className="text-xs font-serif font-bold text-[#d4af37] flex items-center gap-1.5">
                        <ListChecks className="size-3.5" /> Urutan Langkah Prosedur IVA:
                      </span>
                      <div className="space-y-1.5 mt-1">
                        {stase.details.items.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-2.5 p-2 rounded-xl border border-[#8c6d23]/50 bg-[#22160d] text-xs text-[#fff8db]"
                          >
                            <span className="size-5 rounded-md bg-[#d4af37] text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                              0{sIdx + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pos 4: Selected MCQ Diagnosis */}
                  {stase.details?.type === "mcq" && (
                    <div className="flex flex-col gap-2 rounded-xl border border-[#8c6d23]/40 bg-[#120a05] p-3.5">
                      <span className="text-xs font-serif font-bold text-[#d4af37] flex items-center gap-1.5">
                        <ImageIcon className="size-3.5" /> Pilihan Kesimpulan Diagnosis MCQ:
                      </span>
                      <div className="p-3 rounded-xl border-2 border-[#d4af37] bg-gradient-to-r from-[#8c6d23]/40 to-[#d4af37]/20 text-xs font-bold text-[#fff8db] flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-[#d4af37] shrink-0" />
                        <span>{stase.details.selectedOption}</span>
                      </div>
                    </div>
                  )}

                  {/* Pos 6: Audio Recording Status */}
                  {stase.details?.type === "audio" && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#8c6d23]/40 bg-[#120a05] p-3.5 text-xs">
                      <div className="flex items-center gap-2">
                        <Headphones className="size-4 text-[#d4af37]" />
                        <span>Rekaman Laporan Suara ({stase.details.audioDuration})</span>
                      </div>
                      <Badge className="bg-[#d4af37] text-black font-bold text-[10px]">
                        Tersedia untuk Penguji
                      </Badge>
                    </div>
                  )}

                  {/* Live Activity Pulsing Strip (if currently in progress) */}
                  {isLive && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-500/60 bg-amber-950/40 text-xs text-amber-200 animate-pulse">
                      <Activity className="size-3.5 text-amber-400" />
                      <span>
                        <strong>Sedang Berlangsung:</strong> Peserta sedang aktif berinteraksi pada stase ini. Data jawaban dan perolehan skor diperbarui secara live.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
