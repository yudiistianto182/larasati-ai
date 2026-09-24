import * as React from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck,
  Link2,
  Loader2,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type KelompokLomba,
  useContestStore,
} from "@/stores/contest-store";
import { useKasusStore } from "@/stores/kasus-store";
import { triggerErrorAlert } from "@/stores/error-alert-store";
import {
  contestService,
  contestTeamService,
  extractNumericCaseId,
  trxResponseService,
} from "@/services/api";
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

  const { addContest, updateContest, getContestById, getContestDetail, fetchUsers } = useContestStore();
  const { fetchKasus, getKasusById } = useKasusStore();

  const isEditing = Boolean(editContestId);
  const existingContest = editContestId ? getContestById(editContestId) : undefined;

  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [maxStepReached, setMaxStepReached] = React.useState<number>(isEditing ? 5 : 1);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState<boolean>(isEditing);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // Preload users & cases on mount
  React.useEffect(() => {
    fetchUsers();
    fetchKasus();
  }, [fetchUsers, fetchKasus]);

  // Form State: Step 1
  const [nama, setNama] = React.useState(existingContest?.nama || "");
  const [periodeId, setPeriodeId] = React.useState<number>(
    existingContest?.periode_id || 1,
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

  // Form State: Step 2 (Start clean empty if new)
  const [selectedKasusIds, setSelectedKasusIds] = React.useState<string[]>(
    existingContest?.kasus_ids || [],
  );

  // Form State: Step 3 (Start clean with 1 empty group)
  const [kelompokList, setKelompokList] = React.useState<KelompokLomba[]>(
    existingContest?.kelompok_list || [
      {
        id: `kel-${Date.now()}-1`,
        nama: "Kelompok 1",
        mahasiswa_ids: [],
      },
    ],
  );
  const [deletedTeamIds, setDeletedTeamIds] = React.useState<string[]>([]);

  const handleKelompokListChange = (newList: KelompokLomba[]) => {
    const currentIds = new Set(newList.map((k) => k.id));
    const removed = kelompokList.filter((k) => !currentIds.has(k.id));
    for (const r of removed) {
      if (r.id && !r.id.startsWith("kel-") && !isNaN(Number(r.id))) {
        setDeletedTeamIds((prev) => [...prev, r.id]);
      }
    }
    setKelompokList(newList);
  };

  // Form State: Step 4
  const [allowSharedKasus, setAllowSharedKasus] = React.useState<boolean>(
    existingContest?.allow_shared_kasus ?? false,
  );

  // Form State: Step 5 (Start clean empty if new)
  const [selectedPenilaiIds, setSelectedPenilaiIds] = React.useState<string[]>(
    existingContest?.penilai_ids || [],
  );

  // Fetch full contest detail from API when editing
  React.useEffect(() => {
    if (!editContestId) {
      setIsLoadingDetail(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingDetail(true);

    getContestDetail(editContestId)
      .then((detail) => {
        if (isCancelled) return;
        if (detail) {
          setNama(detail.nama || "");
          setPeriodeId(detail.periode_id || 1);

          let parsedFrom: Date | undefined;
          let parsedTo: Date | undefined;
          if (detail.tanggal_mulai) {
            const d = new Date(detail.tanggal_mulai);
            if (!isNaN(d.getTime())) parsedFrom = d;
          }
          if (detail.tanggal_selesai) {
            const d = new Date(detail.tanggal_selesai);
            if (!isNaN(d.getTime())) parsedTo = d;
          }
          setDateRange(parsedFrom && parsedTo ? { from: parsedFrom, to: parsedTo } : undefined);

          setDeskripsi(detail.deskripsi || "");
          setSelectedKasusIds(detail.kasus_ids || []);
          setKelompokList(
            detail.kelompok_list && detail.kelompok_list.length > 0
              ? detail.kelompok_list
              : [{ id: `kel-${Date.now()}-1`, nama: "Kelompok 1", mahasiswa_ids: [] }],
          );
          setAllowSharedKasus(detail.allow_shared_kasus ?? false);
          setSelectedPenilaiIds(detail.penilai_ids || []);
          setMaxStepReached(5);
        } else {
          triggerErrorAlert(
            "Lomba Tidak Ditemukan",
            `Data lomba dengan ID ${editContestId} tidak ditemukan di server.`,
            404,
          );
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error("[TambahContestPage] Gagal memuat detail lomba:", err);
        triggerErrorAlert(
          "Gagal Memuat Data Lomba",
          err?.message || "Terjadi kesalahan saat mengambil rincian lomba dari server.",
          500,
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingDetail(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [editContestId, getContestDetail]);

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

  const handleSave = async () => {
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      return;
    }

    const formatDateForApi = (d?: Date) => {
      if (!d) return new Date().toISOString().split("T")[0];
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const datestart = formatDateForApi(dateRange?.from);
    const dateend = formatDateForApi(dateRange?.to);

    setIsSaving(true);

    try {
      // 1. Simpan Data Lomba ke endpoint /v1/data_contest (Adonis)
      const contestApiPayload = {
        name: nama.trim(),
        periode_id: String(periodeId),
        datestart,
        dateend,
        desc: deskripsi.trim() || "-",
        scorer: selectedPenilaiIds.map((id) => ({ user_id: extractNumericCaseId(id) })),
        case: selectedKasusIds.map((id) => ({ case_id: extractNumericCaseId(id) })),
      };

      let currentContestId: string | number | undefined = editContestId;

      if (isEditing && editContestId) {
        const cleanId = extractNumericCaseId(editContestId);
        const updateRes = await contestService.update(cleanId, contestApiPayload);
        if (updateRes && (updateRes as any).status === false) {
          throw new Error((updateRes as any).message || "Gagal memperbarui data lomba di server.");
        }
      } else {
        const createRes = await contestService.create(contestApiPayload);
        if (createRes && (createRes as any).status === false) {
          throw new Error((createRes as any).message || "Gagal membuat lomba baru di server.");
        }

        const newId =
          (createRes?.data as any)?.contest_id ||
          (createRes?.data as any)?.id ||
          (createRes as any)?.contest_id ||
          (createRes as any)?.id;

        if (newId) {
          currentContestId = String(newId);
        } else {
          // Lacak dari getAll terbaru jika response tidak memuat contest_id langsung
          const allContests = await contestService.getAll();
          const list = Array.isArray(allContests.data)
            ? allContests.data
            : (allContests.data as any)?.data || [];
          const found = list.find((c: any) => c.contest_name === nama.trim());
          if (found?.contest_id) {
            currentContestId = String(found.contest_id);
          } else {
            throw new Error("Lomba berhasil disimpan tetapi ID lomba tidak ditemukan dari respon server.");
          }
        }
      }

      // 2. Simpan Tim / Kelompok Mahasiswa ke endpoint /v1/data_contest_team
      if (!currentContestId) {
        throw new Error("ID lomba tidak valid untuk mendaftarkan kelompok.");
      }

      // 2a. Hapus Tim yang dihapus dari server jika sedang edit
      if (isEditing && deletedTeamIds.length > 0) {
        for (const delId of deletedTeamIds) {
          try {
            await contestTeamService.destroy(delId);
          } catch (delErr) {
            console.warn("[tambah-contest-page] Gagal hapus team server:", delId, delErr);
          }
        }
      }

      // 2b. Simpan Tim / Kelompok Mahasiswa ke endpoint /v1/data_contest_team
      const cleanContestId = extractNumericCaseId(currentContestId);
      for (const kel of kelompokList) {
        if (kel.mahasiswa_ids.length > 0) {
          const teamPayload = {
            name: kel.nama.trim(),
            contest_id: String(cleanContestId),
            member: kel.mahasiswa_ids.map((mId) => ({
              user_id: String(extractNumericCaseId(mId)),
              is_leader: kel.ketua_mhs_id === mId ? "1" : "0",
            })),
          };

          const isExistingTeam = isEditing && kel.id && !kel.id.startsWith("kel-") && !isNaN(Number(kel.id));
          let teamRes;
          if (isExistingTeam) {
            try {
              teamRes = await contestTeamService.update(kel.id, teamPayload);
            } catch {
              teamRes = await contestTeamService.create(teamPayload);
            }
          } else {
            teamRes = await contestTeamService.create(teamPayload);
          }

          if (teamRes && (teamRes as any).status === false) {
            throw new Error((teamRes as any).message || `Gagal menyimpan kelompok ${kel.nama}`);
          }
        }
      }

      // 3. Tautkan Kasus & Pasien ke masing-masing Kelompok via POST /v1/trx_response
      try {
        const allTeamsRes = await contestTeamService.getAll(cleanContestId);
        const serverTeams = Array.isArray(allTeamsRes.data)
          ? allTeamsRes.data
          : (allTeamsRes.data as any)?.data || [];

        const existingTrxRes = await trxResponseService.getAll(cleanContestId).catch(() => ({ data: [] }));
        const existingTrxList = Array.isArray(existingTrxRes.data)
          ? existingTrxRes.data
          : (existingTrxRes.data as any)?.data || [];

        for (const kel of kelompokList) {
          if (!kel.kasus_id) continue;

          let serverTeamId: string | number | undefined;
          if (kel.id && !kel.id.startsWith("kel-") && !isNaN(Number(kel.id))) {
            serverTeamId = kel.id;
          } else {
            const foundTeam = serverTeams.find((st: any) => st.contestteam_name?.trim() === kel.nama.trim());
            serverTeamId = foundTeam?.contestteam_id;
          }

          if (!serverTeamId) continue;

          const numericCaseId = extractNumericCaseId(kel.kasus_id);
          if (!numericCaseId) continue;

          const targetKasus = getKasusById(kel.kasus_id);
          let patientId = 1;
          if (targetKasus?.pasien_ids && targetKasus.pasien_ids.length > 0) {
            patientId = Number(extractNumericCaseId(targetKasus.pasien_ids[0])) || 1;
          }

          const existingTrx = existingTrxList.find(
            (r: any) => String(r.response_contestteam_id || r.contestteam_id) === String(serverTeamId),
          );

          const trxPayload = {
            contest_id: String(cleanContestId),
            contestteam_id: String(serverTeamId),
            case_id: String(numericCaseId),
            patient_id: String(patientId),
          };

          if (existingTrx) {
            try {
              await trxResponseService.update(numericCaseId, trxPayload);
            } catch {
              await trxResponseService.store(trxPayload);
            }
          } else {
            await trxResponseService.store(trxPayload);
          }
        }
      } catch (trxErr) {
        console.warn("[TambahContestPage] Gagal menautkan kasus ke trx_response:", trxErr);
      }

      // 3. Simpan juga ke Zustand store agar view lokal sinkron (Hanya jika semua API berhasil)
      const contestPayload = {
        nama: nama.trim(),
        periode_id: periodeId,
        periode_nama: `Periode ${periodeId}`,
        tanggal_mulai: dateRange?.from ? dateRange.from.toISOString() : new Date().toISOString(),
        tanggal_selesai: dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString(),
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
        addContest({
          ...contestPayload,
          id: String(currentContestId),
        });
      }

      navigate({ to: "/dashboard/contest" });
    } catch (err: any) {
      console.error("[TambahContestPage] Gagal menyimpan lomba:", err);
      triggerErrorAlert(
        isEditing ? "Gagal Memperbarui Lomba" : "Gagal Membuat Lomba",
        err?.message || "Terjadi kesalahan saat menyimpan data lomba ke server.",
        err?.statusCode || 400,
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
        {isLoadingDetail ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 rounded-xl border border-dashed border-border/80 bg-card p-8 text-center shadow-2xs">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm text-foreground">Memuat Data Lomba</p>
              <p className="text-xs text-muted-foreground">
                Mengambil konfigurasi lomba, pembagian kelompok, dan dewan penilai dari server...
              </p>
            </div>
          </div>
        ) : (
          <>
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
                onChange={handleKelompokListChange}
              />
            )}

            {currentStep === 4 && (
              <Step4TautkanKasus
                selectedKasusIds={selectedKasusIds}
                kelompokList={kelompokList}
                allowSharedKasus={allowSharedKasus}
                onAllowSharedKasusChange={setAllowSharedKasus}
                onKelompokListChange={handleKelompokListChange}
              />
            )}

            {currentStep === 5 && (
              <Step5PilihPenilai
                selectedPenilaiIds={selectedPenilaiIds}
                onChange={setSelectedPenilaiIds}
              />
            )}
          </>
        )}

        {/* Wizard Bottom Navigation Bar */}
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={isLoadingDetail || currentStep === 1}
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
                disabled={isLoadingDetail || !isCurrentStepValid()}
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
                disabled={
                  isLoadingDetail ||
                  isSaving ||
                  !isStep1Valid ||
                  !isStep2Valid ||
                  !isStep3Valid ||
                  !isStep4Valid ||
                  !isStep5Valid
                }
                className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                <span>
                  {isSaving
                    ? "Menyimpan ke Server..."
                    : isEditing
                      ? "Simpan Perubahan Lomba"
                      : "Simpan & Terbitkan Lomba"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
