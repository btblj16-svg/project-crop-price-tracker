import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Languages, Bell, User as UserIcon, LogOut, TrendingUp, CloudSun } from 'lucide-react';

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAlertModal: () => void;
  user: any;
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAlertModal,
  user,
  onLogout
}) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Sprout },
    { id: 'prices', label: t('price_tracker'), icon: TrendingUp },
    { id: 'predictions', label: t('predictions'), icon: TrendingUp },
    { id: 'markets', label: t('market_compare'), icon: Sprout },
    { id: 'weather', label: t('weather'), icon: CloudSun },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel mb-6 border-b border-emerald-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="p-2.5 bg-emerald-600/30 rounded-xl border border-emerald-400/40 text-emerald-300 shadow-lg shadow-emerald-950/40">
            <Sprout className="w-7 h-7 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200 bg-clip-text text-transparent">
                {t('app_title')}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold badge-green">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping"></span>
                {t('live_indicator')}
              </span>
            </div>
            <p className="text-xs text-emerald-200/70">{t('tagline')}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-full pb-1 md:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 shadow-sm'
                    : 'text-emerald-100/70 hover:text-emerald-100 hover:bg-emerald-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Buttons: Language Switcher, Alerts, Farmer Auth */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/50 hover:bg-emerald-700/50 text-emerald-200 border border-emerald-500/30 text-xs font-semibold transition"
            title="Switch Language / மொழி மாற்றம்"
          >
            <Languages className="w-4 h-4 text-amber-300" />
            <span>{i18n.language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          <button
            onClick={onOpenAlertModal}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/30 text-xs font-semibold transition"
            title={t('set_alert_btn')}
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">{t('alerts')}</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-emerald-700/50">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-200">
                <div className="w-7 h-7 rounded-full bg-emerald-700/60 flex items-center justify-center font-bold text-amber-300 border border-emerald-500/30">
                  {user.full_name ? user.full_name[0].toUpperCase() : 'F'}
                </div>
                <span className="hidden md:inline font-medium">{user.full_name || 'Farmer'}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-red-300 hover:text-red-200 hover:bg-red-900/30 rounded-lg transition"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t('login')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
