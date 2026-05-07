import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Clock3, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SubscriptionConfirmationStep } from "@/components/subscription/SubscriptionConfirmationStep";
import { SubscriptionPaymentStep } from "@/components/subscription/SubscriptionPaymentStep";
import { SubscriptionPlanSelectionStep } from "@/components/subscription/SubscriptionPlanSelectionStep";
import { SubscriptionStepper } from "@/components/subscription/SubscriptionStepper";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/api-error";
import { subscriptionService } from "@/services/subscriptionService";
import { useSubscriptionStore } from "@/store";
import type { PaymentResponse, StripeCheckoutConfig, SubscriptionPlan } from "@/types";

const formatPlanLabel = (plan: SubscriptionPlan) => {
  if (plan.months === 1) return "1 mes";
  return `${plan.months} meses`;
};

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { subscription, setSubscription } = useSubscriptionStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingCheckoutConfig, setLoadingCheckoutConfig] = useState(false);
  const [checkoutConfig, setCheckoutConfig] = useState<StripeCheckoutConfig | null>(null);
  const [checkoutConfigError, setCheckoutConfigError] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] = useState<PaymentResponse | null>(null);
  const [wasRenewal, setWasRenewal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      setLoadingPlans(true);

      try {
        const plansResponse = await subscriptionService.getPlans();
        if (cancelled) return;

        setPlans(plansResponse.data);
        setSelectedPlanId((currentPlanId) => currentPlanId || plansResponse.data[1]?.id || plansResponse.data[0]?.id || "");
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "No se pudieron cargar los planes."));
        }
      } finally {
        if (!cancelled) {
          setLoadingPlans(false);
        }
      }
    };

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setCheckoutConfig(null);
      setCheckoutConfigError(null);
      return () => {
        cancelled = true;
      };
    }

    const loadCurrentSubscription = async () => {
      try {
        const currentSubscription = await subscriptionService.getCurrentSubscription();
        if (!cancelled) {
          setSubscription(currentSubscription);
        }
      } catch (loadError) {
        if (cancelled) return;

        toast.error(getApiErrorMessage(loadError, "No se pudo cargar tu suscripción actual."));
      }
    };

    const loadStripeConfig = async () => {
      setLoadingCheckoutConfig(true);
      setCheckoutConfigError(null);

      try {
        const response = await subscriptionService.getStripeConfig();
        if (!cancelled) {
          setCheckoutConfig(response.data);
        }
      } catch (configError) {
        if (!cancelled) {
          setCheckoutConfig(null);
          setCheckoutConfigError(getApiErrorMessage(configError, "No se pudo preparar el pago seguro."));
        }
      } finally {
        if (!cancelled) {
          setLoadingCheckoutConfig(false);
        }
      }
    };

    void loadCurrentSubscription();
    void loadStripeConfig();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setSubscription]);

  const handleContinueFromPlan = () => {
    if (!selectedPlan) return;

    if (!isAuthenticated) {
      toast.info("Inicia sesión para continuar con tu suscripción.");
      navigate("/login");
      return;
    }

    setCurrentStep(2);
  };

  const handlePaymentCompleted = (payment: PaymentResponse) => {
    const hadActiveSubscription = subscription?.active === true;

    if (payment.subscription) {
      setSubscription(payment.subscription);
    }

    setWasRenewal(hadActiveSubscription);
    setCompletedPayment(payment);
    setCurrentStep(3);

    if (payment.status === "SUCCESS") {
      toast.success(
        payment.subscription
          ? "Pago confirmado y suscripción activada."
          : "Pago confirmado. Estamos terminando de habilitar tu acceso."
      );
      return;
    }

    toast.info("Recibimos tu pago. Estamos preparando tu acceso.");
  };

  const handleRestartCheckout = () => {
    setCompletedPayment(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.16),_transparent_26%),linear-gradient(180deg,#050505_0%,#090909_38%,#050505_100%)] px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        {subscription?.active && (
          <div className="mb-8 rounded-[28px] border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Suscripción activa
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-black text-foreground">
                  {formatPlanLabel(subscription.plan)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vence el {new Date(subscription.endDate).toLocaleDateString("es-PE")}.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/15 bg-background/40 px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  Tiempo restante
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {subscription.daysRemaining} días y {subscription.hoursRemaining} horas
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        {loadingPlans ? (
          <div className="flex min-h-[420px] items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Reorganizando la experiencia de suscripción...
          </div>
        ) : (
          <>
            <SubscriptionStepper currentStep={currentStep} />

            {currentStep === 1 && (
              <SubscriptionPlanSelectionStep
                plans={plans}
                selectedPlanId={selectedPlanId}
                onSelectPlan={setSelectedPlanId}
                onContinue={handleContinueFromPlan}
                continueLabel={isAuthenticated ? "Continuar al pago" : "Iniciar sesión para continuar"}
              />
            )}

            {currentStep === 2 && selectedPlan && (
              <SubscriptionPaymentStep
                plan={selectedPlan}
                userEmail={user?.email ?? ""}
                checkoutConfig={checkoutConfig}
                loadingCheckoutConfig={loadingCheckoutConfig}
                checkoutConfigError={checkoutConfigError}
                onPaymentCompleted={handlePaymentCompleted}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && selectedPlan && completedPayment && (
              <SubscriptionConfirmationStep
                plan={selectedPlan}
                payment={completedPayment}
                subscription={completedPayment.subscription ?? subscription}
                wasRenewal={wasRenewal}
                onRestart={handleRestartCheckout}
                onGoHome={() => navigate("/home")}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlansPage;
