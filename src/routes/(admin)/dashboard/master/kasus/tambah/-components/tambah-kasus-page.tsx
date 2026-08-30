import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useKasusStore } from "@/stores/kasus-store";
import { createDefaultStaseSoalData, type KasusAttribute, type StaseSoalData } from "../../-components/data";

import { Step1InformasiDasar } from "./step1-informasi-dasar";
import { Step2PilihPasien } from "./step2-pilih-pasien";
import { Step3FormSoal } from "./step3-form-soal";
import { Step4PerekamNilai } from "./step4-perekam-nilai";
import { WizardStepIndicator } from "./wizard-step-indicator";

interface TambahKasusPageProps {
  editKasusId?: string;
}

export function TambahKasusPage({ editKasusId }: TambahKasusPageProps) {
  const navigate = useNavigate();
  const { addKasus, updateKasus, getKasusById } = useKasusStore();

  const isEditing = Boolean(editKasusId);
  const existingKasus = editKasusId ? getKasusById(editKasusId) : undefined;

  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [maxStepReached, setMaxStepReached] = React.useState<number>(isEditing ? 4 : 1);

  // Form State across steps
  // Step 1: Base info & dynamic attributes
  const [nama, setNama] = React.useState(existingKasus?.nama || "");
  const [deskripsi, setDeskripsi] = React.useState(existingKasus?.deskripsi || "");
  const [teksPerkenalan, setTeksPerkenalan] = React.useState(existingKasus?.teks_perkenalan || "");
  const [atribut, setAtribut] = React.useState<KasusAttribute[]>(
    existingKasus?.atribut?.map((a) => ({ ...a })) || [
      { id: `k-attr-${Date.now()}-1`, key: "Diagnosis Utama", value: "" },
      { id: `k-attr-${Date.now()}-2`, key: "Tingkat Kegawatan", value: "" },
    ],
  );

  // Step 2: Patient selection
  const [selectedPasienIds, setSelectedPasienIds] = React.useState<string[]>(
    existingKasus?.pasien_ids || ["PSN-001"],
  );

  // Step 3: Complete 5-Station Examination Data
  const [staseData, setStaseData] = React.useState<StaseSoalData>(
    existingKasus?.stase_data || createDefaultStaseSoalData(),
  );

  // Step 4: Score recorder option
  const [hasPerekamNilai, setHasPerekamNilai] = React.useState<boolean>(
    existingKasus ? existingKasus.has_perekam_nilai : true,
  );

  // If editKasusId changes or loads after mount
  React.useEffect(() => {
    if (existingKasus) {
      setNama(existingKasus.nama);
      setDeskripsi(existingKasus.deskripsi);
      setTeksPerkenalan(existingKasus.teks_perkenalan);
      setAtribut(existingKasus.atribut?.map((a) => ({ ...a })) || []);
      setSelectedPasienIds(existingKasus.pasien_ids || []);
      setStaseData(existingKasus.stase_data || createDefaultStaseSoalData());
      setHasPerekamNilai(existingKasus.has_perekam_nilai);
      setMaxStepReached(4);
    }
  }, [existingKasus]);

  // Validation per step
  const canProceedStep1 = nama.trim().length > 0;
  const canProceedStep2 = true;
  const canProceedStep3 = true; // All 5 stases have defaults or interactive entries

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1) return;
    if (currentStep === 3 && !canProceedStep3) return;

    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMaxStepReached((prev) => Math.max(prev, nextStep));
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= maxStepReached) {
      setCurrentStep(stepId);
    }
  };

  const handleSaveKasus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setCurrentStep(1);
      return;
    }

    // Clean attributes
    const cleanAtribut = atribut
      .map((a) => ({ ...a, key: a.key.trim(), value: a.value.trim() }))
      .filter((a) => a.key.length > 0 || a.value.length > 0);

    if (isEditing && editKasusId) {
      updateKasus(editKasusId, {
        nama: nama.trim(),
        deskripsi: deskripsi.trim(),
        teks_perkenalan: teksPerkenalan.trim(),
        atribut: cleanAtribut,
        pasien_ids: selectedPasienIds,
        stase_data: staseData,
        has_perekam_nilai: hasPerekamNilai,
      });
    } else {
      addKasus({
        nama: nama.trim(),
        deskripsi: deskripsi.trim(),
        teks_perkenalan: teksPerkenalan.trim(),
        atribut: cleanAtribut,
        pasien_ids: selectedPasienIds,
        stase_data: staseData,
        has_perekam_nilai: hasPerekamNilai,
      });
    }

    // Navigate back to kasus list
    navigate({ to: "/dashboard/master/kasus" });
  };

  return (
    <div className="flex flex-col gap-5 pb-10 w-full">
      {/* Header with back navigation */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            nativeButton={false}
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-lg"
            render={<Link to="/dashboard/master/kasus" />}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {isEditing ? "Ubah Data Kasus" : "Tambah Kasus Baru"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? `Memperbarui konfigurasi skenario ${existingKasus?.id || ""}, keterlibatan pasien, dan 5 stase ujian melalui wizard terstruktur.`
                : "Konfigurasi skenario klinis, integrasi pasien, dan instrumen penilaian 5 stase melalui 4 langkah mudah."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            render={<Link to="/dashboard/master/kasus" />}
          >
            Batal
          </Button>
        </div>
      </div>

      {/* Eye-catching Wizard Step Indicator */}
      <WizardStepIndicator
        currentStep={currentStep}
        onStepClick={handleStepClick}
        maxStepReached={maxStepReached}
      />

      {/* Wizard Step Content Card */}
      <Card className="border shadow-xs">
        <CardContent className="p-5 md:p-7">
          {currentStep === 1 && (
            <Step1InformasiDasar
              nama={nama}
              onNamaChange={setNama}
              deskripsi={deskripsi}
              onDeskripsiChange={setDeskripsi}
              teksPerkenalan={teksPerkenalan}
              onTeksPerkenalanChange={setTeksPerkenalan}
              atribut={atribut}
              onAtributChange={setAtribut}
            />
          )}

          {currentStep === 2 && (
            <Step2PilihPasien
              selectedPasienIds={selectedPasienIds}
              onSelectedPasienIdsChange={setSelectedPasienIds}
            />
          )}

          {currentStep === 3 && (
            <Step3FormSoal
              staseData={staseData}
              onStaseDataChange={setStaseData}
            />
          )}

          {currentStep === 4 && (
            <Step4PerekamNilai
              hasPerekamNilai={hasPerekamNilai}
              onHasPerekamNilaiChange={setHasPerekamNilai}
              nama={nama}
              deskripsi={deskripsi}
              atribut={atribut}
              selectedPasienCount={selectedPasienIds.length}
              staseData={staseData}
            />
          )}

          {/* Footer Action Buttons */}
          <div className="mt-8 flex items-center justify-between border-t pt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="h-8 gap-1.5 text-xs"
            >
              <ArrowLeft className="size-3.5" /> Sebelumnya
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 3 && !canProceedStep3)
                  }
                  className="h-8 gap-1.5 text-xs font-semibold"
                >
                  <span>Lanjut ke Step {currentStep + 1}</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveKasus}
                  disabled={!nama.trim()}
                  className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Save className="size-3.5" />
                  <span>{isEditing ? "Simpan Perubahan" : "Simpan Kasus"}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
