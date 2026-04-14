import React, { useEffect, useState } from 'react';
import { Users, Film, DollarSign, TrendingUp, Eye, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar stats reales
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStats();
      setStats(res.data);
    } catch (error) {
      console.log(error);
      toast.error('Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 🔹 Loading UI
  if (loading) {
    return <p className="text-center py-10">Cargando dashboard...</p>;
  }

  // 🔹 Mapear datos reales
  const statsData = [
    { label: 'Usuarios Totales', value: stats.totalUsers, icon: Users },
    { label: 'Usuarios Activos', value: stats.activeUsers, icon: Activity },
    { label: 'Contenido Total', value: stats.totalContent, icon: Film },
    { label: 'Ingresos del Mes', value: `S/ ${stats.monthlyRevenue}`, icon: DollarSign },
    { label: 'Suscripciones Activas', value: stats.activeSubscriptions, icon: TrendingUp },
    { label: 'Visualizaciones Hoy', value: stats.todayViews, icon: Eye },
  ];

  // 🔹 (Temporal) datos gráficos (luego los conectamos al backend)
  const revenueData = [
    { month: 'Ene', revenue: 32000 },
    { month: 'Feb', revenue: 35000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Abr', revenue: 36000 },
    { month: 'May', revenue: 42000 },
    { month: 'Jun', revenue: 45200 },
  ];

  const viewsData = [
    { day: 'Lun', views: 12000 },
    { day: 'Mar', views: 15000 },
    { day: 'Mié', views: 18000 },
    { day: 'Jue', views: 14000 },
    { day: 'Vie', views: 22000 },
    { day: 'Sáb', views: 28000 },
    { day: 'Dom', views: 34000 },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Dashboard</h1>

      {/* STATS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsData.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-black text-foreground">
              {value}
            </p>

            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* INGRESOS */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-lg font-bold text-foreground">Ingresos Mensuales</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="month" stroke="hsl(0,0%,55%)" />
              <YAxis stroke="hsl(0,0%,55%)" />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(0,72%,51%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* VIEWS */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-lg font-bold text-foreground">Visualizaciones (Semana)</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="day" stroke="hsl(0,0%,55%)" />
              <YAxis stroke="hsl(0,0%,55%)" />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="hsl(0,72%,51%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;