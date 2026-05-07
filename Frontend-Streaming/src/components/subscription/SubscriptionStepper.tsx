import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Plan" },
  { number: 2, label: "Pago" },
  { number: 3, label: "Activación" },
];

interface SubscriptionStepperProps {
  currentStep: number;
}

export function SubscriptionStepper({ currentStep }: SubscriptionStepperProps) {
  return (
    <div className="mx-auto mb-10 max-w-3xl px-2">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center text-center">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isActive && "border-primary bg-primary/15 text-primary shadow-lg shadow-primary/20",
                    !isComplete && !isActive && "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium uppercase tracking-[0.18em]",
                    (isComplete || isActive) ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="mx-3 h-px flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      currentStep > step.number ? "w-full bg-primary" : "w-0 bg-primary",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
