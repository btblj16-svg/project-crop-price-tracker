import React from 'react';
import { useTranslation } from 'react-i18next';
import { CloudSun, Droplets, Thermometer, CloudRain, AlertTriangle, CheckCircle } from 'lucide-react';
import type { WeatherData } from '../types';

interface WeatherWidgetProps {
  weatherList: WeatherData[];
  selectedMarketName: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weatherList, selectedMarketName }) => {
  const { t } = useTranslation();

  const currentWeather = weatherList[0] || {
    temperature: 31.5,
    humidity: 65,
    rainfall: 0.0,
    condition: 'Sunny',
    date: new Date().toISOString().slice(0, 10),
  };

  const isRainExpected = (currentWeather.rainfall || 0) > 2.0;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-700/40">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {t('weather')} - {selectedMarketName || 'Tamil Nadu'}
            </h2>
            <p className="text-xs text-emerald-300/70">
              Impact of agro-climatic conditions on crop arrival and price volatility
            </p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full badge-blue self-start sm:self-auto font-semibold">
          {currentWeather.condition || 'Moderate'}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/20 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-300">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-emerald-300/70 block">{t('temp')}</span>
            <span className="text-lg font-extrabold text-white">
              {currentWeather.temperature}°C
            </span>
          </div>
        </div>

        <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/20 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-300">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-emerald-300/70 block">{t('humidity')}</span>
            <span className="text-lg font-extrabold text-white">
              {currentWeather.humidity}%
            </span>
          </div>
        </div>

        <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/20 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-300">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-emerald-300/70 block">{t('rainfall')}</span>
            <span className="text-lg font-extrabold text-white">
              {currentWeather.rainfall} mm
            </span>
          </div>
        </div>
      </div>

      {/* Farmer Advisory Alert */}
      <div
        className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
          isRainExpected
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-200'
        }`}
      >
        {isRainExpected ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">
            {t('weather_advisory')}
          </h4>
          <p className="text-xs leading-relaxed">
            {isRainExpected ? t('rain_caution') : t('favorable_harvest')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
