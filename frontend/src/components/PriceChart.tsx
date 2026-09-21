import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Sparkles } from 'lucide-react';
import type { CropPrice, DynamicForecastResponse } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  historicalPrices: CropPrice[];
  forecastData?: DynamicForecastResponse | null;
  cropName: string;
  marketName: string;
}

const PriceChart: React.FC<PriceChartProps> = ({
  historicalPrices,
  forecastData,
  cropName,
  marketName,
}) => {
  const { t } = useTranslation();

  // Sort historical prices
  const sortedHistory = [...historicalPrices].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const historyLabels = sortedHistory.map((p) => p.date.slice(5)); // MM-DD
  const modalPrices = sortedHistory.map((p) => p.modal_price || 0);
  const minPrices = sortedHistory.map((p) => p.min_price || 0);
  const maxPrices = sortedHistory.map((p) => p.max_price || 0);

  // Extract XGBoost or best model forecast
  let forecastLabels: string[] = [];
  let forecastValues: (number | null)[] = [];

  if (forecastData && forecastData.models) {
    const primaryModel =
      forecastData.models['XGBoost'] ||
      forecastData.models['Random Forest'] ||
      Object.values(forecastData.models)[0];

    if (primaryModel && primaryModel.forecast) {
      forecastLabels = primaryModel.forecast.map((f) => f.date.slice(5));
      forecastValues = primaryModel.forecast.map((f) => f.predicted_price);
    }
  }

  // Combined labels: history + future
  const allLabels = [...historyLabels, ...forecastLabels];
  const paddedHistoryModal = [
    ...modalPrices,
    ...new Array(forecastLabels.length).fill(null),
  ];
  const paddedHistoryMin = [
    ...minPrices,
    ...new Array(forecastLabels.length).fill(null),
  ];
  const paddedHistoryMax = [
    ...maxPrices,
    ...new Array(forecastLabels.length).fill(null),
  ];

  // Align forecast line starting from last known modal price
  const lastKnownPrice = modalPrices[modalPrices.length - 1] || null;
  const paddedForecast = [
    ...new Array(Math.max(0, modalPrices.length - 1)).fill(null),
    lastKnownPrice,
    ...forecastValues,
  ];

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: t('modal_price') + ' (₹/Qtl)',
        data: paddedHistoryModal,
        borderColor: '#10b981', // Emerald green
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 2.5,
        tension: 0.3,
        pointRadius: 2.5,
        fill: true,
      },
      {
        label: t('max_price') + ' (₹/Qtl)',
        data: paddedHistoryMax,
        borderColor: '#34d399',
        borderWidth: 1,
        borderDash: [3, 3],
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: t('min_price') + ' (₹/Qtl)',
        data: paddedHistoryMin,
        borderColor: '#059669',
        borderWidth: 1,
        borderDash: [3, 3],
        tension: 0.3,
        pointRadius: 0,
      },
      ...(forecastLabels.length > 0
        ? [
            {
              label: t('ai_forecast') + ' (XGBoost ₹/Qtl)',
              data: paddedForecast,
              borderColor: '#f59e0b', // Amber
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              borderWidth: 3,
              borderDash: [5, 5],
              tension: 0.35,
              pointRadius: 4,
              pointBackgroundColor: '#fbbf24',
              fill: true,
            },
          ]
        : []),
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0',
          font: { size: 12, family: 'Inter' },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(6, 78, 59, 0.95)',
        titleColor: '#fcd34d',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(52, 211, 153, 0.4)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y;
            return val !== null ? ` ${context.dataset.label}: ₹${val.toLocaleString()}` : '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 45 },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value: any) => `₹${value}`,
        },
      },
    },
  };

  return (
    <div className="glass-panel p-5 rounded-2xl shadow-xl border border-emerald-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-700/40">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {cropName} - {marketName}
            </h2>
            <p className="text-xs text-emerald-300/70">{t('historical_trends')}</p>
          </div>
        </div>
        {forecastLabels.length > 0 && (
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-amber">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>{t('ai_forecast')}</span>
            </span>
          </div>
        )}
      </div>

      <div className="h-[320px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PriceChart;
