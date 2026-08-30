import * as React from "react";
import { Link, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  FileCheck,
  HeartHandshake,
  ImageIcon,
  ListChecks,
  Mic,
  ShieldAlert,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type KelompokLomba, useContestStore } from "@/stores/contest-store";
import { useKasusStore } from "@/stores/kasus-store";
import { FloatingParticlesBackground } from "./floating-particles-background";
import { LombaAuthScreen } from "./lomba-auth-screen";
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

interface StaseConfig {
  stepIndex: number;
  staseNumber: number;
  name: string;
  kodeAmplop: string;
  durationSeconds: number;
  durationMinutes: number;
  petunjukSoal: string;
  panduanPenggunaan: string;
  icon: React.ElementType;
}

const STASE_CONFIGS: StaseConfig[] = [
  {
    stepIndex: 2,
    staseNumber: 1,
    name: "Anamnesis AI (Wawancara Pasien)",
    kodeAmplop: "AMP-ANM-01",
    durationSeconds: 7 * 60,
    durationMinutes: 7,
    petunjukSoal:
      "Lakukan wawancara klinis terarah kepada Ny. Ani seputar keluhan keputihan, HPHT, riwayat obstetri, dan gejala perdarahan kontak untuk menggali indikasi pemeriksaan IVA.",
    panduanPenggunaan:
      "Bicaralah secara langsung melalui mikrofon. Sistem AI akan merespons ucapan Anda secara bergiliran. Teks transkrip otomatis terkirim setelah jeda bicara.",
    icon: Bot,
  },
  {
    stepIndex: 3,
    staseNumber: 2,
    name: "Identifikasi Faktor Risiko (Papan Magnet)",
    kodeAmplop: "AMP-RSK-02",
    durationSeconds: 5 * 60,
    durationMinutes: 5,
    petunjukSoal:
      "Tentukan faktor-faktor risiko kanker serviks dan patologi reproduksi yang teridentifikasi dari riwayat pasien Ny. Ani.",
    panduanPenggunaan:
      "Klik kartu faktor risiko pada baki atau drag & drop kartu langsung untuk menempelkannya ke Papan Magnet di bawah. Klik 'X' pada kartu di papan untuk melepasnya kembali.",
    icon: ShieldAlert,
  },
  {
    stepIndex: 4,
    staseNumber: 3,
    name: "Penyusunan Prosedur Tindakan IVA",
    kodeAmplop: "AMP-SOP-03",
    durationSeconds: 6 * 60,
    durationMinutes: 6,
    petunjukSoal:
      "Susun langkah-langkah standar operasional prosedur (SOP) pemeriksaan Inspeksi Visual Asam Asetat (IVA) secara berurutan dari langkah 1 sampai 6.",
    panduanPenggunaan:
      "Klik dan tarik di mana saja pada badan kartu untuk menggeser posisinya secara interaktif atau gunakan tombol panah Naik / Turun.",
    icon: ListChecks,
  },
  {
    stepIndex: 5,
    staseNumber: 4,
    name: "Interpretasi Visual & Pilihan Diagnosis",
    kodeAmplop: "AMP-ITP-04",
    durationSeconds: 5 * 60,
    durationMinutes: 5,
    petunjukSoal:
      "Perhatikan foto inspeksi serviks pasca aplikasi asam asetat 3-5%. Perbesar (scroll/pinch zoom) dan geser (pan) gambar untuk mengamati plak asetowhite pada SSK, lalu tentukan pilihan diagnosis klinis yang tepat.",
    panduanPenggunaan:
      "Gunakan scroll mouse atau pinch pada gambar untuk zoom. Pilih foto mini di samping kanan untuk beralih foto, lalu pilih opsi kesimpulan diagnosis A, B, C, atau D.",
    icon: ImageIcon,
  },
  {
    stepIndex: 6,
    staseNumber: 5,
    name: "Asuhan Kebidanan & Konseling Empatik AI",
    kodeAmplop: "AMP-ASH-05",
    durationSeconds: 8 * 60,
    durationMinutes: 8,
    petunjukSoal:
      "Berikan konseling hasil pemeriksaan IVA positif kepada Ny. Ani secara empatik. Jelaskan bahwa ini bukan vonis kanker melainkan lesi pra-kanker yang dapat diobati tuntas, serta jelaskan opsi krioterapi dan rujukan ke SpOG.",
    panduanPenggunaan:
      "Bicaralah melalui mikrofon untuk memberikan edukasi dan menenangkan pasien virtual. Tanggapi pertanyaan dan kecemasan Ny. Ani secara profesional.",
    icon: HeartHandshake,
  },
  {
    stepIndex: 7,
    staseNumber: 6,
    name: "Perekaman Pembicaraan Laporan Klinis",
    kodeAmplop: "AMP-REC-06",
    durationSeconds: 4 * 60,
    durationMinutes: 4,
    petunjukSoal:
      "Sampaikan laporan kesimpulan klinis, diagnosis akhir, tindakan yang telah dilakukan, serta rencana rujukan/follow-up dalam bentuk rekaman suara kepada dewan penguji.",
    panduanPenggunaan:
      "Tekan tombol 'Mulai Rekam Suara' dan bicaralah dengan jelas. Setelah selesai, tekan 'Selesai Rekam' dan Anda dapat memutar ulang hasil rekaman.",
    icon: Mic,
  },
];

export function LombaExamContainer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search: any = useSearch({ strict: false });
  const lombaId = (search?.lombaId as string) || "lomba-01";
  const initialKelompokId = (search?.kelompokId as string) || "kel-01";

  const { contests } = useContestStore();
  const { kasusList } = useKasusStore();

  const activeContest = contests.find((c) => c.id === lombaId) || contests[0];
  
  // Auth state: team login before seeing patient intro
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [loggedInKelompok, setLoggedInKelompok] = React.useState<KelompokLomba | null>(null);

  const activeKelompok =
    loggedInKelompok ||
    activeContest?.kelompok_list.find((k) => k.id === initialKelompokId) ||
    activeContest?.kelompok_list[0];

  const assignedKasusId = activeKelompok?.kasus_id || activeContest?.kasus_ids[0] || "KSS-001";
  const activeKasus = kasusList.find((k) => k.id === assignedKasusId) || kasusList[0];

  const hasAudioRecorder = activeKasus?.has_perekam_nilai ?? true;

  // Active step (1: Intro, 2: Pos 1, 3: Pos 2, 4: Pos 3, 5: Pos 4, 6: Pos 5, 7: Pos 6 Rec, 8: Summary)
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(7 * 60);
  const [showOneMinAlert, setShowOneMinAlert] = React.useState<boolean>(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = React.useState<boolean>(false);

  // Stase Briefing Modal state (shows upon entering each stase)
  const [isBriefingModalOpen, setIsBriefingModalOpen] = React.useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = React.useState<boolean>(false);

  const currentStaseConfig = STASE_CONFIGS.find((st) => st.stepIndex === currentStep);

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
        if (prev === 61) {
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

  const handleLoginSuccess = (kelompok: KelompokLomba) => {
    setLoggedInKelompok(kelompok);
    setIsLoggedIn(true);
    setCurrentStep(1);
  };

  const handleStartStase = () => {
    setIsBriefingModalOpen(false);
    setIsTimerRunning(true);
  };

  const handleNextStep = () => {
    setIsTimeoutModalOpen(false);
    if (currentStep === 6 && !hasAudioRecorder) {
      setCurrentStep(8);
    } else if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDirectSelectStase = (posNumber: number) => {
    const targetStep = posNumber + 1;
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

      {/* 1-Minute Warning Center Notification */}
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
              : STASE_CONFIGS.find((st) => st.stepIndex === currentStep + 1)?.name || "Pos Berikutnya"
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
          petunjukSoal={currentStaseConfig.petunjukSoal}
          panduanPenggunaan={currentStaseConfig.panduanPenggunaan}
        />
      )}

      {/* ============================================================ */}
      {/* STEP 0: AUTH SCREEN (LOGIN TIM SEBELUM INTRO & SIRKUIT)       */}
      {/* ============================================================ */}
      {!isLoggedIn && (
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
                {currentStep === 2 && <Step2AnamnesisAi onComplete={handleNextStep} />}
                {currentStep === 3 && <Step3FaktorRisikoMagnet />}
                {currentStep === 4 && <Step4ProsedurIvaSequence />}
                {currentStep === 5 && <Step5InterpretasiMcq />}
                {currentStep === 6 && <Step6AsuhanAi />}
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
    </div>
  );
}
