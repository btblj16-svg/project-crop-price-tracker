import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import api from '../api';

interface LoginProps {
  onLoginSuccess: (userData: any, token: string) => void;
  onNavigateRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateRegister }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('farmer@tamilnadu.agri');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await api.post('/login', { email, password });
      const { access_token, user: loggedInUser } = resp.data;
      localStorage.setItem('farmer_token', access_token);
      onLoginSuccess(loggedInUser || { id: 1, email, full_name: 'Selvam (விவசாயி)' }, access_token);
    } catch (err: any) {
      console.error(err);
      setError(t('login_failed') || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('farmer@tamilnadu.agri');
    setPassword('password123');
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-emerald-400/30 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-600/30 rounded-2xl border border-emerald-400/40 text-emerald-300 mb-3 shadow-lg shadow-emerald-950/50">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('login')}</h2>
          <p className="text-xs text-emerald-200/70 mt-1">
            Access customized mandi alerts and AI forecasts
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
                placeholder="farmer@tamilnadu.agri"
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
            <span>{loading ? t('loading') : t('login')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-5 pt-4 border-t border-emerald-700/40">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-semibold flex items-center justify-center space-x-2 transition"
          >
            <UserCheck className="w-4 h-4 text-amber-300" />
            <span>Fill Demo Farmer Credentials (Selvam)</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-emerald-300/80">
            Don't have an account?{' '}
            <button
              onClick={onNavigateRegister}
              className="font-bold text-amber-300 hover:underline"
            >
              {t('register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
