import { CheckCircle2, Clock3, CreditCard, Home, RotateCcw, ShieldCheck, Tv2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentResponse, Subscription, SubscriptionPlan } from "@/types";

const formatMoney = (amount: number, currency = "PEN") =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

interface SubscriptionConfirmationStepProps {
  plan: SubscriptionPlan;
  payment: PaymentResponse;
  subscription: Subscription | null;
  wasRenewal: boolean;
  onRestart: () => void;
  onGoHome: () => void;
}

export function SubscriptionConfirmationStep({
  plan,
  payment,
  subscription,
  wasRenewal,
  onRestart,
  onGoHome,
}: SubscriptionConfirmationStepProps) {
  const isSuccessful = payment.status === "SUCCESS";
  const isPending = payment.status === "PENDING";
  const Icon = isPending ? Clock3 : CheckCircle2;
  const iconClasses = isPending
    ? "bg-amber-500/15 text-amber-300"
    : "bg-emerald-500/15 text-emerald-300";
  const eyebrow = isPending ? "Activación en curso" : "Confirmación";
  const title = isSuccessful
    ? (subscription ? (wasRenewal ? "Suscripción actualizada" : "Suscripción activada") : "Pago confirmado")
    : (isPending ? "Estamos preparando tu acceso" : "Pago registrado");
  const description = isSuccessful
    ? (subscription
      ? "El pago fue aprobado y tu acceso premium ya quedó habilitado."
      : "Tu pago fue confirmado y estamos terminando de dejar tu acceso listo.")
    : "Recibimos tu pago y estamos completando la activación de tu suscripción. Esto suele tardar solo unos segundos.";

  return (
    <section className="mx-auto max-w-3xl rounded-[36px] border border-border bg-card/95 p-8 text-center shadow-[0_32px_110px_rgba(0,0,0,0.28)] md:p-10">
      <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${iconClasses}`}>
        <Icon className="h-10 w-10" />
      </div>

      <p className={`mt-6 text-sm font-semibold uppercase tracking-[0.24em] ${isPending ? "text-amber-300" : "text-emerald-300"}`}>
        {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        {description}
      </p>

      <div className="mt-10 grid gap-4 text-left md:grid-cols-2">
        <div className="rounded-[28px] border border-border bg-secondary/35 p-5">
          <p className="text-sm text-muted-foreground">Plan activo</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {plan.months === 1 ? "1 mes" : `${plan.months} meses`}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {plan.description}
          </p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/35 p-5">
          <p className="text-sm text-muted-foreground">Cargo realizado</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {formatMoney(payment.amount, payment.currency)}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4 text-primary" />
            Pago procesado con verificación segura
          </p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/35 p-5">
          <p className="text-sm text-muted-foreground">Vigencia</p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString("es-PE") : "Pendiente de activación"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {subscription?.endDate
              ? "Tu acceso queda activo hasta esa fecha."
              : "Tu acceso se está preparando y quedará listo en breve."}
          </p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/35 p-5">
          <p className="text-sm text-muted-foreground">Estado del acceso</p>
          <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            {subscription ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Tv2 className="h-4 w-4 text-primary" />}
            {subscription ? "Premium activo" : "En proceso de activación"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {subscription
              ? "Tu cuenta ya puede reproducir contenido protegido."
              : "Estamos terminando de habilitar tu acceso para que puedas seguir viendo sin interrupciones."}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={onGoHome} className="h-12 rounded-full px-8">
          <Home className="h-4 w-4" />
          Ir al inicio
        </Button>
        <Button size="lg" variant="outline" onClick={onRestart} className="h-12 rounded-full px-8">
          <RotateCcw className="h-4 w-4" />
          Elegir otro plan
        </Button>
      </div>
    </section>
  );
}
