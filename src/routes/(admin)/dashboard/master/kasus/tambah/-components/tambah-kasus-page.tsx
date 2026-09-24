import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKasusStore } from "@/stores/kasus-store";
import { triggerErrorAlert } from "@/stores/error-alert-store";
import {
  caseService,
  buildCaseFormData,
  extractNumericCaseId,
} from "@/services/api";
import {
  createDefaultStaseSoalData,
  type KasusAttribute,
  type StaseSoalData,
} from "../../-components/data";

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
  const { addKasus, updateKasus, getKasusDetail, fetchKasus } = useKasusStore();

  const isEditing = Boolean(editKasusId);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState<boolean>(isEditing);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [maxStepReached, setMaxStepReached] = React.useState<number>(isEditing ? 4 : 1);

  // Form State across steps
  // Step 1: Base info & dynamic attributes
  const [nama, setNama] = React.useState("");
  const [deskripsi, setDeskripsi] = React.useState("");
  const [teksPerkenalan, setTeksPerkenalan] = React.useState("");
  const [atribut, setAtribut] = React.useState<KasusAttribute[]>([
    { id: `k-attr-${Date.now()}-1`, key: "Diagnosis Utama", value: "" },
    { id: `k-attr-${Date.now()}-2`, key: "Tingkat Kegawatan", value: "" },
  ]);

  // Step 2: Patient selection
  const [selectedPasienIds, setSelectedPasienIds] = React.useState<string[]>([]);

  // Step 3: Complete 5-Station Examination Data
  const [staseData, setStaseData] = React.useState<StaseSoalData>(createDefaultStaseSoalData());

  // Step 4: Score recorder option
  const [hasPerekamNilai, setHasPerekamNilai] = React.useState<boolean>(true);

  // Fetch full detail from backend API when editKasusId is present
  React.useEffect(() => {
    if (!editKasusId) {
      setIsLoadingDetail(false);
      return;
    }

    let isMounted = true;
    setIsLoadingDetail(true);

    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingDetail(false);
      }
    }, 10000);

    getKasusDetail(editKasusId)
      .then((detail) => {
        if (!isMounted) return;
        if (detail) {
          setNama(detail.nama || "");
          setDeskripsi(detail.deskripsi || "");
          setTeksPerkenalan(detail.teks_perkenalan || "");
          setAtribut(detail.atribut?.map((a) => ({ ...a })) || []);
          setSelectedPasienIds(detail.pasien_ids || []);
          setStaseData(detail.stase_data || createDefaultStaseSoalData());
          setHasPerekamNilai(detail.has_perekam_nilai);
          setMaxStepReached(4);
        } else {
          triggerErrorAlert(
            "Kasus Tidak Ditemukan",
            `Data kasus dengan ID ${editKasusId} tidak ditemukan di server.`,
            404
          );
        }
      })
      .catch((err) => {
        console.error("[TambahKasusPage] Gagal memuat detail kasus:", err);
        triggerErrorAlert(
          "Gagal Memuat Data Kasus",
          err?.message || "Terjadi kesalahan saat mengambil rincian kasus dari server.",
          500
        );
      })
      .finally(() => {
        clearTimeout(safetyTimer);
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [editKasusId, getKasusDetail]);

  // Validation per step
  const canProceedStep1 = nama.trim().length > 0;
  const canProceedStep3 = true;

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

  const handleSaveKasus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setCurrentStep(1);
      return;
    }

    // Clean attributes
    const cleanAtribut = atribut
      .map((a) => ({ ...a, key: a.key.trim(), value: a.value.trim() }))
      .filter((a) => a.key.length > 0 || a.value.length > 0);

    const kasusPayload = {
      nama: nama.trim(),
      deskripsi: deskripsi.trim(),
      teks_perkenalan: teksPerkenalan.trim(),
      atribut: cleanAtribut,
      pasien_ids: selectedPasienIds,
      stase_data: staseData,
      has_perekam_nilai: hasPerekamNilai,
    };

    setIsSaving(true);

    const mapStase2SyaratTriggers = (payload: typeof kasusPayload, detail: any) => {
      if (!detail?.quest || !Array.isArray(detail.quest)) {
        return payload;
      }
      const questStase1 = detail.quest.find(
        (q: any) => q.casequest_method_id === 1 || q.casequest_order === 1
      );
      const dbTriggers: any[] = questStase1?.trigger || [];

      const updatedFaktorRisiko = payload.stase_data.stase2.faktor_risiko.map((item) => {
        if (!item.syarat_id || item.syarat_id === "tanpa_syarat" || item.syarat_id === "0") {
          return { ...item, syarat_id: "0" };
        }

        // Cari trigger stase 1 di state frontend yang dipilih
        const feTrigger = payload.stase_data.stase1.triggers.find(
          (t) => String(t.id) === String(item.syarat_id)
        );

        if (!feTrigger) {
          // Jika syarat_id sudah berupa ID numerik DB yang cocok langsung
          const directMatch = dbTriggers.find((dbt) => String(dbt.casequestiatrigger_id) === String(item.syarat_id));
          if (directMatch) return item;
          return { ...item, syarat_id: "0" };
        }

        // Cocokkan berdasarkan nama (konteks) atau keyword atau urutan index
        const feIdx = payload.stase_data.stase1.triggers.indexOf(feTrigger);
        const matchedDbTrg =
          dbTriggers.find(
            (dbt) =>
              (dbt.casequestiatrigger_name &&
                dbt.casequestiatrigger_name.trim().toLowerCase() === feTrigger.konteks.trim().toLowerCase()) ||
              (dbt.casequestiatrigger_key &&
                dbt.casequestiatrigger_key.trim().toLowerCase() === feTrigger.keyword.trim().toLowerCase())
          ) || (feIdx >= 0 ? dbTriggers[feIdx] : undefined);

        if (matchedDbTrg?.casequestiatrigger_id) {
          return {
            ...item,
            syarat_id: String(matchedDbTrg.casequestiatrigger_id),
          };
        }

        return { ...item, syarat_id: "0" };
      });

      return {
        ...payload,
        stase_data: {
          ...payload.stase_data,
          stase2: {
            ...payload.stase_data.stase2,
            faktor_risiko: updatedFaktorRisiko,
          },
        },
      };
    };

    try {
      if (isEditing && editKasusId) {
        const cleanId = extractNumericCaseId(editKasusId);

        // 1. Tembak PUT awal dengan forceZeroRequiredId agar tidak bentrok foreign key
        const initialFormData = buildCaseFormData(kasusPayload, { forceZeroRequiredId: true });
        try {
          const res = await caseService.update(cleanId, initialFormData);
          if (!res?.status) {
            console.warn("[TambahKasusPage] Initial Update API status false:", res?.message);
          }
        } catch (apiErr: any) {
          console.warn("[TambahKasusPage] Initial Update API warning:", apiErr);
          const errorMsg = apiErr?.message || "";
          if (typeof errorMsg === "string" && errorMsg.includes("foreign key constraint fails")) {
            throw apiErr;
          }
        }

        // 2. GET detail case by id
        let detailData: any = null;
        try {
          const detailRes = await caseService.getDetail(cleanId);
          if (detailRes?.data) {
            detailData = detailRes.data;
          }
        } catch (fetchErr) {
          console.warn("[TambahKasusPage] getDetail warning:", fetchErr);
        }

        // 3. Mapping data stase 2 trigger by DB trigger ID
        const finalKasusPayload = mapStase2SyaratTriggers(kasusPayload, detailData);

        // 4. PUT kembali dengan required_id yang sudah ter-mapping
        try {
          const updatedFormData = buildCaseFormData(finalKasusPayload, { forceZeroRequiredId: false });
          await caseService.update(cleanId, updatedFormData);
        } catch (putErr) {
          console.warn("[TambahKasusPage] PUT update syarat id warning:", putErr);
        }

        updateKasus(editKasusId, finalKasusPayload);
        try {
          await fetchKasus();
        } catch {
          // Ignore
        }
        navigate({ to: "/dashboard/master/kasus" });
      } else {
        // 1. Tembak POST data kasus dengan forceZeroRequiredId
        const initialFormData = buildCaseFormData(kasusPayload, { forceZeroRequiredId: true });
        let createRes: any = null;
        try {
          createRes = await caseService.create(initialFormData);
          if (!createRes?.status) {
            console.warn("[TambahKasusPage] Create API status false:", createRes?.message);
          }
        } catch (apiErr: any) {
          console.warn("[TambahKasusPage] Create API warning:", apiErr);
        }

        // Dapatkan case_id dari response
        let newCaseId: string | number | undefined =
          createRes?.data?.case_id ||
          createRes?.data?.id ||
          createRes?.case_id ||
          createRes?.id;

        // 2. GET detail case by id
        let detailData: any = null;
        if (createRes?.data && typeof createRes.data === "object" && Array.isArray(createRes.data.quest)) {
          detailData = createRes.data;
        } else if (newCaseId) {
          try {
            const detailRes = await caseService.getDetail(extractNumericCaseId(newCaseId));
            if (detailRes?.status && detailRes.data) {
              detailData = detailRes.data;
            }
          } catch (fetchErr) {
            console.warn("[TambahKasusPage] getDetail warning:", fetchErr);
          }
        } else {
          // Fallback lacak dari getAll jika ID tidak ada langsung
          try {
            const listRes = await caseService.getAll();
            const rawList = Array.isArray(listRes.data)
              ? listRes.data
              : (listRes.data as any)?.data || [];
            const found = rawList.find((c: any) => c.case_name === nama.trim());
            if (found?.case_id) {
              newCaseId = found.case_id;
              const detailRes = await caseService.getDetail(found.case_id);
              if (detailRes?.data) detailData = detailRes.data;
            }
          } catch {
            // Ignore
          }
        }

        // 3. Mapping data stase 2 trigger by DB trigger ID
        const finalKasusPayload = mapStase2SyaratTriggers(kasusPayload, detailData);

        // 4. PUT dengan payload yang sudah ter-mapping
        if (newCaseId) {
          try {
            const updatedFormData = buildCaseFormData(finalKasusPayload, { forceZeroRequiredId: false });
            await caseService.update(extractNumericCaseId(newCaseId), updatedFormData);
          } catch (putErr) {
            console.warn("[TambahKasusPage] PUT update syarat id warning:", putErr);
          }
        }

        addKasus(finalKasusPayload);
        try {
          await fetchKasus();
        } catch {
          // Ignore
        }
        navigate({ to: "/dashboard/master/kasus" });
      }
    } catch (err: any) {
      console.error("[TambahKasusPage] Error saat menyimpan kasus:", err);
      let errorMsg = err?.message || "Terjadi kesalahan jaringan saat menyimpan kasus.";

      // Jika error foreign key karena ada riwayat response peserta
      if (typeof errorMsg === "string" && errorMsg.includes("foreign key constraint fails")) {
        errorMsg = "Kasus ini telah memiliki riwayat sesi ujian atau jawaban peserta (transaksi response), sehingga komponen trigger/stase tidak dapat diubah secara langsung demi integritas data riwayat ujian.";
      }

      triggerErrorAlert(
        isEditing ? "Pembaruan Kasus Dibatasi" : "Gagal Membuat Kasus",
        errorMsg,
        err?.statusCode || 400
      );
    } finally {
      setIsSaving(false);
    }
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
                ? `Memperbarui konfigurasi skenario ${editKasusId || ""}, keterlibatan pasien, dan 5 stase ujian melalui wizard terstruktur.`
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
          {isLoadingDetail ? (
            <div className="flex flex-col gap-5 py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Mengambil rincian data kasus dan konfigurasi 5 stase dari server...
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-full max-w-md rounded-lg" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            </div>
          ) : (
            <>
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
                  disabled={currentStep === 1 || isSaving}
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
                      disabled={!nama.trim() || isSaving}
                      className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5" />
                          <span>{isEditing ? "Simpan Perubahan" : "Simpan Kasus"}</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
