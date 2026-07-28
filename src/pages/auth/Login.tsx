import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { account } from '@/lib/appwrite';
import { QrCode, User, Lock, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { checkAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await account.createEmailPasswordSession(email, password);
      await checkAuth(); // Refrescar el usuario en Zustand, lo que triggerá el redireccionamiento
    } catch (err: any) {
      console.error(err);
      setError('Credenciales incorrectas o error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-tr from-[#eef2f7] via-[#f6f8fb] to-[#e4ebf5] p-4 font-sans antialiased">
      <div className="w-full max-w-[420px] rounded-[32px] bg-white p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-zinc-100/50 flex flex-col items-center">
        
        {/* Logo Card */}
        <div className="mb-6 flex justify-center">
          <img src="/logoparroquia.jpg" className="h-20 w-20 rounded-full border-2 border-[#0047cc]/25 shadow-md object-cover animate-in fade-in zoom-in duration-300" alt="Logo Parroquia" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#0047cc] tracking-tight">AsisQR</h1>
        
        {/* Subtitle */}
        <p className="text-xs text-zinc-500 text-center max-w-[240px] leading-relaxed mt-2 mb-8">
          Sistema Inteligente de Control de Asistencia
        </p>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          {/* Email/User Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-zinc-500 pointer-events-none">
              <User className="h-5 w-5" />
            </span>
            <input
              type="email"
              placeholder="Usuario"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 w-full rounded-xl bg-[#e2e4e9] pl-12 pr-4 text-sm text-zinc-800 placeholder-zinc-500 outline-none transition-all focus:bg-[#d8dadf] border-none"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-zinc-500 pointer-events-none">
              <Lock className="h-5 w-5" />
            </span>
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 w-full rounded-xl bg-[#e2e4e9] pl-12 pr-4 text-sm text-zinc-800 placeholder-zinc-500 outline-none transition-all focus:bg-[#d8dadf] border-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-full bg-[#0047cc] hover:bg-[#003eb3] text-sm font-semibold text-white transition-all shadow-[0_4px_12px_rgba(0,71,204,0.15)] cursor-pointer flex items-center justify-center"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        {/* Forgot password */}
        <a href="#" className="text-xs text-[#0047cc] hover:underline font-semibold text-center mt-6 block">
          ¿Olvidaste tu contraseña?
        </a>

      </div>
    </div>
  );
}
