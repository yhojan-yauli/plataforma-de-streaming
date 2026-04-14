import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyRevenue = [
  { month: 'Ene', revenue: 32000 }, { month: 'Feb', revenue: 35000 }, { month: 'Mar', revenue: 38000 },
  { month: 'Abr', revenue: 36000 }, { month: 'May', revenue: 42000 }, { month: 'Jun', revenue: 45200 },
  { month: 'Jul', revenue: 48000 }, { month: 'Ago', revenue: 51000 }, { month: 'Sep', revenue: 47000 },
  { month: 'Oct', revenue: 53000 }, { month: 'Nov', revenue: 55000 }, { month: 'Dic', revenue: 60000 },
];

const topContent = [
  { name: 'El Último Horizonte', views: 150000 },
  { name: 'Sombras del Pasado', views: 120000 },
  { name: 'Código Rojo', views: 95000 },
  { name: 'La Frontera', views: 88000 },
  { name: 'Despertar', views: 75000 },
];

const genreData = [
  { name: 'Acción', value: 30 }, { name: 'Drama', value: 25 }, { name: 'Comedia', value: 20 },
  { name: 'Terror', value: 15 }, { name: 'Sci-Fi', value: 10 },
];

const COLORS = ['hsl(0,72%,51%)', 'hsl(30,80%,50%)', 'hsl(200,70%,50%)', 'hsl(270,60%,50%)', 'hsl(150,60%,40%)'];

const AdminReportsPage: React.FC = () => (
  <div>
    <h1 className="mb-6 text-2xl font-bold text-foreground">Reportes</h1>
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Annual revenue */}
      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <h3 className="mb-4 text-lg font-bold text-foreground">Ingresos Anuales 2024</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
            <XAxis dataKey="month" stroke="hsl(0,0%,55%)" fontSize={12} />
            <YAxis stroke="hsl(0,0%,55%)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'hsl(0,0%,8%)', border: '1px solid hsl(0,0%,18%)', borderRadius: 8 }} />
            <Bar dataKey="revenue" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top content */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-lg font-bold text-foreground">Contenido Más Visto</h3>
        <div className="space-y-3">
          {topContent.map((c, i) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(c.views / topContent[0].views) * 100}%` }} />
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{(c.views / 1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
      </div>

      {/* Genre distribution */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-lg font-bold text-foreground">Distribución por Género</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={genreData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'hsl(0,0%,8%)', border: '1px solid hsl(0,0%,18%)', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default AdminReportsPage;
