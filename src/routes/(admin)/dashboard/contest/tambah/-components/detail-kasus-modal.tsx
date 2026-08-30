import * as React from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  FileText,
  HeartHandshake,
  Image as ImageIcon,
  Layers,
  ListChecks,
  ShieldAlert,
  User,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";

interface DetailKasusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kasus: Kasus | null;
}

export function DetailKasusModal({ open, onOpenChange, kasus }: DetailKasusModalProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);
  const [activeStase, setActiveStase] = React.useState<number>(1);

  if (!kasus) return null;

  const staseData = kasus.stase_data;
  const totalPasien = kasus.pasien_ids?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-[95vw] sm:max-w-5xl flex-col overflow-hidden p-0 gap-0 border-border/80 shadow-2xl"
      >
        {/* Header with seamless close button */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-5 py-3.5 bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>{kasus.nama}</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {kasus.id}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Detail ringkasan skenario klinis dan struktur 5 stase ujian OSCE.
              </DialogDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Tutup (Esc)"
          >
            <X className="size-4" />
            <span className="sr-only">Tutup</span>
          </Button>
        </DialogHeader>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* 1. Summary Card with Collapsible Expand Button */}
          <div className="flex flex-col rounded-xl border border-border/80 bg-muted/10 p-4 shadow-2xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm text-foreground">{kasus.nama}</span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="gap-1 text-[10px] font-semibold">
                    <Users className="size-3" /> {totalPasien} Subjek Pasien
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold",
                      kasus.has_perekam_nilai
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : "text-muted-foreground",
                    )}
                  >
                    {kasus.has_perekam_nilai ? "Dilengkapi Perekam Nilai" : "Tanpa Perekam Nilai"}
                  </Badge>
                  <span className="text-[11px] font-medium text-primary">
                    &bull; 5 Pos Sirkuit Ujian
                  </span>
                </div>
              </div>

              {/* Collapsible Toggle Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsExpanded((prev) => !prev)}
                className="h-7 gap-1.5 text-xs font-semibold self-start sm:self-auto bg-background"
              >
                <span>{isDetailsExpanded ? "Sembunyikan Info Lengkap" : "Lihat Info Lengkap & Atribut"}</span>
                {isDetailsExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </Button>
            </div>

            {/* Collapsible Details: Description, Intro text, Attributes */}
            {isDetailsExpanded && (
              <div className="mt-3.5 pt-3.5 border-t border-border/60 flex flex-col gap-3 animate-in fade-in duration-200 text-xs">
                {kasus.deskripsi && (
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">Deskripsi Skenario:</span>
                    <p className="text-muted-foreground leading-relaxed">{kasus.deskripsi}</p>
                  </div>
                )}

                {kasus.teks_perkenalan && (
                  <div className="flex flex-col gap-1 rounded-lg bg-background p-2.5 border">
                    <span className="font-semibold text-foreground">Teks Perkenalan Kasus:</span>
                    <p className="italic text-muted-foreground leading-relaxed">&ldquo;{kasus.teks_perkenalan}&rdquo;</p>
                  </div>
                )}

                {kasus.atribut && kasus.atribut.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-foreground">Atribut Khusus Kasus:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {kasus.atribut.map((attr) => (
                        <Badge key={attr.id} variant="outline" className="bg-background text-xs py-0.5">
                          <strong className="font-semibold text-foreground mr-1">{attr.key}:</strong> {attr.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Wizard Pos / Stase Explorer */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" /> Penjelajah Struktur Pos & Stase Soal
              </h4>
              <span className="text-[11px] text-muted-foreground">Pilih pos untuk melihat detail instrumen</span>
            </div>

            {/* Stase Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { num: 1, name: "Pos 1: Interaktif dengan AI", icon: Bot, color: "text-blue-500" },
                { num: 2, name: "Pos 2: Multi Select Jawaban", icon: ShieldAlert, color: "text-amber-500" },
                { num: 3, name: "Pos 3: Mengurutkan Langkah", icon: ListChecks, color: "text-purple-500" },
                { num: 4, name: "Pos 4: Single Choice Image", icon: ImageIcon, color: "text-emerald-500" },
                { num: 5, name: "Pos 5: Interaktif dengan AI", icon: HeartHandshake, color: "text-rose-500" },
              ].map((st) => {
                const Icon = st.icon;
                const isActive = activeStase === st.num;

                return (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => setActiveStase(st.num)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                        : "border-border/70 bg-muted/20 hover:bg-muted/50 text-foreground",
                    )}
                  >
                    <Icon className={cn("size-3.5", isActive ? "text-primary-foreground" : st.color)} />
                    <span>{st.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Stase Details Content */}
            <div className="mt-2 rounded-xl border border-border/70 bg-muted/10 p-3.5 text-xs flex flex-col gap-3">
              {/* Pos 1 */}
              {activeStase === 1 && staseData?.stase1 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-foreground">{staseData.stase1.header?.nama_stase || "Pos 1: Interaktif dengan AI"}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        Amplop: {staseData.stase1.header?.kode_amplop || "-"}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        Durasi: {staseData.stase1.header?.durasi_menit ?? 7} Menit
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-muted-foreground">Petunjuk Soal:</span>
                    <p className="text-foreground leading-relaxed">{staseData.stase1.header?.petunjuk_soal || "-"}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="font-semibold text-foreground">
                      Daftar Trigger Pertanyaan AI ({staseData.stase1.triggers?.length || 0}):
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {(staseData.stase1.triggers ?? []).map((trg, i) => (
                        <div key={trg.id} className="rounded-lg bg-background p-2.5 border flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">#{i + 1} {trg.konteks}</span>
                            <Badge variant="outline" className="text-[10px] font-bold text-primary">
                              +{trg.skor} Poin
                            </Badge>
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground">Keywords: {trg.keyword}</span>
                          {trg.jawaban_cadangan && (
                            <span className="text-[11px] text-muted-foreground italic">
                              Fallback: &ldquo;{trg.jawaban_cadangan}&rdquo;
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pos 2 */}
              {activeStase === 2 && staseData?.stase2 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-foreground">{staseData.stase2.header?.nama_stase || "Pos 2: Multi Select Jawaban"}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Durasi: {staseData.stase2.header?.durasi_menit ?? 5} Menit
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-muted-foreground">Petunjuk Soal:</span>
                    <p className="text-foreground leading-relaxed">{staseData.stase2.header?.petunjuk_soal || "-"}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="font-semibold text-foreground">
                      Daftar Faktor Risiko / Pilihan ({staseData.stase2.faktor_risiko?.length || 0}):
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(staseData.stase2.faktor_risiko ?? []).map((item, i) => (
                        <div key={item.id} className="rounded-lg bg-background p-2.5 border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">#{i + 1} {item.nama_risiko}</span>
                            {item.is_kunci_jawaban && (
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
                                Kunci
                              </Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            +{item.skor_bobot} Poin
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pos 3 */}
              {activeStase === 3 && staseData?.stase3 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-foreground">{staseData.stase3.header?.nama_stase || "Pos 3: Mengurutkan Langkah"}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Durasi: {staseData.stase3.header?.durasi_menit ?? 7} Menit
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-muted-foreground">Petunjuk Soal:</span>
                    <p className="text-foreground leading-relaxed">{staseData.stase3.header?.petunjuk_soal || "-"}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="font-semibold text-foreground">
                      Urutan Langkah Prosedur ({staseData.stase3.langkah_prosedur?.length || 0}):
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(staseData.stase3.langkah_prosedur ?? []).map((st) => (
                        <div key={st.id} className="rounded-lg bg-background p-2.5 border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-[10px]">#{st.no_urut}</Badge>
                            <span className="text-foreground">{st.deskripsi_langkah}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold text-primary shrink-0">
                            +{st.skor_bobot} Poin
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pos 4 */}
              {activeStase === 4 && staseData?.stase4 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-foreground">{staseData.stase4.header?.nama_stase || "Pos 4: Single Choice Image"}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Durasi: {staseData.stase4.header?.durasi_menit ?? 5} Menit
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-muted-foreground">Petunjuk Soal:</span>
                    <p className="text-foreground leading-relaxed">{staseData.stase4.header?.petunjuk_soal || "-"}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="font-semibold text-foreground">
                      Pilihan Jawaban ({staseData.stase4.pilihan_jawaban?.length || 0}):
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(staseData.stase4.pilihan_jawaban ?? []).map((opt) => (
                        <div
                          key={opt.id}
                          className={cn(
                            "rounded-lg p-2.5 border flex items-center justify-between",
                            opt.is_correct ? "bg-emerald-500/10 border-emerald-500/40" : "bg-background",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant={opt.is_correct ? "default" : "outline"} className="font-mono text-[10px]">
                              {opt.id.toUpperCase()}
                            </Badge>
                            <span className={cn("text-xs", opt.is_correct && "font-bold text-emerald-800 dark:text-emerald-300")}>
                              {opt.teks_pilihan}
                            </span>
                          </div>
                          {opt.is_correct && (
                            <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                              <CheckCircle2 className="size-3" /> Kunci Jawaban (+{opt.skor_bobot} Poin)
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pos 5 */}
              {activeStase === 5 && staseData?.stase5 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-foreground">{staseData.stase5.header?.nama_stase || "Pos 5: Interaktif dengan AI"}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Durasi: {staseData.stase5.header?.durasi_menit ?? 7} Menit
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-muted-foreground">Petunjuk Soal:</span>
                    <p className="text-foreground leading-relaxed">{staseData.stase5.header?.petunjuk_soal || "-"}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="font-semibold text-foreground">
                      Trigger Asuhan & Konseling ({staseData.stase5.triggers?.length || 0}):
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(staseData.stase5.triggers ?? []).map((trg, i) => (
                        <div key={trg.id} className="rounded-lg bg-background p-2.5 border flex items-center justify-between">
                          <span className="font-medium text-foreground">#{i + 1} {trg.konteks}</span>
                          <Badge variant="outline" className="text-[10px] font-bold text-primary">
                            +{trg.skor} Poin
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
