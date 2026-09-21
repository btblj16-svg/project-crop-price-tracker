import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import type { CropPrice } from '../types';

interface PriceTableProps {
  prices: CropPrice[];
  onSelectCrop?: (cropId: number) => void;
}

const PriceTable: React.FC<PriceTableProps> = ({ prices, onSelectCrop }) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrices = prices.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchName = (p.crop_name || '').toLowerCase().includes(term);
    const matchTamil = (p.crop_tamil_name || '').toLowerCase().includes(term);
    const matchMarket = (p.market_name || '').toLowerCase().includes(term);
    const matchVariety = (p.variety || '').toLowerCase().includes(term);
    return matchName || matchTamil || matchMarket || matchVariety;
  });

  return (
    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 shadow-xl mb-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-700/40">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <span>{t('price_tracker')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full badge-green">
              {filteredPrices.length} Records
            </span>
          </h2>
          <p className="text-xs text-emerald-300/70">{t('source_badge')}</p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-emerald-950/80 border border-emerald-600/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-700/50 text-emerald-300 text-xs uppercase tracking-wider">
              <th className="pb-3 font-semibold">Crop / பயிர்</th>
              <th className="pb-3 font-semibold">Mandi / சந்தை</th>
              <th className="pb-3 font-semibold">Variety</th>
              <th className="pb-3 font-semibold text-right">{t('min_price')} (₹)</th>
              <th className="pb-3 font-semibold text-right">{t('modal_price')} (₹)</th>
              <th className="pb-3 font-semibold text-right">{t('max_price')} (₹)</th>
              <th className="pb-3 font-semibold text-right">{t('arrival_qty')}</th>
              <th className="pb-3 font-semibold text-right">{t('date')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-800/30">
            {filteredPrices.slice(0, 20).map((row) => {
              const displayName =
                i18n.language === 'ta' && row.crop_tamil_name
                  ? `${row.crop_tamil_name} (${row.crop_name})`
                  : row.crop_name;

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectCrop && onSelectCrop(row.crop_id)}
                  className="hover:bg-emerald-800/30 transition cursor-pointer"
                >
                  <td className="py-3 font-bold text-white flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{displayName}</span>
                  </td>
                  <td className="py-3 text-emerald-200">
                    <div>{row.market_name}</div>
                    <div className="text-[10px] text-emerald-400/70">{row.market_district}</div>
                  </td>
                  <td className="py-3 text-xs text-emerald-300/80">
                    <span className="px-2 py-0.5 rounded bg-emerald-900/50 border border-emerald-700/40">
                      {row.variety || 'Standard'}
                    </span>
                  </td>
                  <td className="py-3 text-right text-emerald-300">
                    ₹{row.min_price?.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-extrabold text-amber-300 text-base">
                    ₹{row.modal_price?.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-emerald-300">
                    ₹{row.max_price?.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-xs text-emerald-200/90 font-mono">
                    {row.arrival_quantity ? `${row.arrival_quantity} Qtl` : '-'}
                  </td>
                  <td className="py-3 text-right text-xs text-emerald-400/70 font-mono">
                    {row.date}
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

export default PriceTable;
