import * as React from "react";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  HeartHandshake,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Magnet,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Trophy,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { KelompokRekapData } from "./rekap-data";

interface KelompokStaseAnswersCardProps {
  kelompok: KelompokRekapData;
}

export function KelompokStaseAnswersCard({ kelompok }: KelompokStaseAnswersCardProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Group Info Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border bg-muted/30 p-5 shadow-xs">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary text-primary-foreground font-serif font-bold text-xs">
              {kelompok.nama}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Peringkat {kelompok.rank} dari 2
            </Badge>
            <Badge
              className={
                kelompok.predikat === "Sangat Kompeten"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold"
              }
            >
              {kelompok.predikat}
            </Badge>
          </div>

          <h2 className="text-lg sm:text-xl font-serif font-black text-foreground">
            {kelompok.kasusNama}
          </h2>

          {/* Members List */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-1">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Users className="size-3.5 text-primary" /> Anggota Tim:
            </span>
            {kelompok.anggota.map((m) => (
              <span key={m.id} className="bg-background px-2 py-0.5 rounded-md border text-[11px]">
                <strong>{m.nama}</strong> ({m.peran} &bull; {m.nim})
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-0.5 shrink-0 self-start sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
          <span className="text-[11px] text-muted-foreground font-medium">Total Akumulasi 5 Pos</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-black text-primary">
              {kelompok.totalAkumulasi}
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ 500 Poin</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Rata-rata: <strong className="text-foreground">{kelompok.rataRataSkor.toFixed(1)}</strong>/100 &bull; ⏱️ {kelompok.waktuPengerjaan}
          </span>
        </div>
      </div>

      {/* 5 POS DETAILED CARDS */}

      {/* ============================================================ */}
      {/* 1. POS 1: ANAMNESIS                                       */}
      {/* ============================================================ */}
      <Card className="shadow-xs border-primary/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Bot className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                  <span>Pos 1: Anamnesis Klinis Terarah Pasien</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Wawancara interaktif keluhan keputihan, perdarahan pasca senggama, dan riwayat ginekologi Ny. Ani.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge className="bg-primary text-primary-foreground font-mono font-bold text-xs px-2.5 py-0.5">
                Skor: {kelompok.stase1.totalSkor} / {kelompok.stase1.maxSkor}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Keywords Found Checklist */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <CheckCircle2 className="size-3.5 text-primary" /> Analisis Keyword Klinis Terdeteksi:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {kelompok.stase1.keywordsFound.map((kw, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-3 flex flex-col justify-between gap-1.5 transition-colors ${kw.isMatched
                    ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                    : "bg-muted/40 border-dashed border-muted-foreground/30 text-muted-foreground"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground font-mono">
                      {kw.kategori}
                    </span>
                    {kw.isMatched ? (
                      <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 gap-0.5">
                        <Check className="size-2.5" /> +{kw.skor} Poin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-[9px] px-1.5 py-0">
                        Terlewat (0 Poin)
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-semibold leading-snug">
                    {kw.keyword}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript Dialogue Accordion/Box */}
          <div className="rounded-xl border bg-muted/10 p-4 flex flex-col gap-3">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <MessageSquare className="size-3.5 text-primary" /> Rekaman Transkrip Wawancara Bidan & Pasien:
            </span>
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
              {kelompok.stase1.transcripts.map((t, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 rounded-xl p-3 text-xs leading-relaxed ${t.sender === "bidan"
                    ? "bg-primary/10 border border-primary/20 self-end max-w-[90%]"
                    : "bg-background border self-start max-w-[90%]"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="font-bold uppercase text-foreground">
                      {t.sender === "bidan" ? "Bidan (Peserta)" : "Ny. Ani (Pasien Virtual)"}
                    </span>
                    <span>{t.timestamp}</span>
                  </div>
                  <p className="text-foreground text-xs">{t.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluator Note */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground flex items-start gap-2">
            <span className="font-bold text-primary shrink-0">Catatan Juri:</span>
            <span>{kelompok.stase1.evaluatorNote}</span>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* 2. POS 2: IDENTIFIKASI FAKTOR RISIKO                         */}
      {/* ============================================================ */}
      <Card className="shadow-xs border-amber-500/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                  <span>Pos 2: Identifikasi Faktor Risiko (Papan Magnet)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Penempelan kartu faktor risiko keganasan serviks yang teridentifikasi dari riwayat pasien.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge className="bg-amber-600 text-white font-mono font-bold text-xs px-2.5 py-0.5">
                Skor: {kelompok.stase2.totalSkor} / {kelompok.stase2.maxSkor}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <Magnet className="size-3.5 text-amber-600" /> Kartu yang Ditempelkan ke Papan Magnet:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {kelompok.stase2.selectedCards.map((c, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">{c.nama}</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px] px-1.5 py-0 shrink-0">
                    +{c.skor} Poin
                  </Badge>
                </div>
              ))}

              {kelompok.stase2.missedCards.map((mc, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-3 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <XCircle className="size-4 text-destructive shrink-0" />
                    <span className="text-xs text-muted-foreground line-through truncate">{mc}</span>
                  </div>
                  <Badge variant="outline" className="border-destructive/40 text-destructive text-[10px] px-1.5 py-0 shrink-0">
                    Terlewat (0 Poin)
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluator Note */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-foreground flex items-start gap-2">
            <span className="font-bold text-amber-700 dark:text-amber-300 shrink-0">Catatan Juri:</span>
            <span>{kelompok.stase2.evaluatorNote}</span>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* 3. POS 3: PENYUSUNAN PROSEDUR IVA                            */}
      {/* ============================================================ */}
      <Card className="shadow-xs border-blue-500/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-xs">
                <Layers className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                  <span>Pos 3: Penyusunan Prosedur Standar Tindakan IVA</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Urutan kronologis langkah pemeriksaan IVA sesuai standar operasional prosedur Kemenkes RI.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-0.5">
                Skor: {kelompok.stase3.totalSkor} / {kelompok.stase3.maxSkor}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <Layers className="size-3.5 text-blue-600" /> Hasil Urutan Alur SOP yang Disusun:
            </span>

            <div className="flex flex-col gap-2">
              {kelompok.stase3.arrangedSteps.map((step, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-3 flex items-center justify-between gap-3 text-xs ${step.isExactPosition
                    ? "bg-muted/30 border-border"
                    : "bg-amber-500/5 border-amber-500/30"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      className={
                        step.isExactPosition
                          ? "bg-primary text-primary-foreground font-mono font-black text-xs px-2 py-0.5 shrink-0"
                          : "bg-amber-600 text-white font-mono font-black text-xs px-2 py-0.5 shrink-0"
                      }
                    >
                      Step #{step.order}
                    </Badge>
                    <span className="text-foreground font-medium leading-snug">
                      {step.namaLangkah}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {step.isExactPosition ? (
                      <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 gap-1">
                        <Check className="size-3" /> Tepat (SOP #{step.expectedOrder})
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] px-2 py-0.5 gap-1">
                        <AlertCircle className="size-3" /> Harusnya SOP #{step.expectedOrder}
                      </Badge>
                    )}
                    <span className="font-mono text-xs font-bold text-foreground">
                      +{step.skor} Poin
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluator Note */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-foreground flex items-start gap-2">
            <span className="font-bold text-blue-700 dark:text-blue-300 shrink-0">Catatan Juri:</span>
            <span>{kelompok.stase3.evaluatorNote}</span>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* 4. POS 4: INTERPRETASI VISUAL & DIAGNOSIS                    */}
      {/* ============================================================ */}
      <Card className="shadow-xs border-emerald-500/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <ImageIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                  <span>Pos 4: Interpretasi Temuan Visual & Kesimpulan Klinis</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Analisis foto porsio serviks pasca aplikasi asam asetat 3-5% dan pemilihan diagnosis.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5">
                Skor: {kelompok.stase4.totalSkor} / {kelompok.stase4.maxSkor}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Answer Selected */}
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-bold">
                Pilihan Jawaban Kelompok:
              </span>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5">
                  Jawaban Benar ✅
                </Badge>
              </div>
              <p className="text-sm font-bold text-foreground font-serif leading-snug">
                {kelompok.stase4.optionLabel}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {kelompok.stase4.diagnosisSummary}
              </p>
            </div>

            {/* Visual Criteria Checklist */}
            <div className="rounded-2xl border bg-muted/20 p-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider font-serif">
                Parameter Evaluasi Temuan Serviks:
              </span>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Plak epitel asetowhite tebal & opak berbatas tegas.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Lesi menyentuh Sambungan Skuamo-Kolumnar (SSK).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Lesi meluas melebihi 75% kuadran porsio serviks.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Evaluator Note */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-foreground flex items-start gap-2">
            <span className="font-bold text-emerald-700 dark:text-emerald-300 shrink-0">Catatan Juri:</span>
            <span>{kelompok.stase4.evaluatorNote}</span>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* 5. POS 5: ASUHAN KEBIDANAN & KONSELING EMPATIK               */}
      {/* ============================================================ */}
      <Card className="shadow-xs border-rose-500/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-xs">
                <HeartHandshake className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                  <span>Pos 5: Asuhan Kebidanan & Konseling Empatik</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Penyampaian hasil IVA positif, penanganan lesi pra-kanker, dan rencana rujukan SpOG secara terapeutik.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge className="bg-rose-600 text-white font-mono font-bold text-xs px-2.5 py-0.5">
                Skor: {kelompok.stase5.totalSkor} / {kelompok.stase5.maxSkor}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Counseling Criteria Met */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <CheckCircle2 className="size-3.5 text-rose-600" /> Rubrik Parameter Konseling Empati:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {kelompok.stase5.counselingCriteria.map((crit, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-3 flex flex-col justify-between gap-1.5 ${crit.isFulfilled
                    ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                    : "bg-amber-500/5 border-amber-500/30 text-foreground"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold leading-snug">{crit.kriteria}</span>
                    <Badge
                      className={
                        crit.isFulfilled
                          ? "bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0"
                          : "bg-amber-600 text-white font-mono text-[9px] px-1.5 py-0"
                      }
                    >
                      +{crit.skor}/{crit.maxSkor} Poin
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{crit.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript Box */}
          <div className="rounded-xl border bg-muted/10 p-4 flex flex-col gap-3">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <MessageSquare className="size-3.5 text-rose-600" /> Transkrip Wawancara Konseling Asuhan:
            </span>
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
              {kelompok.stase5.transcripts.map((t, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 rounded-xl p-3 text-xs leading-relaxed ${t.sender === "bidan"
                    ? "bg-rose-500/10 border border-rose-500/20 self-end max-w-[90%]"
                    : "bg-background border self-start max-w-[90%]"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="font-bold uppercase text-foreground">
                      {t.sender === "bidan" ? "Bidan (Peserta)" : "Ny. Ani (Pasien Virtual)"}
                    </span>
                    <span>{t.timestamp}</span>
                  </div>
                  <p className="text-foreground text-xs">{t.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluator Note */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-foreground flex items-start gap-2">
            <span className="font-bold text-rose-700 dark:text-rose-300 shrink-0">Catatan Juri:</span>
            <span>{kelompok.stase5.evaluatorNote}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
