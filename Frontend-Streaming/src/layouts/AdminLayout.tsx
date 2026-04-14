import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Film, Users, CreditCard, FileText, Activity, LogOut } from 'lucide-react';

const adminLinks = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Contenido', path: '/admin/content', icon: Film },
  { label: 'Usuarios', path: '/admin/users', icon: Users },
  { label: 'Pagos', path: '/admin/payments', icon: CreditCard },
  { label: 'Reportes', path: '/admin/reports', icon: FileText },
  { label: 'Logs', path: '/admin/logs', icon: Activity },
];

const AdminLayout: React.FC = () => {
  const { isAdmin, logout, user } = useAuth();
  const location = useLocation();

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center px-6">
          <Link to="/home" className="text-xl font-black text-primary">STREAMIX</Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminLinks.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary">
            <LogOut className="h-4 w-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-60 flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
