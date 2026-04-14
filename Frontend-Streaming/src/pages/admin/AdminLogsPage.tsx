import React, { useState } from 'react';
import { Filter } from 'lucide-react';

const mockLogs = Array.from({ length: 30 }, (_, i) => ({
  id: `log-${i}`,
  action: ['USER_LOGIN', 'CONTENT_CREATED', 'PAYMENT_PROCESSED', 'USER_REGISTERED', 'CONTENT_UPDATED', 'SUBSCRIPTION_EXPIRED'][i % 6],
  userId: i % 3 === 0 ? undefined : `user-${i}`,
  details: [
    'Usuario inició sesión desde Chrome/Windows',
    'Se creó nueva película: "El Último Horizonte"',
    'Pago de S/50 procesado exitosamente',
    'Nuevo usuario registrado: user@email.com',
    'Se actualizó el contenido ID: 123',
    'Suscripción del usuario user@email.com ha expirado',
  ][i % 6],
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  level: (['INFO', 'INFO', 'INFO', 'INFO', 'WARNING', 'ERROR'] as const)[i % 6],
}));

const AdminLogsPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR'>('ALL');

  const filtered = filter === 'ALL' ? mockLogs : mockLogs.filter((l) => l.level === filter);

  const levelColors = {
    INFO: 'bg-blue-500/10 text-blue-400',
    WARNING: 'bg-yellow-500/10 text-yellow-400',
    ERROR: 'bg-destructive/10 text-destructive',
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Logs del Sistema</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(['ALL', 'INFO', 'WARNING', 'ERROR'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === level ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((log) => (
          <div key={log.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <span className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${levelColors[log.level]}`}>
              {log.level}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{log.action}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{log.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLogsPage;
