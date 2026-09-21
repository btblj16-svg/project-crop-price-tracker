import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Lock, Mail, User, ArrowRight } from 'lucide-react';
import api from '../api';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateLogin }) => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/register', {
        email,
        password,
        full_name: fullName,
      });
      alert('Registration successful! Please log in with your credentials.');
      onRegisterSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Registration failed. Try another email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-emerald-400/30 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-600/30 rounded-2xl border border-emerald-400/40 text-emerald-300 mb-3 shadow-lg shadow-emerald-950/50">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('register')}</h2>
          <p className="text-xs text-emerald-200/70 mt-1">
            Join thousands of farmers tracking real-time mandi prices
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-500/40 text-red-200 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              Farmer Full Name / பெயர்
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-emerald-950/80 border border-emerald-600/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                placeholder="Murugan (விவசாயி)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-emerald-950/80 border border-emerald-600/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                placeholder="farmer@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-emerald-950/80 border border-emerald-600/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? t('loading') : t('register')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-emerald-300/80">
            Already have an account?{' '}
            <button
              onClick={onNavigateLogin}
              className="font-bold text-amber-300 hover:underline"
            >
              {t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
