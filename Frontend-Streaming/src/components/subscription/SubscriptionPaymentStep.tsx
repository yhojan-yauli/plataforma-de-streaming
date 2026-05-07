import { useState, type FormEvent } from "react";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeCardElementOptions } from "@stripe/stripe-js";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Tv2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { subscriptionService } from "@/services/subscriptionService";
import type {
  PaymentResponse,
  StripeCheckoutConfig,
  SubscriptionPlan,
} from "@/types";

const formatMoney = (amount: number, currency = "PEN") =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const stripePromiseCache = new Map<string, ReturnType<typeof loadStripe>>();

const getStripePromise = (publishableKey: string) => {
  let stripePromise = stripePromiseCache.get(publishableKey);

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
    stripePromiseCache.set(publishableKey, stripePromise);
  }

  return stripePromise;
};

const cardElementOptions: StripeCardElementOptions = {
  style: {
    base: {
      color: "#F4F4F5",
      fontSize: "16px",
      fontFamily: '"Segoe UI", sans-serif',
      iconColor: "#EF4444",
      "::placeholder": {
        color: "#8B8B93",
      },
    },
    invalid: {
      color: "#FCA5A5",
      iconColor: "#FCA5A5",
    },
  },
};

interface StripeCardCheckoutFormProps {
  plan: SubscriptionPlan;
  userEmail: string;
  testMode: boolean;
  onPaymentCompleted: (payment: PaymentResponse) => void;
  onSubmittingChange: (submitting: boolean) => void;
}

const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

function StripeCardCheckoutForm({
  plan,
  userEmail,
  testMode,
  onPaymentCompleted,
  onSubmittingChange,
}: StripeCardCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const waitForWebhookReconciliation = async (paymentId: string) => {
    let latestPayment =
      await subscriptionService.syncStripePaymentIntent(paymentId);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const payment = latestPayment.data;

      if (payment.status === "FAILED" || payment.subscription) {
        return payment;
      }

      if (payment.status !== "SUCCESS" && payment.status !== "PENDING") {
        return payment;
      }

      await sleep(1500);
      latestPayment =
        await subscriptionService.syncStripePaymentIntent(paymentId);
    }

    return latestPayment.data;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError(
        "El formulario de pago todavía se está preparando. Intenta nuevamente en unos segundos.",
      );
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setError("No se pudo montar el formulario de tarjeta.");
      return;
    }

    setSubmitting(true);
    onSubmittingChange(true);
    setError(null);

    let paymentId: string | null = null;

    try {
      const paymentIntentResponse =
        await subscriptionService.createStripePaymentIntent({
          planId: plan.id,
        });
      paymentId = paymentIntentResponse.data.paymentId;

      const confirmation = await stripe.confirmCardPayment(
        paymentIntentResponse.data.clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              email: userEmail,
            },
          },
        },
      );

      if (confirmation.error) {
        if (paymentId) {
          try {
            await subscriptionService.syncStripePaymentIntent(paymentId);
          } catch {
            // Best effort: the UI already shows the Stripe error and we keep the local record.
          }
        }

        setError(
          confirmation.error.message ?? "No pudimos confirmar la tarjeta.",
        );
        return;
      }

      const syncedPayment = await waitForWebhookReconciliation(paymentId);

      if (syncedPayment.status === "FAILED") {
        setError(
          syncedPayment.externalStatusDetail ??
            "No pudimos confirmar el pago. Intenta nuevamente con otra tarjeta o revisa tus datos.",
        );
        return;
      }

      onPaymentCompleted(syncedPayment);
    } catch (checkoutError) {
      setError(
        getApiErrorMessage(
          checkoutError,
          "No se pudo completar el pago seguro.",
        ),
      );
    } finally {
      setSubmitting(false);
      onSubmittingChange(false);
    }
  };

  return (
    <form
      id="stripe-checkout-form"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="rounded-[28px] border border-border bg-secondary/35 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Datos de pago
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Numero de tarjeta</p>
            <div className="mt-2 rounded-2xl border border-border bg-background/80 px-4 py-4">
              <CardNumberElement options={cardElementOptions} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Fecha (MM/YY)</p>
              <div className="mt-2 rounded-2xl border border-border bg-background/80 px-4 py-4">
                <CardExpiryElement options={cardElementOptions} />
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">CVC</p>
              <div className="mt-2 rounded-2xl border border-border bg-background/80 px-4 py-4">
                <CardCvcElement options={cardElementOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}

interface SubscriptionPaymentStepProps {
  plan: SubscriptionPlan;
  userEmail: string;
  checkoutConfig: StripeCheckoutConfig | null;
  loadingCheckoutConfig: boolean;
  checkoutConfigError: string | null;
  onPaymentCompleted: (payment: PaymentResponse) => void;
  onBack: () => void;
}

export function SubscriptionPaymentStep({
  plan,
  userEmail,
  checkoutConfig,
  loadingCheckoutConfig,
  checkoutConfigError,
  onPaymentCompleted,
  onBack,
}: SubscriptionPaymentStepProps) {
  const isStripeConfigured = checkoutConfig?.enabled === true;
  const publishableKey = checkoutConfig?.publishableKey ?? null;
  const stripePromise = publishableKey
    ? getStripePromise(publishableKey)
    : null;
  const isTestMode = publishableKey?.startsWith("pk_test_") === true;
  const [paying, setPaying] = useState(false);

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-[32px] border border-border bg-card/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Suscripción premium
            </p>
            <h2 className="mt-3 text-3xl font-black text-foreground">
              Activa tu suscripción premiun y sigue disfrutando sin
              interrupciones
            </h2>
          </div>
          <div className="hidden rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary md:block">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {loadingCheckoutConfig && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparando tu pago seguro...
          </div>
        )}

        {checkoutConfigError && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span>{checkoutConfigError}</span>
          </div>
        )}

        {!loadingCheckoutConfig && !checkoutConfigError && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-4 text-sm ${
              isStripeConfigured
                ? "border-emerald-500/25 bg-emerald-500/10 text-foreground"
                : "border-amber-500/25 bg-amber-500/10 text-foreground"
            }`}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck
                className={`mt-0.5 h-4 w-4 shrink-0 ${isStripeConfigured ? "text-emerald-300" : "text-amber-300"}`}
              />
              <div>
                <p className="font-medium">
                  {isStripeConfigured
                    ? "Todo listo para comenzar."
                    : "El pago no está disponible en este entorno."}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isStripeConfigured
                    ? "Tu suscripción se activará en segundos después del pago."
                    : "Intenta nuevamente más tarde o revisa la configuración del entorno antes de continuar."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-secondary/40 p-4">
            <p className="text-sm text-muted-foreground">Se activará en</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {userEmail || "Tu cuenta actual"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/40 p-4">
            <p className="text-sm text-muted-foreground">Moneda</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {checkoutConfig?.currency ?? plan.currency}
            </p>
          </div>
        </div>

        {isStripeConfigured && stripePromise ? (
          <div className="mt-8">
            <Elements stripe={stripePromise}>
              <StripeCardCheckoutForm
                plan={plan}
                userEmail={userEmail}
                testMode={isTestMode}
                onPaymentCompleted={onPaymentCompleted}
                onSubmittingChange={setPaying}
              />
            </Elements>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-border bg-secondary/25 p-4">
            <p className="text-sm font-medium text-foreground">
              Pendiente de configuración
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Cuando el pago seguro esté disponible, aquí aparecerá el
              formulario para activar tu suscripción.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-6 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            className="h-12 flex-1 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          {isStripeConfigured && (
            <Button
              type="submit"
              form="stripe-checkout-form"
              size="lg"
              disabled={paying} // ← agrega esto
              className="h-12 flex-1 rounded-full text-sm font-semibold uppercase tracking-[0.18em]"
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Activar por {formatMoney(plan.price, plan.currency)}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <aside className="rounded-[32px] border border-border bg-card/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Resumen
        </p>
        <h3 className="mt-3 text-2xl font-black text-foreground">
          {plan.months === 1 ? "1 mes" : `${plan.months} meses`}
        </h3>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-border bg-secondary/40 p-4">
            <p className="text-sm text-muted-foreground">Plan seleccionado</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {plan.description}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>Total del plan</span>
              <span className="text-xl font-black text-foreground">
                {formatMoney(plan.price, plan.currency)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>Duración</span>
              <span className="font-medium text-foreground">
                {plan.months === 1
                  ? "1 mes de acceso"
                  : `${plan.months} meses de acceso`}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Pago protegido y acceso automático
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Cuando el pago se confirma, tu acceso queda listo para que sigas
              viendo sin interrupciones.
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}
