import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Store, IndianRupee, BellRing } from 'lucide-react';
import type { DashboardStats } from '../types';

interface StatsOverviewProps {
  stats: DashboardStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const { t } = useTranslation();

  const cards = [
    {
      title: t('total_tracked_crops'),
      value: stats.total_crops || 10,
      icon: Sprout,
      color: 'from-emerald-600/30 to-emerald-900/30',
      border: 'border-emerald-500/30',
      text: 'text-emerald-300',
      tag: 'AGMARKNET'
    },
    {
      title: t('total_mandis'),
      value: stats.total_markets || 10,
      icon: Store,
      color: 'from-teal-600/30 to-teal-900/30',
      border: 'border-teal-500/30',
      text: 'text-teal-300',
      tag: 'Tamil Nadu'
    },
    {
      title: t('avg_modal_rate'),
      value: `₹${stats.average_modal_price?.toLocaleString() || '3,450'}`,
      icon: IndianRupee,
      color: 'from-amber-600/30 to-amber-900/30',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      tag: 'Quintal'
    },
    {
      title: t('active_price_alerts'),
      value: stats.active_alerts_count || 2,
      icon: BellRing,
      color: 'from-blue-600/30 to-blue-900/30',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
      tag: 'Live Monitoring'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-card p-4 rounded-xl border ${card.border} bg-gradient-to-br ${card.color} flex items-center justify-between shadow-md`}
          >
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <span className="text-xs uppercase font-bold text-emerald-200/70 tracking-wider">
                  {card.title}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-white tracking-tight">
                {card.value}
              </div>
              <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300/90 border border-emerald-500/20">
                {card.tag}
              </span>
            </div>
            <div className={`p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/20 ${card.text}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;
