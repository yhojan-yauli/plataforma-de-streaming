import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Smartphone, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/types';

const plans = [
  { id: '1', type: '1_MONTH' as const, months: 1, price: 20, label: '1 Mes', savings: '' },
  { id: '2', type: '3_MONTHS' as const, months: 3, price: 50, label: '3 Meses', savings: 'Ahorra 17%' },
  { id: '3', type: '12_MONTHS' as const, months: 12, price: 160, label: '12 Meses', savings: 'Ahorra 33%' },
];

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);
  const [customMonths, setCustomMonths] = useState(2);
  const [isCustom, setIsCustom] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [availableAmount, setAvailableAmount] = useState<number | ''>('');
  const [showPartial, setShowPartial] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalPrice = isCustom ? customMonths * 20 : selectedPlan.price;
  const monthlyPrice = isCustom ? 20 : selectedPlan.price / selectedPlan.months;

  /** Proportional access calculation (regla de 3) */
  const calculateProportional = () => {
    if (typeof availableAmount !== 'number' || availableAmount <= 0) return null;
    const fullDays = (isCustom ? customMonths : selectedPlan.months) * 30;
    const proportionalDays = (availableAmount / totalPrice) * fullDays;
    const days = Math.floor(proportionalDays);
    const hours = Math.round((proportionalDays - days) * 24);
    return { days, hours };
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment
      await new Promise((r) => setTimeout(r, 2000));
      toast.success('¡Pago procesado exitosamente!');
      navigate('/home');
    } catch {
      toast.error('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const proportional = calculateProportional();

  return (
    <div className="min-h-screen px-4 py-12 md:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground">Elige tu plan</h1>
        <p className="mb-10 text-center text-muted-foreground">Accede a todo el contenido. Cancela cuando quieras.</p>

        {/* Plans */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => { setSelectedPlan(plan); setIsCustom(false); }}
              className={`relative rounded-xl border p-5 text-left transition-all ${
                !isCustom && selectedPlan.id === plan.id
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground'
              }`}
            >
              {plan.savings && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {plan.savings}
                </span>
              )}
              <h3 className="text-lg font-bold text-foreground">{plan.label}</h3>
              <p className="mt-1 text-2xl font-black text-foreground">S/{plan.price}</p>
              <p className="text-sm text-muted-foreground">S/{(plan.price / plan.months).toFixed(0)}/mes</p>
              {!isCustom && selectedPlan.id === plan.id && (
                <Check className="absolute right-3 top-5 h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Custom plan */}
        <div className={`mb-8 rounded-xl border p-5 transition-all ${isCustom ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
          <button onClick={() => setIsCustom(true)} className="flex w-full items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Plan Personalizado</h3>
              <p className="text-sm text-muted-foreground">Elige la cantidad de meses que necesites</p>
            </div>
            {isCustom && <Check className="h-5 w-5 text-primary" />}
          </button>
          {isCustom && (
            <div className="mt-4 flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={24}
                value={customMonths}
                onChange={(e) => setCustomMonths(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 rounded-lg border border-border bg-secondary px-3 py-2 text-center text-foreground focus:border-primary focus:outline-none"
              />
              <span className="text-muted-foreground">meses × S/20 = <strong className="text-foreground">S/{customMonths * 20}</strong></span>
            </div>
          )}
        </div>

        {/* Payment method */}
        <h2 className="mb-4 text-lg font-bold text-foreground">Método de pago</h2>
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {([
            { method: 'CARD' as PaymentMethod, icon: CreditCard, label: 'Tarjeta' },
            { method: 'MERCADO_PAGO' as PaymentMethod, icon: Wallet, label: 'Mercado Pago' },
            { method: 'YAPE' as PaymentMethod, icon: Smartphone, label: 'Yape' },
          ]).map(({ method, icon: Icon, label }) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
                paymentMethod === method ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* Partial payment */}
        <div className="mb-8 rounded-xl border border-border bg-card p-5">
          <button onClick={() => setShowPartial(!showPartial)} className="text-sm font-medium text-primary hover:underline">
            ¿No tienes el monto completo? Calcula tu acceso proporcional
          </button>
          {showPartial && (
            <div className="mt-4">
              <label className="mb-2 block text-sm text-muted-foreground">¿Cuánto puedes pagar?</label>
              <input
                type="number"
                min={1}
                value={availableAmount}
                onChange={(e) => setAvailableAmount(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="Ej: 3"
                className="w-40 rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none"
              />
              {proportional && (
                <div className="mt-3 rounded-lg bg-primary/10 p-3 text-sm text-foreground">
                  Con <strong>S/{availableAmount}</strong> tendrás acceso por{' '}
                  <strong>{proportional.days} días y {proportional.hours} horas</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-primary bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Total a pagar</h3>
              <p className="text-sm text-muted-foreground">
                {isCustom ? `${customMonths} meses` : selectedPlan.label} · {paymentMethod === 'CARD' ? 'Tarjeta' : paymentMethod === 'YAPE' ? 'Yape' : 'Mercado Pago'}
              </p>
            </div>
            <span className="text-3xl font-black text-primary">S/{showPartial && typeof availableAmount === 'number' ? availableAmount : totalPrice}</span>
          </div>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
