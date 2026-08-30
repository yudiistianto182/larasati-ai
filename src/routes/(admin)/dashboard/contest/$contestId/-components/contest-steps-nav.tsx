import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
  title: string;
  duration?: number; // Optional pos duration in minutes
}

interface ContestStepsNavProps {
  stepsList: Step[];
  activeStep: number;
  onStepChange: (stepId: number) => void;
  onAddStepClick: () => void;
}

export function ContestStepsNav({
  stepsList,
  activeStep,
  onStepChange,
  onAddStepClick,
}: ContestStepsNavProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
      {/* Left Capsule: Steps Flow List */}
      <nav className="flex-1 flex items-center border rounded-2xl bg-card p-3.5 px-6 shadow-xs overflow-x-auto min-w-0">
        <div className="flex w-full items-center justify-start gap-x-4">
          {stepsList.map((step, idx) => {
            const isActive = step.id === activeStep;
            const isCompleted = step.id < activeStep;

            return (
              <React.Fragment key={step.id}>
                {/* Step indicator */}
                <button
                  type="button"
                  onClick={() => onStepChange(step.id)}
                  className="flex items-center gap-2 group outline-none select-none text-left shrink-0"
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border text-xs font-bold transition-all",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/20"
                        : isCompleted
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-muted text-muted-foreground group-hover:border-foreground/40 group-hover:text-foreground"
                    )}
                  >
                    {step.id}
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-sm font-medium transition-colors",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </button>

                {/* Progress bar line between steps */}
                {idx < stepsList.length - 1 && (
                  <div
                    className={cn(
                      "h-px w-8 lg:w-16 shrink-0 transition-colors",
                      isCompleted ? "bg-emerald-500" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      {/* Right Capsule: Dynamic Pos Add Button */}
      <div className="border rounded-2xl bg-card p-3.5 px-4 shadow-xs flex items-center justify-center shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-dashed border-primary/40 hover:border-primary text-primary hover:bg-primary/5 rounded-xl font-semibold"
          onClick={onAddStepClick}
        >
          <Plus className="size-4" /> Tambah Pos
        </Button>
      </div>
    </div>
  );
}
