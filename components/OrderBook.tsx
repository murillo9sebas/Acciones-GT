
import React from 'react';
import { OrderType, OrderBookRow } from '../types';
import { useCurrency } from '../App';

interface OrderBookProps {
  asks: OrderBookRow[];
  bids: OrderBookRow[];
  lastPrice: number | null;
  spread: number | null;
  onRowClick?: (orderId: string) => void;
}

interface RowProps {
  row: OrderBookRow;
  type: OrderType;
  maxQty: number;
  onRowClick?: (orderId: string) => void;
}

const Row: React.FC<RowProps> = ({ row, type, maxQty, onRowClick }) => {
  const { formatPrice } = useCurrency();
  const barWidth = `${(row.quantity / maxQty) * 100}%`;
  
  // Use refined colors: Green for Buy (Bid), Orange for Sell (Ask)
  const colorClass = type === OrderType.SELL ? 'text-brand-sell' : 'text-brand-buy';
  
  // Use semi-transparent brand colors for depth bars
  const barColor = type === OrderType.SELL ? 'rgba(234, 88, 12, 0.06)' : 'rgba(5, 150, 105, 0.06)';

  return (
    <div 
      onClick={() => row.orders.length > 0 && onRowClick?.(row.orders[0].id)}
      className="relative group cursor-pointer hover:bg-brand-bg transition-all duration-300 h-12 flex items-center border-b border-brand-navy/5 last:border-0 overflow-hidden"
    >
      <div 
        className="absolute inset-y-0 right-0 transition-all duration-700 ease-out pointer-events-none"
        style={{ width: barWidth, backgroundColor: barColor }}
      />
      <div className="relative z-10 w-full grid grid-cols-3 px-10 text-sm">
        <div className={`font-mono font-black text-base ${colorClass}`}>
          {formatPrice(row.price)}
        </div>
        <div className="font-mono text-brand-navy/70 text-right font-bold">
          {row.quantity.toLocaleString()}
        </div>
        <div className="font-mono text-brand-navy/40 text-right font-medium">
          {formatPrice(row.total)}
        </div>
      </div>
    </div>
  );
};

const OrderBook: React.FC<OrderBookProps> = ({ asks, bids, lastPrice, spread, onRowClick }) => {
  const { formatPrice } = useCurrency();
  const maxAskQty = Math.max(...asks.map(a => a.quantity), 1);
  const maxBidQty = Math.max(...bids.map(b => b.quantity), 1);

  return (
    <div className="bg-white border border-brand-navy/5 rounded-[2rem] overflow-hidden shadow-2xl shadow-brand-navy/5">
      <div className="grid grid-cols-3 px-10 py-5 bg-brand-bg border-b border-brand-navy/5 text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.3em]">
        <span>Precio</span>
        <span className="text-right">Acciones</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex flex-col-reverse divide-y divide-brand-navy/5 divide-y-reverse">
        {asks.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-[10px] font-black text-brand-navy/20 uppercase tracking-widest italic">Sin ofertas de venta</div>
        ) : (
          asks.map((row, i) => (
            <Row key={`ask-${i}`} row={row} type={OrderType.SELL} maxQty={maxAskQty} onRowClick={onRowClick} />
          ))
        )}
      </div>

      <div className="bg-brand-navy py-6 px-10 flex justify-between items-center shadow-inner relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-tan"></div>
        <div className="flex items-center space-x-4">
          <span className="text-[10px] text-brand-tan font-black uppercase tracking-[0.3em]">Ultimo Marcaje</span>
          <span className="text-3xl font-bold text-white font-mono tracking-tighter">
            {lastPrice ? formatPrice(lastPrice) : '—'}
          </span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-brand-navy/30 font-black uppercase tracking-[0.3em] mb-1">Diferencial (Spread)</div>
          <div className="text-sm font-mono font-black text-brand-tan">
            {spread !== null ? formatPrice(spread) : '—'}
          </div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-brand-navy/5">
        {bids.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-[10px] font-black text-brand-navy/20 uppercase tracking-widest italic">Sin ofertas de compra</div>
        ) : (
          bids.map((row, i) => (
            <Row key={`bid-${i}`} row={row} type={OrderType.BUY} maxQty={maxBidQty} onRowClick={onRowClick} />
          ))
        )}
      </div>
    </div>
  );
};

export default OrderBook;
