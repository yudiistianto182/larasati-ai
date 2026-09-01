import * as React from "react";
import {
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  HeartHandshake,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Magnet,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KUNCI_JAWABAN_STANDAR } from "./rekap-data";

export function KunciJawabanReferenceSection() {
  const k = KUNCI_JAWABAN_STANDAR;

  return (
    <div className="flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex flex-col gap-1.5 rounded-2xl border bg-primary/5 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary text-primary-foreground font-serif font-bold text-xs gap-1">
            <BookOpen className="size-3" />
            <span>Kunci Jawaban & Rubrik Standar Evaluasi</span>
          </Badge>
          <Badge variant="outline" className="text-xs font-mono">
            Dewan Penguji OSCE Kebidanan
          </Badge>
        </div>
        <h2 className="text-lg sm:text-xl font-serif font-black text-foreground">
          Standar Emas Penilaian 5 Pos Sirkuit OSCE Larasati Journey
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
          Dokumen acuan resmi kunci jawaban, indikator kompetensi minimal, dan alokasi pembobotan skor setiap pos untuk verifikasi objektivitas penilaian peserta.
        </p>
      </div>

      {/* POS 1 KUNCI */}
      <Card className="shadow-xs border-primary/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Bot className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold">
                  {k.stase1.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {k.stase1.petunjuk} &bull; Durasi: {k.stase1.durasi}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              {k.stase1.bobotTotal}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider font-serif">
            Daftar Keyword Wajib Anamnesis Klinis:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {k.stase1.kunciPoin.map((item, i) => (
              <div key={i} className="rounded-xl border bg-muted/20 p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    {item.nama}
                  </span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono shrink-0">
                    +{item.bobot} Poin
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* POS 2 KUNCI */}
      <Card className="shadow-xs border-amber-500/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold">
                  {k.stase2.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {k.stase2.petunjuk} &bull; Durasi: {k.stase2.durasi}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-amber-700 dark:text-amber-300 border-amber-500/30">
              {k.stase2.bobotTotal}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider font-serif">
              Kartu Faktor Risiko yang Benar (Wajib Ditempel ke Papan Magnet):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {k.stase2.kunciPoin.map((item, i) => (
                <div key={i} className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                      {item.nama}
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-mono shrink-0">
                      +{item.bobot} Poin
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                    {item.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-3 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Kartu Distraktor / Pengecoh (Salah Jika Ditempel):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {k.stase2.distraktors.map((d, i) => (
                <Badge key={i} variant="outline" className="text-muted-foreground text-xs font-normal">
                  ❌ {d}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* POS 3 KUNCI */}
      <Card className="shadow-xs border-blue-500/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-xs">
                <Layers className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold">
                  {k.stase3.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {k.stase3.petunjuk} &bull; Durasi: {k.stase3.durasi}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-blue-700 dark:text-blue-300 border-blue-500/30">
              {k.stase3.bobotTotal}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider font-serif">
            Urutan Baku 6 Langkah Standar Operasional Prosedur (SOP):
          </span>
          <div className="flex flex-col gap-2">
            {k.stase3.kunciPoin.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border bg-muted/20 p-3 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <Badge className="bg-primary text-primary-foreground font-mono font-bold text-xs px-2 py-0.5 shrink-0">
                    SOP #{item.step}
                  </Badge>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-foreground leading-snug">{item.nama}</span>
                    <span className="text-[11px] text-muted-foreground leading-relaxed">{item.keterangan}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-semibold shrink-0">
                  +{item.bobot} Poin
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* POS 4 KUNCI */}
      <Card className="shadow-xs border-emerald-500/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <ImageIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold">
                  {k.stase4.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {k.stase4.petunjuk} &bull; Durasi: {k.stase4.durasi}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
              {k.stase4.bobotTotal}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Kunci Jawaban Resmi:
              </span>
              <Badge className="bg-emerald-600 text-white font-mono text-xs">
                +{k.stase4.bobotBenar} Poin
              </Badge>
            </div>
            <p className="text-base font-serif font-bold text-foreground">
              {k.stase4.jawabanBenar}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              <strong>Pembahasan Klinis: </strong>
              {k.stase4.pembahasan}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* POS 5 KUNCI */}
      <Card className="shadow-xs border-rose-500/20">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-xs">
                <HeartHandshake className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-serif font-bold">
                  {k.stase5.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {k.stase5.petunjuk} &bull; Durasi: {k.stase5.durasi}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-rose-700 dark:text-rose-300 border-rose-500/30">
              {k.stase5.bobotTotal}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider font-serif">
            Rubrik Parameter Penilaian Konseling Empatik:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {k.stase5.kunciPoin.map((item, i) => (
              <div key={i} className="rounded-xl border bg-muted/20 p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-rose-600 shrink-0" />
                    {item.nama}
                  </span>
                  <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 text-[10px] font-mono shrink-0">
                    +{item.bobot} Poin
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
