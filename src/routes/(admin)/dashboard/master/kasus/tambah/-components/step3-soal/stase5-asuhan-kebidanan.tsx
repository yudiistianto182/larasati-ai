import * as React from "react";
import { HeartHandshake, MessageSquare, Play, Plus, Sparkles, Trash2, UserCog } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveAiConsultationModal } from "@/components/ai-consultation/interactive-ai-consultation-modal";
import type { AiKeywordTrigger } from "../../../-components/data";

interface Stase5AsuhanKebidananProps {
  aiSystemPrompt: string;
  onAiSystemPromptChange: (prompt: string) => void;
  triggers: AiKeywordTrigger[];
  onChange: (triggers: AiKeywordTrigger[]) => void;
}

const QUICK_ASUHAN_SUGGESTIONS = [
  "Penjelasan Makna Hasil IVA Positif Secara Empatik",
  "Konseling Pilihan Terapi Krioterapi",
  "Alur Rujukan ke Dokter Spesialis Obstetri & Ginekologi",
  "Edukasi Pencegahan & Hubungan Seksual Sehat",
  "Instruksi Jadwal Kunjungan & Pemeriksaan Ulang",
];

export function Stase5AsuhanKebidanan({
  aiSystemPrompt,
  onAiSystemPromptChange,
  triggers,
  onChange,
}: Stase5AsuhanKebidananProps) {
  const [showPromptDetails, setShowPromptDetails] = React.useState(true);
  const [isSimModalOpen, setIsSimModalOpen] = React.useState(false);

  const handleAddTrigger = (suggestedContext?: string) => {
    const newTrg: AiKeywordTrigger = {
      id: `trg-ash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      konteks: suggestedContext || "",
      keyword: "",
      skor: 15,
      jawaban_cadangan: "",
    };
    onChange([...triggers, newTrg]);
  };

  const handleRemoveTrigger = (id: string) => {
    onChange(triggers.filter((t) => t.id !== id));
  };

  const handleTriggerChange = (
    id: string,
    field: keyof AiKeywordTrigger,
    val: string | number,
  ) => {
    onChange(
      triggers.map((t) => (t.id === id ? { ...t, [field]: val } : t)),
    );
  };

  const totalScore = triggers.reduce((acc, t) => acc + (Number(t.skor) || 0), 0);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-2xs">
      {/* Header with Live Simulation Test Button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-rose-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500 text-white shadow-xs">
            <HeartHandshake className="size-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Pos 5: Interaktif dengan (Asuhan & Konseling Pasien)
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Tentukan parameter konseling pasca pemeriksaan dan evaluasi respon empati bidan saat berinteraksi dengan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Test Simulation Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => setIsSimModalOpen(true)}
            className="h-7 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
          >
            <Play className="size-3 fill-current" />
            <span>Uji Simulasi Konseling</span>
          </Button>

          <Badge variant="outline" className="h-7 bg-background text-xs font-semibold text-rose-600 dark:text-rose-400">
            Total: {totalScore} Poin
          </Badge>
        </div>
      </div>

      {/* 1. Kepribadian System (System Persona Prompt) */}
      <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <Label htmlFor="stase5-ai-prompt" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <UserCog className="size-3.5 text-rose-500" /> Kepribadian System (Karakter Pasien Pasca Pemeriksaan)
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setShowPromptDetails((prev) => !prev)}
              className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
            >
              {showPromptDetails ? "Sembunyikan" : "Tampilkan Detail"}
            </Button>
          </div>
        </div>

        {showPromptDetails && (
          <div className="flex flex-col gap-1.5 pt-1">
            <Textarea
              id="stase5-ai-prompt"
              rows={6}
              value={aiSystemPrompt}
              onChange={(e) => onAiSystemPromptChange(e.target.value)}
              placeholder="Masukkan instruksi kepribadian, kekhawatiran pasien, dan batasan respon..."
              className="text-xs leading-relaxed font-mono bg-muted/20"
            />
            <span className="text-[10px] text-muted-foreground">
              Instruksi ini akan mengarahkan respon emosional pasien saat menerima konseling dan rencana rujukan/terapi.
            </span>
          </div>
        )}
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="size-3 text-rose-500" /> Saran asuhan & konseling:
        </span>
        {QUICK_ASUHAN_SUGGESTIONS.map((sug) => (
          <Badge
            key={sug}
            variant="outline"
            className="cursor-pointer bg-background hover:bg-accent text-[11px] font-normal transition-colors"
            onClick={() => handleAddTrigger(sug)}
          >
            + {sug}
          </Badge>
        ))}
      </div>

      {/* 2. Trigger Items List with Offline Fallback Response */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <MessageSquare className="size-3.5 text-primary" /> Daftar Trigger Konseling & Jawaban Cadangan:
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {triggers.length} Rule Terdaftar
          </span>
        </div>

        {triggers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-background/50 py-6 text-center text-xs text-muted-foreground">
            Belum ada trigger asuhan. Klik tombol di bawah untuk menambahkan rule konseling.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {triggers.map((trg, index) => (
              <div
                key={trg.id}
                className="flex flex-col gap-2.5 rounded-xl border border-border/70 bg-card p-3 shadow-2xs transition-all hover:border-border"
              >
                {/* Top row: Context, Keywords, Score, Delete */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.5fr_1.8fr_90px_auto] sm:items-center">
                  <div className="flex flex-col gap-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground sm:hidden">
                      Konteks #{index + 1}
                    </Label>
                    <Input
                      placeholder="Konteks Asuhan (e.g. Makna Hasil IVA Positif)"
                      value={trg.konteks}
                      onChange={(e) => handleTriggerChange(trg.id, "konteks", e.target.value)}
                      className="h-8 text-xs font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground sm:hidden">
                      Keyword Trigger
                    </Label>
                    <Input
                      placeholder="Keyword Pemantik (e.g. bukan kanker, sembuh total, krioterapi)"
                      value={trg.keyword}
                      onChange={(e) => handleTriggerChange(trg.id, "keyword", e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground sm:hidden">
                      Skor
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Skor"
                      value={trg.skor}
                      onChange={(e) => handleTriggerChange(trg.id, "skor", Number(e.target.value) || 0)}
                      className="h-8 text-center text-xs font-bold"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-self-end sm:justify-self-auto"
                    onClick={() => handleRemoveTrigger(trg.id)}
                    title="Hapus rule"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                {/* Bottom row: Jawaban Cadangan (Offline Response) */}
                <div className="grid grid-cols-1 gap-1 border-t border-border/40 pt-2">
                  <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="size-3 text-muted-foreground" /> Jawaban Cadangan (Offline Fallback Response):
                  </Label>
                  <Input
                    placeholder="Respon pasien jika poin konseling ini disampaikan (fallback)..."
                    value={trg.jawaban_cadangan || ""}
                    onChange={(e) => handleTriggerChange(trg.id, "jawaban_cadangan", e.target.value)}
                    className="h-8 text-xs bg-muted/20"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full-width Rectangular Add Button */}
        <Button
          type="button"
          variant="outline"
          className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-rose-500/40 bg-background text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-rose-500 hover:bg-rose-500/5 hover:text-rose-600 active:scale-[0.99]"
          onClick={() => handleAddTrigger()}
        >
          <Plus className="size-4 text-rose-500" />
          <span>Tambah Trigger Asuhan Kebidanan</span>
        </Button>
      </div>

      {/* Interactive Teleconsultation Simulation Modal */}
      <InteractiveAiConsultationModal
        open={isSimModalOpen}
        onOpenChange={setIsSimModalOpen}
        staseTitle="Simulasi Stase 5: Asuhan Kebidanan & Konseling"
        patientName="Ny. Ani"
        patientAge={29}
        patientParity="G2P1A0"
        avatarUrl="/images/ny_ani_patient_torso.jpg"
        backgroundUrl="/images/puskesmas_clinic_empty.jpg"
        aiSystemPrompt={aiSystemPrompt}
        triggers={triggers}
      />
    </div>
  );
}
