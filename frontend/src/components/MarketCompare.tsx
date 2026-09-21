import React from 'react';
import { useTranslation } from 'react-i18next';
import { Store, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import type { CropPrice } from '../types';

interface MarketCompareProps {
  comparisonData: CropPrice[];
  cropName: string;
}

const MarketCompare: React.FC<MarketCompareProps> = ({ comparisonData, cropName }) => {
  const { t } = useTranslation();

  if (!comparisonData || comparisonData.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 text-center">
        <Store className="w-8 h-8 text-emerald-300 mx-auto mb-2 opacity-50" />
        <p className="text-sm text-emerald-200">No market comparison data available.</p>
      </div>
    );
  }

  // Sort by modal price descending
  const sorted = [...comparisonData].sort((a, b) => (b.modal_price || 0) - (a.modal_price || 0));
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const spread = (highest?.modal_price || 0) - (lowest?.modal_price || 0);
  const maxPriceVal = highest?.modal_price || 1;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-700/40">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {t('market_compare')} - {cropName}
            </h2>
            <p className="text-xs text-emerald-300/70">
              Compare mandi rates across Tamil Nadu to maximize your farm income
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300">Highest:</span>
            <span className="font-bold text-white">₹{highest?.modal_price?.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300">Spread:</span>
            <span className="font-bold text-amber-200">₹{spread.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-700/50 text-emerald-300 text-xs uppercase tracking-wider">
              <th className="pb-3 font-semibold">Mandi / Market</th>
              <th className="pb-3 font-semibold">District</th>
              <th className="pb-3 font-semibold text-right">{t('min_price')}</th>
              <th className="pb-3 font-semibold text-right">{t('modal_price')}</th>
              <th className="pb-3 font-semibold text-right">{t('max_price')}</th>
              <th className="pb-3 font-semibold text-right">Price Index</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-800/30">
            {sorted.map((item, index) => {
              const ratio = ((item.modal_price || 0) / maxPriceVal) * 100;
              const isBest = index === 0;

              return (
                <tr key={item.id} className="hover:bg-emerald-800/20 transition">
                  <td className="py-3 font-semibold text-white flex items-center space-x-2">
                    <span className="text-xs w-5 text-emerald-400/80">{index + 1}.</span>
                    <span>{item.market_name}</span>
                    {isBest && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Top Rate
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-emerald-200/70">{item.market_district || 'Tamil Nadu'}</td>
                  <td className="py-3 text-right text-emerald-300">₹{item.min_price?.toLocaleString()}</td>
                  <td className="py-3 text-right font-bold text-amber-300">
                    ₹{item.modal_price?.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-emerald-300">₹{item.max_price?.toLocaleString()}</td>
                  <td className="py-3 text-right w-36">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-20 bg-emerald-950 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isBest ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                      <span className="text-xs text-emerald-300/80 font-mono w-8">
                        {ratio.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketCompare;
