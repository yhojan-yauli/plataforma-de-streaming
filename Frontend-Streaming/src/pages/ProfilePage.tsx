import React, { useState } from 'react';
import { Camera, Save, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Perfil actualizado');
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Completa ambos campos');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    toast.success('Se ha enviado un correo de verificación para cambiar tu contraseña');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="min-h-screen px-4 py-12 md:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold text-foreground">Mi Perfil</h1>

        {/* Avatar */}
        <div className="mb-8 flex items-center gap-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-black text-primary-foreground">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground shadow-lg hover:bg-accent">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </div>

        {/* Edit profile */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">Información Personal</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Correo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input type="email" value={email} disabled
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 pl-10 text-muted-foreground" />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar Cambios
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
            <Lock className="h-5 w-5" /> Cambiar Contraseña
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">Se enviará un correo de verificación antes de aplicar el cambio.</p>
          <div className="space-y-4">
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Contraseña actual"
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña"
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <button onClick={handleChangePassword}
              className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-foreground hover:bg-accent">
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
