import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, BellRing, Check } from 'lucide-react';
import api from '../api';
import type { Crop, Market, PriceAlert } from '../types';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  crops: Crop[];
  markets: Market[];
  alerts: PriceAlert[];
  onAlertCreated: () => void;
  user: any;
}

const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  crops,
  markets,
  alerts,
  onAlertCreated,
  user,
}) => {
  const { t } = useTranslation();
  const [selectedCropId, setSelectedCropId] = useState<number>(crops[0]?.id || 1);
  const [selectedMarketId, setSelectedMarketId] = useState<number>(markets[0]?.id || 1);
  const [thresholdPrice, setThresholdPrice] = useState<string>('3000');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in as a farmer to save alerts.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    try {
      await api.post('/alerts', {
        user_id: user.id || 1,
        crop_id: Number(selectedCropId),
        market_id: Number(selectedMarketId),
        threshold_price: parseFloat(thresholdPrice),
        direction,
        is_active: true,
      });
      setSuccessMsg('Price Alert activated successfully!');
      onAlertCreated();
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      alert('Failed to create alert. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-emerald-400/30 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/40 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-emerald-700/40">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t('set_alert_btn')}</h2>
            <p className="text-xs text-emerald-300/70">
              Get notified immediately when mandi modal price breaches target
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              {t('select_crop')}
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(Number(e.target.value))}
              className="w-full bg-emerald-950/80 border border-emerald-600/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.tamil_name ? `(${c.tamil_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              {t('select_market')}
            </label>
            <select
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(Number(e.target.value))}
              className="w-full bg-emerald-950/80 border border-emerald-600/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.district})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                {t('alert_threshold')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-emerald-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={thresholdPrice}
                  onChange={(e) => setThresholdPrice(e.target.value)}
                  className="w-full bg-emerald-950/80 border border-emerald-600/40 rounded-xl pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  placeholder="3000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                {t('alert_direction')}
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
                className="w-full bg-emerald-950/80 border border-emerald-600/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="above">{t('above')}</option>
                <option value="below">{t('below')}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : t('save_alert')}
            </button>
          </div>
        </form>

        {/* Existing Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-emerald-700/40">
            <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2">
              Active Alerts ({alerts.length})
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-600/20 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{a.crop_name}</span>
                    <span className="text-emerald-300/70 ml-1.5">• {a.market_name}</span>
                    <div className="text-[11px] text-amber-300 mt-0.5">
                      {a.direction === 'above' ? '▲ Above' : '▼ Below'} ₹{a.threshold_price}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold badge-green">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAlertModal;
