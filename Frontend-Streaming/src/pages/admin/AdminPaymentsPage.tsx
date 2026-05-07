import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api-error';
import { adminService } from '@/services/adminService';
import type { AdminPayment, PaginatedResponse } from '@/types';

const formatPlanLabel = (payment: AdminPayment) => {
  if (!payment.plan) return 'Sin plan';
  if (payment.plan.months === 1) return '1 Mes';
  return `${payment.plan.months} Meses`;
};

const formatMoney = (amount: number, currency = 'PEN') =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const statusClassName: Record<AdminPayment['status'], string> = {
  SUCCESS: 'bg-green-500/10 text-green-400',
  PENDING: 'bg-amber-500/10 text-amber-300',
  FAILED: 'bg-destructive/10 text-destructive',
};

const statusLabel: Record<AdminPayment['status'], string> = {
  SUCCESS: 'Aprobado',
  PENDING: 'Pendiente',
  FAILED: 'Fallido',
};

const methodLabel: Partial<Record<AdminPayment['method'], string>> = {
  CARD: 'Tarjeta',
  YAPE: 'Yape',
};

const AdminPaymentsPage: React.FC = () => {
  const [paymentsPage, setPaymentsPage] = useState<PaginatedResponse<AdminPayment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPayments = async () => {
      setLoading(true);

      try {
        const response = await adminService.getPayments();
        if (!cancelled) {
          setPaymentsPage(response.data);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, 'No se pudieron cargar los pagos.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPayments();

    return () => {
      cancelled = true;
    };
  }, []);

  const payments = paymentsPage?.content ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Pagos y Suscripciones</h1>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
          <AlertCircle className="h-4 w-4 text-destructive" />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Monto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Método</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Externo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando pagos...
                  </span>
                </td>
              </tr>
            )}

            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Todavía no hay transacciones registradas.
                </td>
              </tr>
            )}

            {!loading && payments.map((payment) => (
              <tr key={payment.id} className="border-t border-border hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-foreground">{payment.userName ?? 'Usuario'}</div>
                  <div className="text-xs text-muted-foreground">{payment.userEmail}</div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{formatPlanLabel(payment)}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{formatMoney(payment.amount, payment.currency)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{methodLabel[payment.method] ?? payment.method}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-xs text-muted-foreground" title={payment.externalId ?? payment.id}>
                  {payment.externalId ?? payment.id}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClassName[payment.status]}`}>
                    {statusLabel[payment.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
