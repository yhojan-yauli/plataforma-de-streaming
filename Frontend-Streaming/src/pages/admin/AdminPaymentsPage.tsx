import React from 'react';

const mockPayments = Array.from({ length: 15 }, (_, i) => ({
  id: `pay-${i}`,
  userName: `Usuario ${i + 1}`,
  plan: ['1 Mes', '3 Meses', '12 Meses'][i % 3],
  amount: [20, 50, 160][i % 3],
  method: ['Tarjeta', 'Yape', 'Mercado Pago'][i % 3],
  date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  startDate: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  endDate: new Date(Date.now() + (30 - i) * 86400000).toISOString(),
  active: i < 10,
}));

const AdminPaymentsPage: React.FC = () => (
  <div>
    <h1 className="mb-6 text-2xl font-bold text-foreground">Pagos y Suscripciones</h1>
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead className="bg-secondary">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Usuario</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Plan</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Monto</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Método</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Inicio</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Fin</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Estado</th>
          </tr>
        </thead>
        <tbody>
          {mockPayments.map((p) => (
            <tr key={p.id} className="border-t border-border hover:bg-secondary/50">
              <td className="px-4 py-3 text-sm font-medium text-foreground">{p.userName}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{p.plan}</td>
              <td className="px-4 py-3 text-sm font-medium text-foreground">S/{p.amount}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{p.method}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.startDate).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.endDate).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.active ? 'bg-green-500/10 text-green-400' : 'bg-destructive/10 text-destructive'}`}>
                  {p.active ? 'Activa' : 'Vencida'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminPaymentsPage;
