import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from './api';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PriceAlertModal from './components/PriceAlertModal';
import type { Crop, Market, PriceAlert } from './types';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('farmer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);

  const fetchMetadata = async () => {
    try {
      const [cropsRes, marketsRes] = await Promise.all([
        api.get('/crops'),
        api.get('/markets'),
      ]);
      setCrops(cropsRes.data);
      setMarkets(marketsRes.data);

      if (user?.id) {
        const alertsRes = await api.get('/alerts', { params: { user_id: user.id } });
        setAlerts(alertsRes.data);
      }
    } catch (err) {
      console.error('Error loading crops or markets:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, [user]);

  const handleLoginSuccess = (userData: any, _token: string) => {
    const fullUser = { id: 1, ...userData };
    setUser(fullUser);
    localStorage.setItem('farmer_user', JSON.stringify(fullUser));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('farmer_token');
    localStorage.removeItem('farmer_user');
    setUser(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      {/* Navigation Header */}
      <NavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pb-12">
        {activeTab === 'login' ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => setActiveTab('register')}
          />
        ) : activeTab === 'register' ? (
          <Register
            onRegisterSuccess={() => setActiveTab('login')}
            onNavigateLogin={() => setActiveTab('login')}
          />
        ) : (
          <Dashboard
            activeTab={activeTab}
            crops={crops}
            markets={markets}
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
          />
        )}
      </main>

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        crops={crops}
        markets={markets}
        alerts={alerts}
        onAlertCreated={fetchMetadata}
        user={user}
      />

      {/* Farmer-Friendly Footer */}
      <footer className="glass-panel border-t border-emerald-500/20 py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70">
          <div className="flex items-center space-x-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-white">{t('app_title')}</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AGMARKNET Official Agricultural Market Data • Tamil Nadu Agriculture Dept</span>
          </div>

          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" />
            <span>for Indian Farmers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
