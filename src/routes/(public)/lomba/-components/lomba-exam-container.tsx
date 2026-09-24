import * as React from "react";
import {
  Bot,
  HeartHandshake,
  ImageIcon,
  ListChecks,
  ShieldAlert,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useSimliAvatar } from "@/hooks/use-simli-avatar";
import { cn } from "@/lib/utils";
import { useSysConfigStore } from "@/stores/sys-config-store";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { FloatingParticlesBackground } from "./floating-particles-background";
import { LarasatiWatermarkOverlay } from "./larasati-watermark-overlay";
import { LombaAuthScreen, type LombaAuthResult } from "./lomba-auth-screen";
import { LombaPrologScreen } from "./lomba-prolog-screen";
import { LombaStickyFooter } from "./lomba-sticky-footer";
import { currentLombaTheme } from "./lomba-theme";
import { LombaTopHeader } from "./lomba-top-header";
import { LombaWindingStepper } from "./lomba-winding-stepper";
import { OneMinuteAlert } from "./one-minute-alert";
import { StaseBriefingModal } from "./stase-briefing-modal";
import { Step1IntroLarasati } from "./step1-intro-larasati";
import { Step2AnamnesisAi } from "./step2-anamnesis-ai";
import { Step3FaktorRisikoMagnet } from "./step3-faktor-risiko-magnet";
import { Step4ProsedurIvaSequence } from "./step4-prosedur-iva-sequence";
import { Step5InterpretasiMcq } from "./step5-interpretasi-mcq";
import { Step6AsuhanAi } from "./step6-asuhan-ai";
import { Step7AudioRecorder } from "./step7-audio-recorder";
import { Step8LombaSummary } from "./step8-lomba-summary";
import { TimeoutDialog } from "./timeout-dialog";
import { trxResponseService, trxResponseAnswerService } from "@/services/api";
import { formatDurationLabel } from "@/services/api/case-mapper";
import {
  playCelebratoryFanfare,
  playCtaClickSound,
  playTransitionChime,
  stopCelebratoryFanfare,
} from "./lomba-sound-effects";

interface StaseConfig {
  stepIndex: number;
  staseNumber: number;
  name: string;
  kodeAmplop: string;
  durationSeconds: number;
  durationMinutes: number;
  durationLabel: string;
  petunjukSoal: string;
  panduanPenggunaan: string;
  icon: React.ElementType;
}

export function LombaExamContainer() {
  // Simli Virtual Avatar: connect HANYA saat di Pos 1 (step 2) atau Pos 5 (step 6), stase lain disconnect
  const simli = useSimliAvatar({ autoConnect: false });

  // Akses fungsi pemuat konfigurasi API (Simli & Gemini) dari store
  const loadConfigs = useSysConfigStore((s) => s.loadConfigs);

  // Prologue & Auth state: story prologue -> team login -> patient intro
  const [showProlog, setShowProlog] = React.useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);

  // Data lomba & kasus dari hasil auth API
  const [authResult, setAuthResult] = React.useState<LombaAuthResult | null>(null);
  const activeKasus: Kasus | undefined = authResult?.kasus;
  const activeKelompokNama = authResult?.contestTeamName;

  // Active step (1: Intro, 2: Pos 1, 3: Pos 2, 4: Pos 3, 5: Pos 4, 6: Pos 5, 8: Summary)
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(5 * 60);
  const [showOneMinAlert, setShowOneMinAlert] = React.useState<boolean>(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = React.useState<boolean>(false);

  // Stase Briefing Modal state (shows upon entering each stase)
  const [isBriefingModalOpen, setIsBriefingModalOpen] = React.useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = React.useState<boolean>(false);

  // Mode Interaktif AI vs Mode Statis (Strict Default: false / OFF)
  const [isAiEnabled, setIsAiEnabled] = React.useState<boolean>(false);

  const handleToggleAi = React.useCallback((enabled: boolean) => {
    setIsAiEnabled(enabled);
  }, []);

  // Audio managers
  const bgmAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isBgmAudioMuted, setIsBgmAudioMuted] = React.useState<boolean>(false);
  const [isFanfareActive, setIsFanfareActive] = React.useState<boolean>(false);
  // Cukup pos 1-5 saja, pos 6 record dinonaktifkan
  const hasAudioRecorder = false;

  const activeStaseConfigs: StaseConfig[] = React.useMemo(() => {
    const sd = activeKasus?.stase_data;

    const getDuration = (header?: { durasi_detik?: number; durasi_menit?: number }, fallbackSec = 300) => {
      const sec =
        typeof header?.durasi_detik === "number" && header.durasi_detik > 0
          ? header.durasi_detik
          : typeof header?.durasi_menit === "number" && header.durasi_menit > 0
            ? header.durasi_menit * 60
            : fallbackSec;
      return {
        seconds: sec,
        minutes: Math.max(1, Math.round(sec / 60)),
        label: formatDurationLabel(sec),
      };
    };

    const d1 = getDuration(sd?.stase1?.header, 300);
    const d2 = getDuration(sd?.stase2?.header, 300);
    const d3 = getDuration(sd?.stase3?.header, 300);
    const d4 = getDuration(sd?.stase4?.header, 300);
    const d5 = getDuration(sd?.stase5?.header, 300);

    return [
      {
        stepIndex: 2,
        staseNumber: 1,
        name: sd?.stase1?.header?.nama_stase || "Anamnesis (Wawancara Pasien)",
        kodeAmplop: sd?.stase1?.header?.kode_amplop || "AMP-ANM-01",
        durationSeconds: d1.seconds,
        durationMinutes: d1.minutes,
        durationLabel: d1.label,
        petunjukSoal:
          sd?.stase1?.header?.petunjuk_soal ||
          "Lakukan wawancara klinis terarah kepada pasien seputar keluhan dan riwayat kesehatan reproduksi.",
        panduanPenggunaan:
          "Bicaralah secara langsung melalui mikrofon atau ketik pesan. Pasien akan menjawab setiap pertanyaan Anda secara berurutan.",
        icon: Bot,
      },
      {
        stepIndex: 3,
        staseNumber: 2,
        name: sd?.stase2?.header?.nama_stase || "Identifikasi Faktor Risiko (Papan Magnet)",
        kodeAmplop: sd?.stase2?.header?.kode_amplop || "AMP-RSK-02",
        durationSeconds: d2.seconds,
        durationMinutes: d2.minutes,
        durationLabel: d2.label,
        petunjukSoal:
          sd?.stase2?.header?.petunjuk_soal ||
          "Tentukan faktor-faktor risiko kanker serviks dan patologi reproduksi yang teridentifikasi dari riwayat pasien.",
        panduanPenggunaan:
          "Klik kartu faktor risiko pada baki atau drag & drop kartu langsung untuk menempelkannya ke Papan Magnet di sebelah kanan.",
        icon: ShieldAlert,
      },
      {
        stepIndex: 4,
        staseNumber: 3,
        name: sd?.stase3?.header?.nama_stase || "Penyusunan Prosedur Tindakan IVA",
        kodeAmplop: sd?.stase3?.header?.kode_amplop || "AMP-SOP-03",
        durationSeconds: d3.seconds,
        durationMinutes: d3.minutes,
        durationLabel: d3.label,
        petunjukSoal:
          sd?.stase3?.header?.petunjuk_soal ||
          "Susun langkah-langkah standar operasional prosedur (SOP) pemeriksaan Inspeksi Visual Asam Asetat (IVA) secara berurutan.",
        panduanPenggunaan:
          "Klik dan tarik di mana saja pada badan kartu untuk menggeser posisinya secara interaktif atau gunakan tombol panah Naik / Turun.",
        icon: ListChecks,
      },
      {
        stepIndex: 5,
        staseNumber: 4,
        name: sd?.stase4?.header?.nama_stase || "Interpretasi Visual & Pilihan Diagnosis",
        kodeAmplop: sd?.stase4?.header?.kode_amplop || "AMP-ITP-04",
        durationSeconds: d4.seconds,
        durationMinutes: d4.minutes,
        durationLabel: d4.label,
        petunjukSoal:
          sd?.stase4?.header?.petunjuk_soal ||
          "Perhatikan foto inspeksi serviks pasca aplikasi asam asetat 3-5% dan tentukan pilihan diagnosis klinis yang tepat.",
        panduanPenggunaan:
          "Gunakan scroll mouse atau pinch pada gambar untuk zoom. Pilih foto mini di samping kanan untuk beralih foto, lalu pilih opsi kesimpulan diagnosis A, B, C, atau D.",
        icon: ImageIcon,
      },
      {
        stepIndex: 6,
        staseNumber: 5,
        name: sd?.stase5?.header?.nama_stase || "Asuhan Kebidanan & Konseling Empatik",
        kodeAmplop: sd?.stase5?.header?.kode_amplop || "AMP-ASH-05",
        durationSeconds: d5.seconds,
        durationMinutes: d5.minutes,
        durationLabel: d5.label,
        petunjukSoal:
          sd?.stase5?.header?.petunjuk_soal ||
          "Berikan konseling hasil pemeriksaan dan asuhan kebidanan secara empatik kepada pasien virtual.",
        panduanPenggunaan:
          "Bicaralah melalui mikrofon untuk memberikan edukasi dan menenangkan pasien virtual. Tanggapi pertanyaan dan kekhawatiran pasien secara profesional.",
        icon: HeartHandshake,
      },
    ];
  }, [activeKasus]);

  const currentStaseConfig = activeStaseConfigs.find((st) => st.stepIndex === currentStep);

  // Reset stase on step change
  React.useEffect(() => {
    if (currentStaseConfig) {
      setSecondsRemaining(currentStaseConfig.durationSeconds);
      setShowOneMinAlert(false);
      setIsTimeoutModalOpen(false);
      setIsBriefingModalOpen(true);
      setIsTimerRunning(false);
    }
  }, [currentStep, currentStaseConfig]);

  // Kelola konfigurasi backend & koneksi Simli:
  // HANYA muat config dan hubungkan Simli saat di Pos 1 (step 2) atau Pos 5 (step 6) jika button LIVE (isAiEnabled) diaktifkan
  const simliRef = React.useRef(simli);
  simliRef.current = simli;

  React.useEffect(() => {
    const isInteractiveAiStep = (currentStep === 2 || currentStep === 6) && isAiEnabled;
    if (isInteractiveAiStep) {
      console.log(
        `%c[Simli Manager] 🟡 Masuk Pos ${currentStep === 2 ? 1 : 5} dengan Mode LIVE aktif. Memuat konfigurasi backend & menghubungkan Simli Avatar...`,
        "background: #1e3a8a; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      );
      // Muat config terlebih dahulu (menggunakan Bearer token hasil login) sebelum connect Simli
      loadConfigs()
        .then(() => {
          return simliRef.current.connect(true);
        })
        .catch(() => {
          console.log("[Simli Manager] 🟠 Gagal menghubungkan Simli, fallback ke mode foto.");
        });
    } else {
      console.log(
        `%c[Simli Manager] ⚪ Memutuskan (disconnect) Simli Avatar di luar pos interaktif AI atau mode statis (Pos ${currentStep}, AI ${isAiEnabled ? "ON" : "OFF"})...`,
        "background: #475569; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      );
      simliRef.current.disconnect();
    }
  }, [currentStep, isAiEnabled, loadConfigs]);

  // Pastikan Simli disconnect saat komponen lomba unmount
  React.useEffect(() => {
    return () => {
      simliRef.current.disconnect();
    };
  }, []);

  // Main countdown timer effect
  React.useEffect(() => {
    if (currentStep === 1 || currentStep === 8 || !currentStaseConfig || !isTimerRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        // Alert 1 menit hanya muncul jika durasi stase > 1 menit (misal Pos 1: 3 menit, Pos 5: 2 menit)
        if (prev === 61 && currentStaseConfig.durationSeconds > 60) {
          setShowOneMinAlert(true);
          setTimeout(() => setShowOneMinAlert(false), 4000);
        }

        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeoutModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep, currentStaseConfig, isTimerRunning]);

  // Dual Soundtrack BGM Audio Manager
  // Track 1: "/audio/larasati-intro.mpeg" for Prologue & Auth screens (Intro stage)
  // Track 2: "/audio/larasati-backsound.mpeg" (Looped) for Step 1 (Tata Cara & Stase Kerja) to the end
  // Pauses on: Step 2 (Pos 1: Anamnesis), Step 6 (Pos 5: Asuhan), Step 7 (Pos 6: Audio Recorder)
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const targetSrc = !isLoggedIn
      ? "/audio/larasati-intro.mpeg"
      : "/audio/larasati-backsound.mpeg";

    if (!bgmAudioRef.current) {
      const audio = new Audio(targetSrc);
      audio.loop = true;
      audio.volume = 0.35;
      audio.preload = "auto";
      bgmAudioRef.current = audio;
    } else {
      // If track source changed (e.g. from intro to gamelan after completing auth), smoothly transition
      const currentSrcPath = new URL(bgmAudioRef.current.src, window.location.href).pathname;
      if (currentSrcPath !== targetSrc) {
        const wasPlaying = !bgmAudioRef.current.paused;
        bgmAudioRef.current.pause();
        bgmAudioRef.current.src = targetSrc;
        bgmAudioRef.current.load();
        if (wasPlaying && !isBgmAudioMuted) {
          bgmAudioRef.current.play().catch(() => {});
        }
      }
    }

    const audio = bgmAudioRef.current;
    const isWawancaraOrRecStep = isLoggedIn && (currentStep === 2 || currentStep === 6 || currentStep === 7);
    const shouldPlay = !isBgmAudioMuted && !isWawancaraOrRecStep && !isFanfareActive;

    if (shouldPlay) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay restricted until user interaction
        });
      }
    } else {
      audio.pause();
    }

    const handleFirstGesture = () => {
      if (
        !isBgmAudioMuted &&
        !isFanfareActive &&
        (!isLoggedIn || (currentStep !== 2 && currentStep !== 6 && currentStep !== 7))
      ) {
        audio.play().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };
  }, [currentStep, isLoggedIn, showProlog, isBgmAudioMuted, isFanfareActive]);

  // Celebratory Victory Fanfare effect on Step 8 (Summary)
  // Plays festive fanfare looped 8 times, then automatically transitions to background BGM
  React.useEffect(() => {
    if (currentStep === 8 && isLoggedIn) {
      setIsFanfareActive(true);
      const stopFn = playCelebratoryFanfare(() => {
        setIsFanfareActive(false);
      }, 8);

      return () => {
        stopFn();
      };
    } else {
      setIsFanfareActive(false);
      stopCelebratoryFanfare();
    }
  }, [currentStep, isLoggedIn]);

  React.useEffect(() => {
    return () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current.src = "";
        bgmAudioRef.current = null;
      }
    };
  }, []);

  // Global CTA Button Click Sound Listener across the entire Lomba view
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest("button, [role='button'], [data-cta='true']");
      if (clickable) {
        playCtaClickSound();
      }
    };

    window.addEventListener("click", handleButtonClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleButtonClick, { capture: true });
    };
  }, []);

  const handleLoginSuccess = (result: LombaAuthResult) => {
    setAuthResult(result);
    setIsLoggedIn(true);
    playTransitionChime();
    setCurrentStep(1);
  };

  const handleStartCircuit = () => {
    // Tidak menembak trx_response di sini. Peserta hanya berpindah dari Preview Kasus (Step 1) ke Pos 1 (Step 2).
    playTransitionChime();
    setCurrentStep(2);
  };

  const handleStartStase = () => {
    setIsBriefingModalOpen(false);
    setIsTimerRunning(true);
    playTransitionChime();
  };

  const handleEnsureResponseId = React.useCallback(async (): Promise<number> => {
    if (authResult?.responseId && authResult.responseId > 0) {
      return authResult.responseId;
    }

    if (!authResult?.contestId || !authResult?.contestTeamId) {
      return 0;
    }

    // 1. Cek server terlebih dahulu via GET /v1/trx_response
    try {
      const allTrx = await trxResponseService.getAll(authResult.contestId);
      const matched = Array.isArray(allTrx.data)
        ? allTrx.data.find(
            (r) => String(r.response_contestteam_id) === String(authResult.contestTeamId),
          )
        : null;
      if (matched?.response_id) {
        const foundId = Number(matched.response_id);
        setAuthResult((prev) => (prev ? { ...prev, responseId: foundId } : null));
        return foundId;
      }
    } catch (e) {
      console.warn("[handleEnsureResponseId] Gagal query GET trx_response:", e);
    }

    // 2. Jika belum ada di server, inisialisasi sesi response tim
    try {
      const caseId = authResult.caseId || (authResult.kasus as any)?.id;
      const patientId = authResult.patientId || 1;
      if (caseId) {
        const trxStoreRes = await trxResponseService.store({
          contest_id: authResult.contestId,
          contestteam_id: authResult.contestTeamId,
          case_id: caseId,
          patient_id: patientId,
        });

        const storeData = trxStoreRes.data;
        let createdId = 0;
        if (storeData?.response_id) {
          createdId = Number(storeData.response_id);
        } else if ((storeData as any)?.data?.response_id) {
          createdId = Number((storeData as any).data.response_id);
        } else {
          const allTrx = await trxResponseService.getAll(authResult.contestId);
          const matched = allTrx.data?.find(
            (r) => r.response_contestteam_id === authResult.contestTeamId,
          );
          if (matched) {
            createdId = Number(matched.response_id);
          }
        }

        if (createdId > 0) {
          setAuthResult((prev) => (prev ? { ...prev, responseId: createdId } : null));
          return createdId;
        }
      }
    } catch (storeErr) {
      console.warn("[handleEnsureResponseId] Gagal store trx_response:", storeErr);
    }

    return 0;
  }, [authResult]);

  const handleNextStep = async () => {
    setIsTimeoutModalOpen(false);
    playTransitionChime();

    let activeResponseId = authResult?.responseId || 0;

    // Jika sedang di Pos 1 (currentStep === 2) dan belum punya responseId, pastikan responseId tersedia
    if (currentStep === 2 && !activeResponseId && authResult && authResult.contestId && authResult.contestTeamId) {
      activeResponseId = await handleEnsureResponseId();
    }

    // Auto-submit stase jawaban ke API saat berpindah pos (Pos 1 & Pos 5)
    if (activeResponseId > 0) {
      const spentSeconds = currentStaseConfig
        ? Math.max(1, currentStaseConfig.durationSeconds - secondsRemaining)
        : 100;

      if (currentStep === 2 && activeKasus?.stase_data?.stase1?.casequest_id) {
        trxResponseAnswerService
          .store({
            response_id: activeResponseId,
            casequest_id: activeKasus.stase_data.stase1.casequest_id,
            responseanswer_submited: "1",
            duration: String(spentSeconds),
          })
          .catch((err) => console.warn("[Pos 1 Submit Error]", err));
      } else if (currentStep === 6 && activeKasus?.stase_data?.stase5?.casequest_id) {
        trxResponseAnswerService
          .store({
            response_id: activeResponseId,
            casequest_id: activeKasus.stase_data.stase5.casequest_id,
            responseanswer_submited: "1",
            duration: String(spentSeconds),
          })
          .catch((err) => console.warn("[Pos 5 Submit Error]", err));
      }
    }

    if (currentStep === 6 && !hasAudioRecorder) {
      setCurrentStep(8);
    } else if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDirectSelectStase = (posNumber: number) => {
    const targetStep = posNumber + 1;
    playTransitionChime();
    setCurrentStep(targetStep);
  };

  return (
    <div
      className={cn(
        "relative isolate min-h-screen w-full max-w-full overflow-x-hidden flex flex-col justify-between select-none",
        currentLombaTheme.backgroundGradient,
      )}
    >
      {/* Background Larasati: Overlay Path Titik-Titik, Laron Fireflies Berkilau, & Smooth Antigravity Mouse Matrix (Layer Paling Belakang: z-0) */}
      <FloatingParticlesBackground />

      {/* Larasati Full Body Watermark Overlay (Layer Tengah: z-10, Di Depan Partikel & Di Belakang Konten) */}
      <LarasatiWatermarkOverlay />

      {/* 1-Minute Warning Center Notification (Only for stases with duration > 1 minute) */}
      <OneMinuteAlert show={showOneMinAlert} />

      {/* Timeout Auto-Transition Modal Dialog */}
      <TimeoutDialog
        open={isTimeoutModalOpen}
        onNextStase={handleNextStep}
        nextStaseName={
          currentStep === 6 && !hasAudioRecorder
            ? "Ringkasan & Pengumpulan Jawaban"
            : currentStep === 7
              ? "Ringkasan & Pengumpulan Jawaban"
              : activeStaseConfigs.find((st) => st.stepIndex === currentStep + 1)?.name || "Pos Berikutnya"
        }
      />

      {/* Stase Initial Briefing Modal (Opens upon first arrival at pos) */}
      {isLoggedIn && currentStaseConfig && (
        <StaseBriefingModal
          open={isBriefingModalOpen}
          onStart={handleStartStase}
          staseNumber={currentStaseConfig.staseNumber}
          staseName={currentStaseConfig.name}
          kodeAmplop={currentStaseConfig.kodeAmplop}
          durationMinutes={currentStaseConfig.durationMinutes}
          durationSeconds={currentStaseConfig.durationSeconds}
          durationLabel={currentStaseConfig.durationLabel}
          petunjukSoal={currentStaseConfig.petunjukSoal}
          panduanPenggunaan={currentStaseConfig.panduanPenggunaan}
          isAvatarReady={
            !(currentStep === 2 || currentStep === 6) ||
            !isAiEnabled ||
            simli.status === "connected" ||
            simli.status === "fallback" ||
            simli.status === "error"
          }
        />
      )}

      {/* ============================================================ */}
      {/* SCREEN PROLOG: LARASATI JOURNEY (SEBELUM LOGIN TIM) (z-20)   */}
      {/* ============================================================ */}
      {!isLoggedIn && showProlog && (
        <div className="relative z-20 w-full flex-1 flex flex-col">
          <LombaPrologScreen onProceed={() => setShowProlog(false)} />
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN AUTH: LOGIN TIM SEBELUM INTRO & SIRKUIT (z-20)        */}
      {/* ============================================================ */}
      {!isLoggedIn && !showProlog && (
        <div className="relative z-20 w-full flex-1 flex flex-col">
          <LombaAuthScreen
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* STEPS 1 TO 8: LOGGED IN PARTICIPANT EXAM FLOW (z-20)         */}
      {/* ============================================================ */}
      {isLoggedIn && (
        <main className="relative z-20 flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
          {/* Step 1: Patient Intro & Circuit Guide Screen */}
          {currentStep === 1 && (
            <div className="w-full max-w-6xl mx-auto my-auto">
              <Step1IntroLarasati
                onStart={handleStartCircuit}
                kasus={activeKasus}
                kelompokNama={activeKelompokNama}
                isAiEnabled={isAiEnabled}
                onToggleAi={handleToggleAi}
              />
            </div>
          )}

          {/* Steps 2 to 7: Winding Stepper Map + Top Header Bar + Active Pos */}
          {currentStep >= 2 && currentStep <= 7 && currentStaseConfig && (
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 overflow-hidden">
              {/* 1. Minimalist Circuit Stepper (Angka Aja + Glowing Gold Spline) */}
              <LombaWindingStepper
                currentStep={currentStep}
                totalStase={hasAudioRecorder ? 6 : 5}
                onSelectStase={handleDirectSelectStase}
              />

              {/* 2. Top Header Bar: Stase Summary, Big Timer, and Radiant Gold Patient Brief */}
              <LombaTopHeader
                staseNumber={currentStaseConfig.staseNumber}
                totalStase={hasAudioRecorder ? 6 : 5}
                staseName={currentStaseConfig.name}
                kodeAmplop={currentStaseConfig.kodeAmplop}
                durasiRemainingSeconds={secondsRemaining}
                petunjukSoal={currentStaseConfig.petunjukSoal}
                panduanPenggunaan={currentStaseConfig.panduanPenggunaan}
                groupName={activeKelompokNama}
              />

              {/* 3. Active Interactive Station Stage */}
              <div className="w-full max-w-full overflow-hidden pt-1">
                {currentStep === 2 && (
                  <Step2AnamnesisAi
                    isStarted={!isBriefingModalOpen && isTimerRunning}
                    onComplete={handleNextStep}
                    kasus={activeKasus}
                    simli={simli}
                    isAiEnabled={isAiEnabled}
                    responseId={authResult?.responseId}
                    casequestId={activeKasus?.stase_data?.stase1?.casequest_id}
                    onEnsureResponseId={handleEnsureResponseId}
                  />
                )}
                {currentStep === 3 && (
                  <Step3FaktorRisikoMagnet
                    kasus={activeKasus}
                    responseId={authResult?.responseId}
                    casequestId={activeKasus?.stase_data?.stase2?.casequest_id}
                    duration={
                      currentStaseConfig
                        ? Math.max(1, currentStaseConfig.durationSeconds - secondsRemaining)
                        : 0
                    }
                  />
                )}
                {currentStep === 4 && (
                  <Step4ProsedurIvaSequence
                    kasus={activeKasus}
                    responseId={authResult?.responseId}
                    casequestId={activeKasus?.stase_data?.stase3?.casequest_id}
                    duration={
                      currentStaseConfig
                        ? Math.max(1, currentStaseConfig.durationSeconds - secondsRemaining)
                        : 0
                    }
                  />
                )}
                {currentStep === 5 && (
                  <Step5InterpretasiMcq
                    kasus={activeKasus}
                    responseId={authResult?.responseId}
                    casequestId={activeKasus?.stase_data?.stase4?.casequest_id}
                    duration={
                      currentStaseConfig
                        ? Math.max(1, currentStaseConfig.durationSeconds - secondsRemaining)
                        : 0
                    }
                  />
                )}
                {currentStep === 6 && (
                  <Step6AsuhanAi
                    isStarted={!isBriefingModalOpen && isTimerRunning}
                    kasus={activeKasus}
                    simli={simli}
                    isAiEnabled={isAiEnabled}
                    responseId={authResult?.responseId}
                    casequestId={activeKasus?.stase_data?.stase5?.casequest_id}
                    onEnsureResponseId={handleEnsureResponseId}
                  />
                )}
                {currentStep === 7 && hasAudioRecorder && (
                  <Step7AudioRecorder
                    responseId={authResult?.responseId}
                    casequestId={activeKasus?.stase_data?.stase6?.casequest_id}
                  />
                )}
              </div>

              {/* Bottom Safe Spacer */}
              <div className="h-28 w-full shrink-0 pointer-events-none" />
            </div>
          )}

          {/* Step 8: Final Summary & Submission Screen */}
          {currentStep === 8 && (
            <div className="w-full max-w-7xl mx-auto my-auto">
              <Step8LombaSummary
                groupName={activeKelompokNama}
                kasus={activeKasus}
                hasAudioRecorder={hasAudioRecorder}
              />
            </div>
          )}
        </main>
      )}

      {/* Sticky Bottom Navigation Footer (Steps 2 to 7) */}
      {isLoggedIn && currentStep >= 2 && currentStep <= 7 && (
        <LombaStickyFooter
          currentStep={currentStep}
          totalSteps={hasAudioRecorder ? 7 : 6}
          hasAudioRecorder={hasAudioRecorder}
          onNext={handleNextStep}
        />
      )}

      {/* Floating Ambient BGM Control Button */}
      <div
        className={cn(
          "fixed right-4 sm:right-6 z-40 transition-all duration-300",
          isLoggedIn && currentStep >= 2 && currentStep <= 7
            ? "bottom-20 sm:bottom-20"
            : "bottom-6 sm:bottom-6",
        )}
      >
        <button
          type="button"
          onClick={() => setIsBgmAudioMuted((prev) => !prev)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-serif font-bold shadow-2xl border transition-all duration-300 backdrop-blur-md cursor-pointer",
            isBgmAudioMuted || (isLoggedIn && (currentStep === 2 || currentStep === 6 || currentStep === 7))
              ? "bg-[#19110a]/90 text-[#d4af37]/60 border-[#8c6d23]/40 hover:text-[#fff8db] hover:border-[#d4af37]/60"
              : "bg-gradient-to-r from-[#24170d] via-[#362211] to-[#24170d] text-[#f9f586] border-[#d4af37] ring-1 ring-[#d4af37]/40 shadow-[0_0_15px_rgba(212,175,55,0.25)]",
          )}
          title={
            isLoggedIn && (currentStep === 2 || currentStep === 6 || currentStep === 7)
              ? "Musik latar dijeda otomatis selama sesi wawancara klinis"
              : isBgmAudioMuted
                ? "Putar Musik Latar Larasati"
                : "Matikan Musik Latar"
          }
        >
          {isBgmAudioMuted ? (
            <VolumeX className="size-3.5 text-rose-400" />
          ) : isLoggedIn && (currentStep === 2 || currentStep === 6 || currentStep === 7) ? (
            <VolumeX className="size-3.5 text-[#d4af37]/40" />
          ) : (
            <Volume2 className="size-3.5 text-[#f9f586] animate-bounce" />
          )}
          <span className="text-[10px] hidden sm:inline">
            {isLoggedIn && (currentStep === 2 || currentStep === 6 || currentStep === 7)
              ? "BGM Dijeda (Wawancara)"
              : isBgmAudioMuted
                ? "BGM Off"
                : "BGM On"}
          </span>
        </button>
      </div>
    </div>
  );
}
