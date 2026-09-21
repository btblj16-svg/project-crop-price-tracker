import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, RefreshCw } from 'lucide-react';
import api from '../api';
import StatsOverview from '../components/StatsOverview';
import PriceChart from '../components/PriceChart';
import PredictionWidget from '../components/PredictionWidget';
import MarketCompare from '../components/MarketCompare';
import WeatherWidget from '../components/WeatherWidget';
import PriceTable from '../components/PriceTable';
import type {
  Crop,
  Market,
  CropPrice,
  DashboardData,
  DynamicForecastResponse,
  WeatherData,
} from '../types';

interface DashboardProps {
  activeTab: string;
  crops: Crop[];
  markets: Market[];
  onOpenAlertModal: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab, crops, markets }) => {
  const { t, i18n } = useTranslation();

  const [selectedCropId, setSelectedCropId] = useState<number>(1);
  const [selectedMarketId, setSelectedMarketId] = useState<number>(1);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [historicalPrices, setHistoricalPrices] = useState<CropPrice[]>([]);
  const [forecastData, setForecastData] = useState<DynamicForecastResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<CropPrice[]>([]);
  const [weatherList, setWeatherList] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Selected names
  const currentCrop = crops.find((c) => c.id === selectedCropId) || crops[0];
  const currentMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];

  const cropDisplayName =
    i18n.language === 'ta' && currentCrop?.tamil_name
      ? `${currentCrop.tamil_name} (${currentCrop.name})`
      : currentCrop?.name || 'Paddy (Rice)';

  const marketDisplayName = currentMarket?.name || 'Chennai Koyambedu Mandi';

  const loadData = async () => {
    try {
      setRefreshing(true);
      // 1. Dashboard summary
      const dashResp = await api.get('/dashboard', {
        params: { crop_id: selectedCropId, market_id: selectedMarketId },
      });
      setDashboardData(dashResp.data);

      // 2. Historical prices for chart
      const histResp = await api.get('/prices/history', {
        params: { crop_id: selectedCropId, market_id: selectedMarketId, limit: 60 },
      });
      setHistoricalPrices(histResp.data);

      // 3. Dynamic ML 4-model forecast
      const fcResp = await api.get('/predictions/forecast', {
        params: { crop_id: selectedCropId, market_id: selectedMarketId, days: 7 },
      });
      setForecastData(fcResp.data);

      // 4. Market comparison across all mandis
      const compResp = await api.get('/prices/compare', {
        params: { crop_id: selectedCropId },
      });
      setComparisonData(compResp.data);

      // 5. Weather data
      const wResp = await api.get('/weather');
      setWeatherList(wResp.data);
    } catch (err) {
      console.error('Error fetching crop intelligence:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCropId, selectedMarketId]);

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
        <p className="text-emerald-200 text-sm font-semibold">{t('loading_data')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Controls: Crop Selector & Mandi Selector */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Mandi Filter Controls / சந்தை வடிகட்டி
            </h2>
            <p className="text-xs text-emerald-300/70">
              Select specific crop & mandi to view synchronized AI forecasts & trends
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Crop Selector */}
          <div className="flex-1 sm:flex-none">
            <label className="text-[11px] font-semibold text-emerald-300/80 block mb-1">
              {t('select_crop')}
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(Number(e.target.value))}
              className="bg-emerald-950/80 border border-emerald-600/40 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 min-w-[180px]"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.tamil_name ? `(${c.tamil_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Mandi Selector */}
          <div className="flex-1 sm:flex-none">
            <label className="text-[11px] font-semibold text-emerald-300/80 block mb-1">
              {t('select_market')}
            </label>
            <select
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(Number(e.target.value))}
              className="bg-emerald-950/80 border border-emerald-600/40 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 min-w-[180px]"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.district})
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={refreshing}
            className="self-end px-3 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-200 border border-emerald-600/30 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <StatsOverview
        stats={
          dashboardData?.stats || {
            total_crops: 10,
            total_markets: 10,
            average_modal_price: 3450,
            active_alerts_count: 2,
          }
        }
      />

      {/* Tab Conditional Rendering */}
      {activeTab === 'dashboard' && (
        <>
          {/* Main Chart: Historical + Forecast */}
          <PriceChart
            historicalPrices={historicalPrices}
            forecastData={forecastData}
            cropName={cropDisplayName}
            marketName={marketDisplayName}
          />

          {/* AI Multi-Model Predictions Widget */}
          <PredictionWidget
            forecastData={forecastData}
            cropName={cropDisplayName}
            marketName={marketDisplayName}
          />

          {/* Mandi Comparison */}
          <MarketCompare
            comparisonData={comparisonData}
            cropName={cropDisplayName}
          />

          {/* Weather Advisory */}
          <WeatherWidget
            weatherList={weatherList}
            selectedMarketName={marketDisplayName}
          />

          {/* Live Price Table */}
          {dashboardData && (
            <PriceTable
              prices={dashboardData.recent_prices}
              onSelectCrop={(id) => setSelectedCropId(id)}
            />
          )}
        </>
      )}

      {activeTab === 'prices' && (
        <>
          <PriceChart
            historicalPrices={historicalPrices}
            forecastData={forecastData}
            cropName={cropDisplayName}
            marketName={marketDisplayName}
          />
          {dashboardData && (
            <PriceTable
              prices={dashboardData.recent_prices}
              onSelectCrop={(id) => setSelectedCropId(id)}
            />
          )}
        </>
      )}

      {activeTab === 'predictions' && (
        <>
          <PredictionWidget
            forecastData={forecastData}
            cropName={cropDisplayName}
            marketName={marketDisplayName}
          />
          <PriceChart
            historicalPrices={historicalPrices}
            forecastData={forecastData}
            cropName={cropDisplayName}
            marketName={marketDisplayName}
          />
        </>
      )}

      {activeTab === 'markets' && (
        <MarketCompare
          comparisonData={comparisonData}
          cropName={cropDisplayName}
        />
      )}

      {activeTab === 'weather' && (
        <WeatherWidget
          weatherList={weatherList}
          selectedMarketName={marketDisplayName}
        />
      )}
    </div>
  );
};

export default Dashboard;
