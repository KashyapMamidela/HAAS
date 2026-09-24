import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  currentStep,
  className,
}: {
  steps: string[];
  currentStep: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isComplete && "bg-accent text-white",
                  isCurrent && "bg-accent-soft text-accent",
                  !isComplete && !isCurrent && "bg-surface-muted text-text-muted",
                )}
              >
                {isComplete ? <Check className="size-3.5" strokeWidth={2} /> : stepNumber}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isCurrent ? "text-text" : "text-text-muted",
                )}
              >
                {step}
              </span>
            </div>
            {stepNumber < steps.length && (
              <span
                className={cn(
                  "h-px flex-1",
                  isComplete ? "bg-accent" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
