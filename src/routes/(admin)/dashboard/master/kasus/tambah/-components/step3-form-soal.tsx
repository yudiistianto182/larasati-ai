import * as React from "react";
import { ArrowLeft, ArrowRight, Award, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StaseSoalData } from "../../-components/data";

import { StaseHeaderForm } from "./step3-soal/stase-header-form";
import { StaseNavigator } from "./step3-soal/stase-navigator";
import { Stase1AnamnesisAi } from "./step3-soal/stase1-anamnesis-ai";
import { Stase2FaktorRisiko } from "./step3-soal/stase2-faktor-risiko";
import { Stase3ProsedurIva } from "./step3-soal/stase3-prosedur-iva";
import { Stase4Interpretasi } from "./step3-soal/stase4-interpretasi";
import { Stase5AsuhanKebidanan } from "./step3-soal/stase5-asuhan-kebidanan";

interface Step3FormSoalProps {
  staseData: StaseSoalData;
  onStaseDataChange: (data: StaseSoalData) => void;
}

export function Step3FormSoal({
  staseData,
  onStaseDataChange,
}: Step3FormSoalProps) {
  const [activeStase, setActiveStase] = React.useState<1 | 2 | 3 | 4 | 5>(1);

  // Total accumulated score calculation across all 5 stases
  const totalScoreStase1 = staseData.stase1.triggers.reduce((acc, t) => acc + (Number(t.skor) || 0), 0);
  const totalScoreStase2 = staseData.stase2.faktor_risiko.reduce((acc, f) => acc + (Number(f.skor) || 0), 0);
  const totalScoreStase3 = staseData.stase3.langkah_prosedur.reduce((acc, l) => acc + (Number(l.skor) || 0), 0);
  const totalScoreStase4 = staseData.stase4.pilihan_jawaban.find((o) => o.is_correct)?.skor || 0;
  const totalScoreStase5 = staseData.stase5.triggers.reduce((acc, t) => acc + (Number(t.skor) || 0), 0);
  const grandTotalScore = totalScoreStase1 + totalScoreStase2 + totalScoreStase3 + totalScoreStase4 + totalScoreStase5;

  const handlePrevStase = () => {
    if (activeStase > 1) {
      setActiveStase((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleNextStase = () => {
    if (activeStase < 5) {
      setActiveStase((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Step 3: Rangkaian Soal Kasus Klinis (5 Stase Ujian)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Kelola instrumen soal ujian komprehensif yang terbagi ke dalam 5 pos stase kebidanan mandiri.
          </p>
        </div>

        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-semibold self-start sm:self-auto shadow-2xs">
          <Award className="size-3.5 text-primary" />
          <span>Akumulasi Skor Ujian: <strong className="text-primary font-bold">{grandTotalScore} Poin</strong></span>
        </Badge>
      </div>

      {/* Station Tabs / Navigator */}
      <StaseNavigator
        activeStase={activeStase}
        onStaseChange={setActiveStase}
        staseData={staseData}
      />

      {/* Universal Station Header (Nama, Kode Amplop, Durasi, Petunjuk) */}
      {activeStase === 1 && (
        <StaseHeaderForm
          header={staseData.stase1.header}
          onChange={(header) => onStaseDataChange({ ...staseData, stase1: { ...staseData.stase1, header } })}
          staseNumber={1}
        />
      )}
      {activeStase === 2 && (
        <StaseHeaderForm
          header={staseData.stase2.header}
          onChange={(header) => onStaseDataChange({ ...staseData, stase2: { ...staseData.stase2, header } })}
          staseNumber={2}
        />
      )}
      {activeStase === 3 && (
        <StaseHeaderForm
          header={staseData.stase3.header}
          onChange={(header) => onStaseDataChange({ ...staseData, stase3: { ...staseData.stase3, header } })}
          staseNumber={3}
        />
      )}
      {activeStase === 4 && (
        <StaseHeaderForm
          header={staseData.stase4.header}
          onChange={(header) => onStaseDataChange({ ...staseData, stase4: { ...staseData.stase4, header } })}
          staseNumber={4}
        />
      )}
      {activeStase === 5 && (
        <StaseHeaderForm
          header={staseData.stase5.header}
          onChange={(header) => onStaseDataChange({ ...staseData, stase5: { ...staseData.stase5, header } })}
          staseNumber={5}
        />
      )}

      {/* Active Specialized Station Builder */}
      {activeStase === 1 && (
        <Stase1AnamnesisAi
          aiSystemPrompt={staseData.stase1.ai_system_prompt}
          onAiSystemPromptChange={(prompt) =>
            onStaseDataChange({
              ...staseData,
              stase1: { ...staseData.stase1, ai_system_prompt: prompt },
            })
          }
          triggers={staseData.stase1.triggers}
          onChange={(triggers) => onStaseDataChange({ ...staseData, stase1: { ...staseData.stase1, triggers } })}
        />
      )}

      {activeStase === 2 && (
        <Stase2FaktorRisiko
          faktorRisiko={staseData.stase2.faktor_risiko}
          onChange={(faktor_risiko) => onStaseDataChange({ ...staseData, stase2: { ...staseData.stase2, faktor_risiko } })}
          stase1Triggers={staseData.stase1.triggers}
        />
      )}

      {activeStase === 3 && (
        <Stase3ProsedurIva
          langkahProsedur={staseData.stase3.langkah_prosedur}
          onChange={(langkah_prosedur) => onStaseDataChange({ ...staseData, stase3: { ...staseData.stase3, langkah_prosedur } })}
        />
      )}

      {activeStase === 4 && (
        <Stase4Interpretasi
          images={staseData.stase4.images}
          onImagesChange={(images) => onStaseDataChange({ ...staseData, stase4: { ...staseData.stase4, images } })}
          pilihanJawaban={staseData.stase4.pilihan_jawaban}
          onPilihanJawabanChange={(pilihan_jawaban) => onStaseDataChange({ ...staseData, stase4: { ...staseData.stase4, pilihan_jawaban } })}
        />
      )}

      {activeStase === 5 && (
        <Stase5AsuhanKebidanan
          aiSystemPrompt={staseData.stase5.ai_system_prompt}
          onAiSystemPromptChange={(prompt) =>
            onStaseDataChange({
              ...staseData,
              stase5: { ...staseData.stase5, ai_system_prompt: prompt },
            })
          }
          triggers={staseData.stase5.triggers}
          onChange={(triggers) => onStaseDataChange({ ...staseData, stase5: { ...staseData.stase5, triggers } })}
        />
      )}

      {/* Intra-Station Footer Controls */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePrevStase}
          disabled={activeStase === 1}
          className="h-7 gap-1 text-xs"
        >
          <ArrowLeft className="size-3" />
          <span>Stase Sebelumnya</span>
        </Button>

        <span className="text-[11px] font-semibold text-muted-foreground">
          Stase {activeStase} dari 5 Selesai Dikonfigurasi
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNextStase}
          disabled={activeStase === 5}
          className="h-7 gap-1 text-xs"
        >
          <span>Stase Berikutnya</span>
          <ArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}
