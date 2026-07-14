import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { User } from '../types';
import { loginUser } from '../services/authService';
import { UserCircle, Lock, Loader2 } from 'lucide-react';
import { Logo } from './Logo';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await loginUser(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Username atau password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8 bg-slate-900/50">
        <div className="flex flex-col items-center mb-8">
          {/* Logo Baru */}
          <Logo className="w-24 h-24 mb-4 shadow-xl shadow-blue-500/20" />
          
          <h1 className="text-2xl font-bold text-white">ShadowTeacher</h1>
          <p className="text-blue-200 text-sm mt-1">Silakan login untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Masukkan username"
                required
              />
              <UserCircle className="absolute left-3 top-3.5 text-white/40" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Masukkan password"
                required
              />
              <Lock className="absolute left-3 top-3.5 text-white/40" size={18} />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Masuk'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
};