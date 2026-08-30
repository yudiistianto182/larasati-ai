import * as React from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck,
  Link2,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type Contest,
  type KelompokLomba,
  useContestStore,
} from "@/stores/contest-store";
import { fallbackContestPeriodes } from "../../-components/data";
import { Step1InfoLomba } from "./step1-info-lomba";
import { Step2PilihKasus } from "./step2-pilih-kasus";
import { Step3KelompokMahasiswa } from "./step3-kelompok-mahasiswa";
import { Step4TautkanKasus } from "./step4-tautkan-kasus";
import { Step5PilihPenilai } from "./step5-pilih-penilai";

interface WizardStep {
  number: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    number: 1,
    title: "Info Dasar",
    subtitle: "Nama, Periode & Jadwal",
    icon: Trophy,
  },
  {
    number: 2,
    title: "Pilih Kasus",
    subtitle: "Skenario Ujian Klinis",
    icon: FileCheck,
  },
  {
    number: 3,
    title: "Kelompok & Mhs",
    subtitle: "Distribusi Peserta & Ketua",
    icon: Users,
  },
  {
    number: 4,
    title: "Tautkan Kasus",
    subtitle: "Mapping Kasus-Kelompok",
    icon: Link2,
  },
  {
    number: 5,
    title: "Pilih Penilai",
    subtitle: "Penguji & Instruktur",
    icon: ShieldCheck,
  },
];

export function TambahContestPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search: any = useSearch({ strict: false });
  const editContestId = search?.contestId as string | undefined;

  const { addContest, updateContest, getContestById } = useContestStore();

  const isEditing = Boolean(editContestId);
  const existingContest = editContestId ? getContestById(editContestId) : undefined;

  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [maxStepReached, setMaxStepReached] = React.useState<number>(1);

  // Form State: Step 1
  const [nama, setNama] = React.useState(existingContest?.nama || "");
  const [periodeId, setPeriodeId] = React.useState<number>(
    existingContest?.periode_id || fallbackContestPeriodes[0].periode_id,
  );
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    existingContest
      ? {
          from: new Date(existingContest.tanggal_mulai),
          to: new Date(existingContest.tanggal_selesai),
        }
      : undefined,
  );
  const [deskripsi, setDeskripsi] = React.useState(existingContest?.deskripsi || "");

  // Form State: Step 2
  const [selectedKasusIds, setSelectedKasusIds] = React.useState<string[]>(
    existingContest?.kasus_ids || ["KSS-001"],
  );

  // Form State: Step 3
  const [kelompokList, setKelompokList] = React.useState<KelompokLomba[]>(
    existingContest?.kelompok_list || [
      {
        id: "kel-init-1",
        nama: "Kelompok A (Stase Pagi)",
        mahasiswa_ids: ["mhs-01", "mhs-02"],
        ketua_mhs_id: "mhs-01",
        kasus_id: "KSS-001",
      },
      {
        id: "kel-init-2",
        nama: "Kelompok B (Stase Siang)",
        mahasiswa_ids: ["mhs-03", "mhs-04"],
        ketua_mhs_id: "mhs-03",
        kasus_id: "KSS-001",
      },
    ],
  );

  // Form State: Step 4
  const [allowSharedKasus, setAllowSharedKasus] = React.useState<boolean>(
    existingContest?.allow_shared_kasus ?? false,
  );

  // Form State: Step 5
  const [selectedPenilaiIds, setSelectedPenilaiIds] = React.useState<string[]>(
    existingContest?.penilai_ids || ["pnl-01", "pnl-02"],
  );

  // Prepopulate form if existingContest loaded later
  React.useEffect(() => {
    if (existingContest) {
      setNama(existingContest.nama);
      setPeriodeId(existingContest.periode_id);
      setDateRange({
        from: new Date(existingContest.tanggal_mulai),
        to: new Date(existingContest.tanggal_selesai),
      });
      setDeskripsi(existingContest.deskripsi);
      setSelectedKasusIds(existingContest.kasus_ids || []);
      setKelompokList(existingContest.kelompok_list || []);
      setAllowSharedKasus(existingContest.allow_shared_kasus ?? false);
      setSelectedPenilaiIds(existingContest.penilai_ids || ["pnl-01"]);
      setMaxStepReached(5);
    }
  }, [existingContest]);

  const handleStepClick = (stepNum: number) => {
    if (stepNum <= maxStepReached) {
      setCurrentStep(stepNum);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStep1Valid =
    nama.trim().length > 0 &&
    Boolean(dateRange?.from) &&
    Boolean(dateRange?.to);

  const isStep2Valid = selectedKasusIds.length > 0;
  const isStep3Valid =
    kelompokList.length > 0 &&
    kelompokList.every((k) => k.nama.trim().length > 0 && k.mahasiswa_ids.length > 0);
  const isStep4Valid = kelompokList.every((k) => Boolean(k.kasus_id));
  const isStep5Valid = selectedPenilaiIds.length > 0;

  const isCurrentStepValid = () => {
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep2Valid;
    if (currentStep === 3) return isStep3Valid;
    if (currentStep === 4) return isStep4Valid;
    if (currentStep === 5) return isStep5Valid;
    return true;
  };

  const handleSave = () => {
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      return;
    }

    const periodeObj = fallbackContestPeriodes.find((p) => p.periode_id === periodeId);
    const startDate = dateRange?.from ? dateRange.from.toISOString() : new Date().toISOString();
    const endDate = dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString();

    const contestPayload = {
      nama: nama.trim(),
      periode_id: periodeId,
      periode_nama: periodeObj?.periode_name || `Periode ${periodeId}`,
      tanggal_mulai: startDate,
      tanggal_selesai: endDate,
      deskripsi: deskripsi.trim(),
      kasus_ids: selectedKasusIds,
      kelompok_list: kelompokList,
      allow_shared_kasus: allowSharedKasus,
      penilai_ids: selectedPenilaiIds,
      status: "Sedang Berlangsung" as const,
    };

    if (isEditing && editContestId) {
      updateContest(editContestId, contestPayload);
    } else {
      addContest(contestPayload);
    }

    navigate({ to: "/dashboard/contest" });
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
            render={<Link to="/dashboard/contest" />}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {isEditing ? "Ubah Data Lomba" : "Tambah Lomba Baru"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? `Memperbarui konfigurasi agenda ${existingContest?.id || ""}, distribusi kelompok, dan dewan penilai melalui wizard terstruktur.`
                : "Konfigurasi agenda kompetisi klinis, pemilihan kasus, pembagian kelompok mahasiswa, dan penugasan penilai melalui 5 langkah mudah."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            render={<Link to="/dashboard/contest" />}
          >
            Batal
          </Button>
        </div>
      </div>

      {/* Eye-catching Modern 5-Step Wizard Indicator */}
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 min-w-[720px]">
          {WIZARD_STEPS.map((step) => {
            const isCurrent = currentStep === step.number;
            const isCompleted = maxStepReached > step.number;
            const isAccessible = step.number <= maxStepReached;
            const Icon = step.icon;

            return (
              <button
                type="button"
                key={step.number}
                onClick={() => handleStepClick(step.number)}
                disabled={!isAccessible}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all select-none shadow-2xs",
                  isCurrent
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs"
                    : isCompleted
                      ? "border-border/80 bg-card hover:bg-muted/40 cursor-pointer"
                      : "border-border/60 bg-muted/20 opacity-60 cursor-not-allowed",
                )}
              >
                {/* Step Number / Icon Badge */}
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs transition-colors shadow-2xs",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="size-4 stroke-[3]" /> : <Icon className="size-4" />}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Langkah 0{step.number}
                  </span>
                  <span className="font-bold text-xs text-foreground truncate">
                    {step.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate hidden lg:inline">
                    {step.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Content Container */}
      <div className="flex flex-col gap-4">
        {currentStep === 1 && (
          <Step1InfoLomba
            nama={nama}
            onNamaChange={setNama}
            periodeId={periodeId}
            onPeriodeIdChange={setPeriodeId}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            deskripsi={deskripsi}
            onDeskripsiChange={setDeskripsi}
          />
        )}

        {currentStep === 2 && (
          <Step2PilihKasus
            selectedKasusIds={selectedKasusIds}
            onChange={setSelectedKasusIds}
          />
        )}

        {currentStep === 3 && (
          <Step3KelompokMahasiswa
            kelompokList={kelompokList}
            onChange={setKelompokList}
          />
        )}

        {currentStep === 4 && (
          <Step4TautkanKasus
            selectedKasusIds={selectedKasusIds}
            kelompokList={kelompokList}
            allowSharedKasus={allowSharedKasus}
            onAllowSharedKasusChange={setAllowSharedKasus}
            onKelompokListChange={setKelompokList}
          />
        )}

        {currentStep === 5 && (
          <Step5PilihPenilai
            selectedPenilaiIds={selectedPenilaiIds}
            onChange={setSelectedPenilaiIds}
          />
        )}

        {/* Wizard Bottom Navigation Bar */}
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="size-3.5" />
            <span>Sebelumnya</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Langkah <strong>{currentStep}</strong> dari <strong>5</strong>
            </span>

            {currentStep < 5 ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                disabled={!isCurrentStepValid()}
                className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
              >
                <span>Lanjut: {WIZARD_STEPS[currentStep].title}</span>
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid || !isStep5Valid}
                className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                <CheckCircle2 className="size-3.5" />
                <span>{isEditing ? "Simpan Perubahan Lomba" : "Simpan & Terbitkan Lomba"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
