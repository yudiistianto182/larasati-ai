import { Check, Award, FileSpreadsheet, HelpCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Informasi Kasus",
    subtitle: "Detail & Atribut Dinamis",
    icon: FileSpreadsheet,
  },
  {
    id: 2,
    title: "Pemilihan Pasien",
    subtitle: "Pilih Subjek Pasien",
    icon: Users,
  },
  {
    id: 3,
    title: "Skenario Soal",
    subtitle: "Draft Pertanyaan Kasus",
    icon: HelpCircle,
  },
  {
    id: 4,
    title: "Perekam Nilai",
    subtitle: "Konfigurasi & Simpan",
    icon: Award,
  },
];

interface WizardStepIndicatorProps {
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  maxStepReached: number;
}

export function WizardStepIndicator({
  currentStep,
  onStepClick,
  maxStepReached,
}: WizardStepIndicatorProps) {
  const progressPercent = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 shadow-xs backdrop-blur-md">
      {/* Progress Bar with Gradient */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary/90 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Cards Grid */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {WIZARD_STEPS.map((step) => {
          const Icon = step.icon;
          const isCurrent = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isClickable = step.id <= maxStepReached && onStepClick;

          return (
            <button
              type="button"
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 select-none",
                isCurrent &&
                  "border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20",
                isCompleted &&
                  "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer",
                !isCurrent && !isCompleted && "border-border/60 bg-muted/20 opacity-70",
                !isClickable && "cursor-default",
              )}
            >
              {/* Step Icon / Number Indicator */}
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-transform duration-200",
                  isCurrent && "bg-primary text-primary-foreground shadow-sm scale-105",
                  isCompleted && "bg-emerald-500 text-white shadow-xs",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className="size-4 stroke-[3]" />
                ) : (
                  <Icon className="size-4.5" />
                )}
              </div>

              {/* Step Titles */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Step {step.id}
                  </span>
                  {isCompleted && (
                    <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
                <span
                  className={cn(
                    "truncate text-xs font-semibold leading-tight",
                    isCurrent ? "text-foreground font-bold" : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
                <span className="truncate text-[11px] text-muted-foreground/80 hidden sm:inline-block">
                  {step.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
