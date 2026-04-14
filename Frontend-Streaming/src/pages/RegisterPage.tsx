import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name.trim() || !email.trim() || !password.trim()) {
    toast.error('Completa todos los campos');
    return;
  }

  if (password !== confirmPassword) {
    toast.error('Las contraseñas no coinciden');
    return;
  }

  if (password.length < 6) {
    toast.error('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  setLoading(true);

  try {
    const data = await authService.register({ name, email, password }); // ✅ FIX

    if (data?.token && data?.user) {
      login(data.token, data.user);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/plans');
    } else {
      throw new Error('Respuesta inválida');
    }

  } catch (err: any) {
    console.error(err);
    toast.error('Error al registrarse');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920')] bg-cover bg-center opacity-10" />
      <div className="relative z-10 w-full max-w-md animate-fade-in rounded-xl border border-border bg-card/95 p-8 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-primary">STREAMIX</h1>
          <p className="mt-2 text-sm text-muted-foreground">Crea tu cuenta gratis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo"
              className="w-full rounded-lg border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico"
              className="w-full rounded-lg border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"
              className="w-full rounded-lg border border-border bg-secondary py-3 pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña"
              className="w-full rounded-lg border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
