
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/dbService';
import { Asset, Order, OrderType, OrderBookRow, MarketStats, OrderEvent, EventType, Trade } from '../types';
import OrderBook from '../components/OrderBook';
import PostOrderModal from '../components/PostOrderModal';
import { useCurrency } from '../App';

const TradeChart: React.FC<{ trades: Trade[]; formatPrice: (p: number) => string }> = ({ trades, formatPrice }) => {
  if (trades.length < 2) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-brand-bg/30 rounded-[2rem] border border-dashed border-brand-navy/10">
        <svg className="w-12 h-12 text-brand-navy/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p className="text-[10px] font-black text-brand-navy/30 uppercase tracking-[0.2em]">Se requieren más datos para graficar</p>
      </div>
    );
  }

  const sortedTrades = [...trades].sort((a, b) => a.created_at - b.created_at);
  const prices = sortedTrades.map(t => t.price);
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;
  const priceRange = maxPrice - minPrice;

  const width = 800;
  const height = 300;
  const padding = 40;

  const getX = (index: number) => padding + (index * (width - 2 * padding)) / (sortedTrades.length - 1);
  const getY = (price: number) => height - padding - ((price - minPrice) * (height - 2 * padding)) / priceRange;

  const points = sortedTrades.map((t, i) => `${getX(i)},${getY(t.price)}`).join(' ');

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-brand-navy/5 shadow-xl shadow-brand-navy/5 overflow-hidden">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-xs font-black text-brand-tan uppercase tracking-[0.3em]">Tendencia de Precio</h3>
          <p className="text-[10px] text-brand-navy/40 font-bold uppercase tracking-widest mt-1">Últimas {trades.length} transacciones OTC</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-brand-navy font-mono">{formatPrice(sortedTrades[sortedTrades.length - 1].price)}</span>
          <span className="block text-[8px] font-black text-brand-buy uppercase tracking-widest">Último Cierre</span>
        </div>
      </div>
      
      <div className="relative h-[300px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = getY(minPrice + p * priceRange);
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" className="text-brand-navy/5" strokeDasharray="4 4" />
                <text x={padding - 5} y={y} textAnchor="end" alignmentBaseline="middle" className="fill-brand-navy/20 text-[10px] font-mono font-bold">
                  {Math.round(minPrice + p * priceRange)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path
            d={`M ${getX(0)},${height - padding} L ${points} L ${getX(sortedTrades.length - 1)},${height - padding} Z`}
            className="fill-brand-tan/5"
          />

          {/* Main Line */}
          <polyline
            fill="none"
            stroke="#a67c52"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-sm"
          />

          {/* Data Points */}
          {sortedTrades.map((t, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(t.price)}
              r="4"
              className="fill-white stroke-brand-tan stroke-[2px] cursor-pointer hover:r-6 transition-all"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

const MarketPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { currency, formatPrice } = useCurrency();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [initialModalType, setInitialModalType] = useState<OrderType>(OrderType.BUY);
  const [activeTab, setActiveTab] = useState<'orderbook' | 'history' | 'trades'>('orderbook');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = () => {
    if (!assetId) return;
    const a = db.getAsset(assetId);
    if (!a) {
      navigate('/');
      return;
    }
    setAsset(a);
    setOrders(db.getOrders(assetId));
    setEvents(db.getEvents(assetId));
    setTrades(db.getTrades(assetId));
    setLastRefresh(new Date());
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [assetId]);

  const marketData = useMemo(() => {
    const activeOrders = orders.filter(o => o.active);
    
    const rawAsks = activeOrders.filter(o => o.type === OrderType.SELL);
    const askGroups: Record<number, Order[]> = {};
    rawAsks.forEach(o => {
      askGroups[o.price] = [...(askGroups[o.price] || []), o];
    });
    const asks: OrderBookRow[] = Object.entries(askGroups)
      .map(([price, orders]) => ({
        price: parseFloat(price),
        quantity: orders.reduce((sum, o) => sum + o.quantity, 0),
        total: parseFloat(price) * orders.reduce((sum, o) => sum + o.quantity, 0),
        orders
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 10);

    const rawBids = activeOrders.filter(o => o.type === OrderType.BUY);
    const bidGroups: Record<number, Order[]> = {};
    rawBids.forEach(o => {
      bidGroups[o.price] = [...(bidGroups[o.price] || []), o];
    });
    const bids: OrderBookRow[] = Object.entries(bidGroups)
      .map(([price, orders]) => ({
        price: parseFloat(price),
        quantity: orders.reduce((sum, o) => sum + o.quantity, 0),
        total: parseFloat(price) * orders.reduce((sum, o) => sum + o.quantity, 0),
        orders
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 10);

    const bestAsk = asks.length > 0 ? asks[0].price : null;
    const bestBid = bids.length > 0 ? bids[0].price : null;
    
    const latestPriceEvent = [...events]
      .sort((a, b) => b.created_at - a.created_at)
      .find(e => e.event_type === EventType.CREATED || e.event_type === EventType.UPDATED);
    
    let lastPrice: number | null = null;
    if (latestPriceEvent?.event_data.price) {
      lastPrice = latestPriceEvent.event_data.price;
    } else if (bestAsk && bestBid) {
      lastPrice = (bestAsk + bestBid) / 2;
    }

    const spread = (bestAsk && bestBid) ? bestAsk - bestBid : null;
    const volumeInProcess = activeOrders.reduce((sum, o) => sum + o.quantity, 0);

    return { asks, bids, stats: { lastPrice, bestAsk, bestBid, spread, volumeInProcess } as MarketStats };
  }, [orders, events]);

  const handleOpenModal = (type: OrderType) => {
    setInitialModalType(type);
    setShowModal(true);
  };

  const handlePostOrder = (data: any) => {
    if (!assetId) return;
    db.createOrder({
      asset_id: assetId,
      ...data
    });
    setShowModal(false);
    fetchData();
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return 'justo ahora';
    return `hace ${seconds}s`;
  };

  if (!asset) return <div className="p-20 text-center font-black uppercase text-brand-navy">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Market Hero Header */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-brand-navy/5 shadow-2xl shadow-brand-navy/5 flex flex-col md:flex-row md:items-center justify-between gap-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-tan"></div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-black text-brand-navy tracking-tighter uppercase">{asset.name}</h1>
            <span className="bg-brand-navy text-brand-tan text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">{currency}</span>
          </div>
          <p className="text-[10px] text-brand-navy/40 font-black uppercase tracking-widest flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Actualizado {getTimeAgo(lastRefresh)}
          </p>
          <div className="mt-4 flex space-x-6">
            <div>
               <div className="text-[9px] font-black text-brand-tan uppercase tracking-widest mb-1">Volumen en Proceso</div>
               <div className="text-xl font-black text-brand-navy font-mono">{marketData.stats.volumeInProcess.toLocaleString()} <span className="text-[10px]">acc.</span></div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-12 px-10">
          <div className="text-center">
            <div className="text-[10px] font-black text-brand-navy/40 uppercase tracking-widest mb-2">Compra</div>
            <div className="text-4xl font-mono font-black text-brand-buy">
              {marketData.stats.bestBid ? formatPrice(marketData.stats.bestBid) : '—'}
            </div>
          </div>
          <div className="w-px h-16 bg-brand-navy/5"></div>
          <div className="text-center">
            <div className="text-[10px] font-black text-brand-navy/40 uppercase tracking-widest mb-2">Venta</div>
            <div className="text-4xl font-mono font-black text-brand-sell">
              {marketData.stats.bestAsk ? formatPrice(marketData.stats.bestAsk) : '—'}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 min-w-[200px]">
          <button 
            onClick={() => handleOpenModal(OrderType.BUY)}
            className="w-full py-5 bg-brand-navy text-white font-black rounded-full shadow-2xl shadow-brand-navy/30 hover:bg-brand-tan hover:text-brand-navy transition-all duration-300 text-sm uppercase tracking-[0.2em]"
          >
            BUY
          </button>
          <button 
            onClick={() => handleOpenModal(OrderType.SELL)}
            className="w-full py-5 bg-white border-[3px] border-brand-navy text-brand-navy font-black rounded-full hover:bg-brand-navy hover:text-white transition-all duration-300 text-sm uppercase tracking-[0.2em]"
          >
            SELL
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-brand-navy/5 p-2 rounded-2xl border border-brand-navy/5">
        <button 
          onClick={() => setActiveTab('orderbook')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
            activeTab === 'orderbook' ? 'bg-white text-brand-navy shadow-sm border border-brand-navy/5' : 'text-brand-navy/40 hover:text-brand-navy'
          }`}
        >
          Libro de Intenciones
        </button>
        <button 
          onClick={() => setActiveTab('trades')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
            activeTab === 'trades' ? 'bg-white text-brand-navy shadow-sm border border-brand-navy/5' : 'text-brand-navy/40 hover:text-brand-navy'
          }`}
        >
          Historial de Venta
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
            activeTab === 'history' ? 'bg-white text-brand-navy shadow-sm border border-brand-navy/5' : 'text-brand-navy/40 hover:text-brand-navy'
          }`}
        >
          Actividad del Panel
        </button>
      </div>

      {activeTab === 'orderbook' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <OrderBook 
            asks={marketData.asks} 
            bids={marketData.bids} 
            lastPrice={marketData.stats.lastPrice} 
            spread={marketData.stats.spread}
            onRowClick={(id) => navigate(`/order/${id}`)}
          />
          <div className="p-6 bg-brand-cream border border-brand-tan/20 rounded-[2rem] text-brand-navy text-sm flex items-start space-x-4">
            <div className="w-8 h-8 bg-brand-tan rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold leading-relaxed uppercase tracking-tighter text-xs">
              Haga clic en una fila para ver detalles de contacto. Los precios se expresan en {currency}. Este mercado es puramente informativo.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
          <TradeChart trades={trades} formatPrice={formatPrice} />
          
          <div className="bg-white border border-brand-navy/5 rounded-[2rem] overflow-hidden shadow-xl shadow-brand-navy/5">
            <div className="px-10 py-6 border-b border-brand-navy/5 bg-brand-bg/20">
              <h3 className="text-xs font-black text-brand-navy uppercase tracking-widest">Registros de Transacciones</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-brand-bg/50 border-b border-brand-navy/5">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.3em]">Fecha</th>
                  <th className="px-10 py-6 text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.3em]">Tipo</th>
                  <th className="px-10 py-6 text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.3em] text-right">Cantidad</th>
                  <th className="px-10 py-6 text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.3em] text-right">Precio Ejecución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/5">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center text-xs font-black text-brand-navy/40 uppercase tracking-widest italic">No hay historial de ventas registrado</td>
                  </tr>
                ) : (
                  [...trades].sort((a, b) => b.created_at - a.created_at).map(trade => (
                    <tr key={trade.id} className="text-sm hover:bg-brand-cream transition-colors group">
                      <td className="px-10 py-6 font-mono font-bold text-brand-navy/40 whitespace-nowrap">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-10 py-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-brand-tan/10 text-brand-tan">
                          EJECUTADA (OTC)
                        </span>
                      </td>
                      <td className="px-10 py-6 font-mono text-right font-black text-brand-navy">
                        {trade.quantity.toLocaleString()}
                      </td>
                      <td className="px-10 py-6 font-mono text-right font-black text-brand-tan text-lg">
                        {formatPrice(trade.price)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white border border-brand-navy/5 rounded-[2rem] overflow-hidden shadow-xl shadow-brand-navy/5 animate-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left">
            <thead className="bg-brand-bg border-b border-brand-navy/5">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.3em]">Tiempo</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.3em]">Evento</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.3em]">Participante</th>
                <th className="px-10 py-6 text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.3em] text-right">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/5">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-xs font-black text-brand-navy/40 uppercase tracking-widest italic">Sin actividad registrada</td>
                </tr>
              ) : (
                [...events].sort((a, b) => b.created_at - a.created_at).map(event => (
                  <tr key={event.id} className="text-sm hover:bg-brand-cream transition-colors group">
                    <td className="px-10 py-6 font-mono font-bold text-brand-navy/40 whitespace-nowrap">
                      {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        event.event_type === EventType.CREATED ? 'bg-brand-navy text-white' :
                        event.event_type === EventType.CANCELLED ? 'bg-brand-navy/10 text-brand-navy/40' :
                        'bg-brand-tan text-white'
                      }`}>
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-10 py-6 font-black text-brand-navy">
                      {event.event_data.alias || '—'}
                    </td>
                    <td className="px-10 py-6 font-mono text-right font-black text-brand-navy text-lg">
                      {event.event_data.price ? formatPrice(event.event_data.price) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <PostOrderModal 
          assetName={asset.name}
          assetId={asset.id}
          initialType={initialModalType}
          onClose={() => setShowModal(false)}
          onSubmit={handlePostOrder}
        />
      )}
    </div>
  );
};

export default MarketPage;
