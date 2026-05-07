import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types";

const formatMoney = (amount: number, currency = "PEN") =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const getPlanHighlight = (plan: SubscriptionPlan) => {
  if (plan.months === 3) {
    return "Popular";
  }

  if (plan.months >= 12) {
    return "Mejor valor";
  }

  return null;
};

interface SubscriptionPlanSelectionStepProps {
  plans: SubscriptionPlan[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
  onContinue: () => void;
  continueLabel: string;
}

export function SubscriptionPlanSelectionStep({
  plans,
  selectedPlanId,
  onSelectPlan,
  onContinue,
  continueLabel,
}: SubscriptionPlanSelectionStepProps) {
  return (
    <section className="space-y-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Suscripción premium
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
          Elige cómo quieres disfrutar tu contenido
        </h1>
        <p className="mt-3 text-base text-muted-foreground md:text-lg">
          Activa tu suscripción y accede al catálogo completo con una experiencia simple, clara y segura.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const highlight = getPlanHighlight(plan);

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectPlan(plan.id)}
              className={cn(
                "relative overflow-hidden rounded-[28px] border p-7 text-left transition-all duration-300",
                "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]",
                isSelected
                  ? "border-primary bg-primary/10 shadow-[0_18px_60px_rgba(229,9,20,0.22)]"
                  : "border-border bg-card/90 hover:border-primary/40 hover:bg-card",
              )}
            >
              {highlight && (
                <span className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground">
                  {highlight}
                </span>
              )}

              <div className="flex h-full flex-col">
                <div className="mb-8">
                  <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                    {plan.months === 1 ? "1 mes" : `${plan.months} meses`}
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-foreground">
                    {formatMoney(plan.price, plan.currency)}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatMoney(plan.price / plan.months, plan.currency)} por mes
                  </p>
                </div>

                <p className="max-w-[24ch] text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {plan.months === 1 ? "Pago mensual" : `Pago por ${plan.months} meses`}
                  </span>
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-transparent",
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!selectedPlanId}
          className="h-12 rounded-full px-10 text-sm font-semibold uppercase tracking-[0.18em]"
        >
          {continueLabel}
        </Button>
        <p className="text-sm text-muted-foreground">
          Antes de confirmar, podrás revisar tu plan y el monto total.
        </p>
      </div>
    </section>
  );
}
