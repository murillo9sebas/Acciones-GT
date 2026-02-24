
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/dbService';
import { Asset, Order } from '../types';
import { useCurrency } from '../App';

const HomePage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setAssets(db.getAssets());
    setOrders(db.getOrders());
  }, []);

  const getAssetStats = (assetId: string) => {
    const assetOrders = orders.filter(o => o.asset_id === assetId && o.active);
    const buys = assetOrders.filter(o => o.type === 'BUY');
    const sells = assetOrders.filter(o => o.type === 'SELL');
    return {
      count: assetOrders.length,
      bestBid: buys.length > 0 ? Math.max(...buys.map(o => o.price)) : null,
      bestAsk: sells.length > 0 ? Math.min(...sells.map(o => o.price)) : null,
    };
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-brand-navy/5 pb-12">
        <div>
          <h1 className="text-6xl font-black text-brand-navy tracking-tighter uppercase italic leading-none">Market Overview</h1>
          <p className="mt-4 text-xs font-black text-brand-tan uppercase tracking-[0.3em] flex items-center">
            <span className="w-12 h-0.5 bg-brand-tan mr-4"></span>
            Mercado de Valores Guatemalteco
          </p>
        </div>
        <div className="flex">
          <div className="px-8 py-4 bg-brand-navy rounded-2xl border border-brand-navy flex items-center space-x-4 shadow-xl shadow-brand-navy/20">
            <span className="w-2.5 h-2.5 bg-brand-tan rounded-full animate-pulse shadow-[0_0_10px_#a67c52]"></span>
            <span className="text-xs font-black text-white uppercase tracking-widest">{orders.filter(o => o.active).length} Intenciones En Vivo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assets.map((asset) => {
          const stats = getAssetStats(asset.id);
          return (
            <Link 
              key={asset.id} 
              to={`/market/${asset.id}`}
              className="group bg-white p-10 rounded-[2.5rem] border border-brand-navy/5 hover:border-brand-tan hover:shadow-2xl hover:shadow-brand-tan/10 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                 <div className="p-3 bg-brand-bg rounded-xl group-hover:bg-brand-navy transition-colors">
                  <svg className="w-5 h-5 text-brand-navy/20 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-3xl font-black text-brand-navy group-hover:text-brand-tan transition-colors uppercase tracking-tighter leading-tight pr-12">{asset.name}</h3>
                <div className="w-8 h-1 bg-brand-tan mt-4 rounded-full group-hover:w-16 transition-all duration-500"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="p-5 bg-brand-bg rounded-[1.5rem] border border-brand-navy/5 group-hover:bg-brand-cream transition-colors">
                  <div className="text-[9px] font-black text-brand-navy/40 uppercase tracking-widest mb-2">Compra</div>
                  <div className="text-2xl font-mono font-black text-brand-buy">
                    {stats.bestBid ? formatPrice(stats.bestBid) : '—'}
                  </div>
                </div>
                <div className="p-5 bg-brand-bg rounded-[1.5rem] border border-brand-navy/5 group-hover:bg-brand-cream transition-colors">
                  <div className="text-[9px] font-black text-brand-navy/40 uppercase tracking-widest mb-2">Venta</div>
                  <div className="text-2xl font-mono font-black text-brand-sell">
                    {stats.bestAsk ? formatPrice(stats.bestAsk) : '—'}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-brand-navy/5 pt-6">
                <span className="text-[10px] font-black text-brand-navy/40 uppercase tracking-widest">{stats.count} Registros</span>
                <span className="text-[10px] font-black text-brand-tan uppercase tracking-widest flex items-center group-hover:translate-x-2 transition-transform">
                  Entrar <span className="ml-2">→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;
