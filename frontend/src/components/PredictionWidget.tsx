import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Award, ArrowUpRight, ArrowDownRight, Cpu, CheckCircle2 } from 'lucide-react';
import type { DynamicForecastResponse } from '../types';

interface PredictionWidgetProps {
  forecastData?: DynamicForecastResponse | null;
  cropName: string;
  marketName: string;
}

const PredictionWidget: React.FC<PredictionWidgetProps> = ({
  forecastData,
  cropName,
  marketName,
}) => {
  const { t } = useTranslation();
  const [selectedModel, setSelectedModel] = useState<string>('XGBoost');

  if (!forecastData || !forecastData.models) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center border border-emerald-500/20">
        <Sparkles className="w-8 h-8 text-amber-300 mx-auto mb-2 animate-bounce" />
        <p className="text-sm text-emerald-200">{t('loading_data')}</p>
      </div>
    );
  }

  const modelKeys = Object.keys(forecastData.models);
  const activeForecast = forecastData.models[selectedModel] || forecastData.models[modelKeys[0]];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 shadow-xl mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-emerald-700/40">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>{t('ai_forecast')}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold">
                {cropName}
              </span>
            </h2>
            <p className="text-xs text-emerald-200/70">
              {marketName} • {t('model_comparison')}
            </p>
          </div>
        </div>

        {/* Model Selector Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {modelKeys.map((key) => {
            const isSelected = (selectedModel === key) || (!selectedModel && key === 'XGBoost');
            return (
              <button
                key={key}
                onClick={() => setSelectedModel(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                    : 'bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800/60 border border-emerald-600/30'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>{key}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Performance Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {modelKeys.map((key) => {
          const m = forecastData.models[key];
          const isSelected = selectedModel === key;
          const isTop = key === 'XGBoost';

          return (
            <div
              key={key}
              onClick={() => setSelectedModel(key)}
              className={`cursor-pointer rounded-xl p-3 border transition-all ${
                isSelected
                  ? 'bg-emerald-800/50 border-amber-400/60 shadow-lg scale-[1.02]'
                  : 'bg-emerald-950/40 border-emerald-600/20 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white truncate max-w-[130px]">{key}</span>
                {isTop && (
                  <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Award className="w-3 h-3 text-amber-300" />
                    <span>{t('best_model')}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="bg-emerald-900/40 p-1.5 rounded">
                  <span className="text-emerald-300/70 block">{t('mape')}</span>
                  <span className="font-bold text-white">{m.metrics.mape}%</span>
                </div>
                <div className="bg-emerald-900/40 p-1.5 rounded">
                  <span className="text-emerald-300/70 block">{t('r2_score')}</span>
                  <span className="font-bold text-amber-300">{m.metrics.r2}</span>
                </div>
                <div className="bg-emerald-900/40 p-1.5 rounded">
                  <span className="text-emerald-300/70 block">{t('mae')}</span>
                  <span className="font-bold text-white">₹{m.metrics.mae}</span>
                </div>
                <div className="bg-emerald-900/40 p-1.5 rounded">
                  <span className="text-emerald-300/70 block">{t('rmse')}</span>
                  <span className="font-bold text-white">₹{m.metrics.rmse}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Day Day-by-Day Forecast Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-emerald-100 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {t('ai_forecast')} ({activeForecast.model_name})
            </span>
          </h3>
          <span className="text-xs text-emerald-300/80">₹ per Quintal (100 Kg)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {activeForecast.forecast.map((point, idx) => {
            const prevPoint = idx > 0 ? activeForecast.forecast[idx - 1] : null;
            const diff = prevPoint ? point.predicted_price - prevPoint.predicted_price : 0;
            const isUp = diff >= 0;

            const dayName = new Date(point.date).toLocaleDateString(undefined, {
              weekday: 'short',
            });

            return (
              <div
                key={point.date}
                className="bg-emerald-900/40 hover:bg-emerald-800/50 p-3 rounded-xl border border-emerald-500/20 text-center transition shadow-sm"
              >
                <div className="text-[11px] font-semibold text-emerald-300/80 uppercase">
                  {dayName}
                </div>
                <div className="text-[10px] text-emerald-400/60 mb-1.5">
                  {point.date.slice(5)}
                </div>
                <div className="text-base font-extrabold text-white">
                  ₹{point.predicted_price.toLocaleString()}
                </div>
                <div
                  className={`mt-1 flex items-center justify-center space-x-0.5 text-[10px] font-bold ${
                    isUp ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span>{Math.abs(diff) > 0 ? `₹${Math.abs(diff).toFixed(0)}` : 'Steady'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PredictionWidget;
