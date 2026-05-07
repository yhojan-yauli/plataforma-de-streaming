import React, { useEffect, useState } from 'react';
import { Save, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';

const ProfilePage: React.FC = () => {
  const { user, syncCurrentUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [requestingVerification, setRequestingVerification] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Ingresa un nombre válido');
      return;
    }

    try {
      setSavingProfile(true);
      await userService.updateProfile({ name: name.trim() });
      await syncCurrentUser();
      toast.success('Perfil actualizado');
    } catch {
      toast.error('No se pudo actualizar tu perfil');
    } finally {
      setSavingProfile(false);
    }
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

    try {
      setChangingPassword(true);
      await userService.changePassword(currentPassword, newPassword);
      toast.success('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      toast.error('No se pudo actualizar tu contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRequestVerification = async () => {
    try {
      setRequestingVerification(true);
      const response = await userService.requestEmailVerification();
      toast.success(response.data.message);
    } catch {
      toast.error('No se pudo registrar la solicitud de verificación');
    } finally {
      setRequestingVerification(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 md:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold text-foreground">Mi Perfil</h1>

        <div className="mb-8 flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-black text-primary-foreground">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
              </span>
              <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${user?.emailVerified ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                {user?.emailVerified ? 'Correo verificado' : 'Correo pendiente'}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">Información Personal</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Correo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 pl-10 text-muted-foreground"
                />
              </div>
            </div>
            <button
              onClick={() => void handleSaveProfile()}
              disabled={savingProfile}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Cambios
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
            <Lock className="h-5 w-5" /> Cambiar Contraseña
          </h3>
          <div className="space-y-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Contraseña actual"
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Nueva contraseña"
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              onClick={() => void handleChangePassword()}
              disabled={changingPassword}
              className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-foreground hover:bg-accent disabled:opacity-50"
            >
              {changingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </div>

        {!user?.emailVerified && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-bold text-foreground">Verificación de Correo</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Si tu correo sigue pendiente, puedes registrar una nueva solicitud de verificación.
            </p>
            <button
              onClick={() => void handleRequestVerification()}
              disabled={requestingVerification}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {requestingVerification ? 'Solicitando...' : 'Solicitar Verificación'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
