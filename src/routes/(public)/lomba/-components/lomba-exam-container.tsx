import * as React from "react";
import { useSearch } from "@tanstack/react-router";
import {
  Bot,
  HeartHandshake,
  ImageIcon,
  ListChecks,
  Mic,
  ShieldAlert,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { type KelompokLomba, useContestStore } from "@/stores/contest-store";
import { useKasusStore } from "@/stores/kasus-store";
import { FloatingParticlesBackground } from "./floating-particles-background";
import { LarasatiWatermarkOverlay } from "./larasati-watermark-overlay";
import { LombaAuthScreen } from "./lomba-auth-screen";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search: any = useSearch({ strict: false });
  const lombaId = (search?.lombaId as string) || "lomba-01";
  const initialKelompokId = (search?.kelompokId as string) || "kel-01";

  const { contests } = useContestStore();
  const { kasusList } = useKasusStore();

  const activeContest = contests.find((c) => c.id === lombaId) || contests[0];

  // Prologue & Auth state: story prologue -> team login -> patient intro
  const [showProlog, setShowProlog] = React.useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [loggedInKelompok, setLoggedInKelompok] = React.useState<KelompokLomba | null>(null);

  // Active step (1: Intro, 2: Pos 1, 3: Pos 2, 4: Pos 3, 5: Pos 4, 6: Pos 5, 8: Summary)
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(3 * 60);
  const [showOneMinAlert, setShowOneMinAlert] = React.useState<boolean>(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = React.useState<boolean>(false);

  // Stase Briefing Modal state (shows upon entering each stase)
  const [isBriefingModalOpen, setIsBriefingModalOpen] = React.useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = React.useState<boolean>(false);

  // Audio managers
  const [isBgmAudioMuted, setIsBgmAudioMuted] = React.useState<boolean>(false);
  const [isFanfareActive, setIsFanfareActive] = React.useState<boolean>(false);
  const bgmAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const activeKelompok =
    loggedInKelompok ||
    activeContest?.kelompok_list.find((k) => k.id === initialKelompokId) ||
    activeContest?.kelompok_list[0];

  const assignedKasusId = activeKelompok?.kasus_id || activeContest?.kasus_ids[0] || "KSS-001";
  const activeKasus = kasusList.find((k) => k.id === assignedKasusId) || kasusList[0];

  const hasAudioRecorder = false;

  const activeStaseConfigs: StaseConfig[] = React.useMemo(() => {
    const sd = activeKasus?.stase_data;
    return [
      {
        stepIndex: 2,
        staseNumber: 1,
        name: sd?.stase1?.header?.nama_stase || "Anamnesis (Wawancara Pasien)",
        kodeAmplop: sd?.stase1?.header?.kode_amplop || "AMP-ANM-01",
        durationSeconds: 3 * 60,
        durationMinutes: 3,
        durationLabel: "3 Menit",
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
        durationSeconds: 1 * 60,
        durationMinutes: 1,
        durationLabel: "1 Menit",
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
        durationSeconds: 1 * 60,
        durationMinutes: 1,
        durationLabel: "1 Menit",
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
        durationSeconds: 30,
        durationMinutes: 0.5,
        durationLabel: "30 Detik",
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
        durationSeconds: 2 * 60,
        durationMinutes: 2,
        durationLabel: "2 Menit",
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

  // Ambient Soundtrack Audio Manager (/audio/larasati-ambient.mp3)
  // Continuous soundtrack across screens:
  // Plays on: Prologue, Auth, Step 1 (Intro), Step 3 (Pos 2), Step 4 (Pos 3), Step 5 (Pos 4), Step 8 (Summary)
  // Pauses on: Step 2 (Pos 1: Anamnesis - Wawancara), Step 6 (Pos 5: Asuhan - Konseling/Wawancara), Step 7 (Pos 6: Audio Recorder)
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (!bgmAudioRef.current) {
      const audio = new Audio("/audio/larasati-ambient.mp3");
      audio.loop = true;
      audio.volume = 0.35;
      audio.preload = "auto";
      bgmAudioRef.current = audio;
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
        audio.play().catch(() => { });
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

  const handleLoginSuccess = (kelompok: KelompokLomba) => {
    setLoggedInKelompok(kelompok);
    setIsLoggedIn(true);
    playTransitionChime();
    setCurrentStep(1);
  };

  const handleStartStase = () => {
    setIsBriefingModalOpen(false);
    setIsTimerRunning(true);
    playTransitionChime();
  };

  const handleNextStep = () => {
    setIsTimeoutModalOpen(false);
    playTransitionChime();
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
        "relative min-h-screen w-full max-w-full overflow-x-hidden flex flex-col justify-between select-none",
        currentLombaTheme.backgroundGradient,
      )}
    >
      {/* Floating Ambient Firefly / Laron Particles */}
      <FloatingParticlesBackground />

      {/* Larasati Full Body Watermark Overlay (Bottom-Right with Theme Gradient Blend) */}
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
        />
      )}

      {/* ============================================================ */}
      {/* SCREEN PROLOG: LARASATI JOURNEY (SEBELUM LOGIN TIM)           */}
      {/* ============================================================ */}
      {!isLoggedIn && showProlog && (
        <LombaPrologScreen onProceed={() => setShowProlog(false)} />
      )}

      {/* ============================================================ */}
      {/* SCREEN AUTH: LOGIN TIM SEBELUM INTRO & SIRKUIT               */}
      {/* ============================================================ */}
      {!isLoggedIn && !showProlog && (
        <LombaAuthScreen
          contest={activeContest}
          kasus={activeKasus}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* ============================================================ */}
      {/* STEPS 1 TO 8: LOGGED IN PARTICIPANT EXAM FLOW                */}
      {/* ============================================================ */}
      {isLoggedIn && (
        <main className="relative z-10 flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
          {/* Step 1: Patient Intro & Circuit Guide Screen */}
          {currentStep === 1 && (
            <div className="w-full max-w-6xl mx-auto my-auto">
              <Step1IntroLarasati
                onStart={() => setCurrentStep(2)}
                kasus={activeKasus}
                kelompok={activeKelompok}
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
                groupName={activeKelompok?.nama}
              />

              {/* 3. Active Interactive Station Stage */}
              <div className="w-full max-w-full overflow-hidden pt-1">
                {currentStep === 2 && (
                  <Step2AnamnesisAi
                    isStarted={!isBriefingModalOpen && isTimerRunning}
                    onComplete={handleNextStep}
                    kasus={activeKasus}
                  />
                )}
                {currentStep === 3 && <Step3FaktorRisikoMagnet kasus={activeKasus} />}
                {currentStep === 4 && <Step4ProsedurIvaSequence kasus={activeKasus} />}
                {currentStep === 5 && <Step5InterpretasiMcq kasus={activeKasus} />}
                {currentStep === 6 && (
                  <Step6AsuhanAi isStarted={!isBriefingModalOpen && isTimerRunning} kasus={activeKasus} />
                )}
                {currentStep === 7 && hasAudioRecorder && <Step7AudioRecorder />}
              </div>

              {/* Bottom Safe Spacer */}
              <div className="h-28 w-full shrink-0 pointer-events-none" />
            </div>
          )}

          {/* Step 8: Final Summary & Submission Screen */}
          {currentStep === 8 && (
            <div className="w-full max-w-7xl mx-auto my-auto">
              <Step8LombaSummary
                groupName={activeKelompok?.nama}
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
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
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
