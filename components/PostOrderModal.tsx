
import React, { useState } from 'react';
import { OrderType } from '../types';

interface PostOrderModalProps {
  assetName: string;
  assetId: string;
  initialType: OrderType;
  onClose: () => void;
  onSubmit: (data: {
    type: OrderType;
    price: number;
    quantity: number;
    alias: string;
    contact: string;
    notes: string;
  }) => void;
}

const PostOrderModal: React.FC<PostOrderModalProps> = ({ assetName, initialType, onClose, onSubmit }) => {
  const [type, setType] = useState<OrderType>(initialType);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [alias, setAlias] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !quantity || !alias || !contact) return;
    onSubmit({
      type,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      alias,
      contact,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-navy/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-brand-navy/5">
        <div className="p-8 border-b border-brand-navy/5 flex justify-between items-center bg-brand-bg/30">
          <div>
            <h2 className="text-2xl font-black text-brand-navy uppercase tracking-tighter">Publicar Intención</h2>
            <p className="text-[10px] font-black text-brand-tan uppercase tracking-widest mt-1">{assetName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-brand-navy/20 hover:text-brand-navy transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex p-1.5 bg-brand-bg rounded-2xl border border-brand-navy/5">
            <button
              type="button"
              onClick={() => setType(OrderType.BUY)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                type === OrderType.BUY ? 'bg-white text-brand-buy shadow-md' : 'text-brand-navy/30 hover:text-brand-navy'
              }`}
            >
              Compra (BUY)
            </button>
            <button
              type="button"
              onClick={() => setType(OrderType.SELL)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                type === OrderType.SELL ? 'bg-white text-brand-sell shadow-md' : 'text-brand-navy/30 hover:text-brand-navy'
              }`}
            >
              Venta (SELL)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-brand-navy/30 uppercase tracking-widest mb-2">Precio (GTQ)</label>
              <input
                required
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-5 py-4 bg-brand-bg border border-brand-navy/5 rounded-2xl focus:ring-4 focus:ring-brand-navy/5 focus:border-brand-navy transition-all outline-none font-mono font-black text-lg text-brand-navy"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-brand-navy/30 uppercase tracking-widest mb-2">Acciones</label>
              <input
                required
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-5 py-4 bg-brand-bg border border-brand-navy/5 rounded-2xl focus:ring-4 focus:ring-brand-navy/5 focus:border-brand-navy transition-all outline-none font-mono font-black text-lg text-brand-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-brand-navy/30 uppercase tracking-widest mb-2">Alias Público</label>
            <input
              required
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Ej. Inversionista_GT"
              className="w-full px-5 py-4 bg-brand-bg border border-brand-navy/5 rounded-2xl focus:ring-4 focus:ring-brand-navy/5 focus:border-brand-navy transition-all outline-none font-bold text-brand-navy"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-brand-navy/30 uppercase tracking-widest mb-2">Contacto Privado</label>
            <input
              required
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email o Teléfono"
              className="w-full px-5 py-4 bg-brand-bg border border-brand-navy/5 rounded-2xl focus:ring-4 focus:ring-brand-navy/5 focus:border-brand-navy transition-all outline-none font-bold text-brand-navy"
            />
            <p className="mt-2 text-[10px] text-brand-navy/30 font-bold uppercase italic tracking-wider">Solo visible para administradores.</p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-brand-navy/30 uppercase tracking-widest mb-2">Notas (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales..."
              rows={2}
              className="w-full px-5 py-4 bg-brand-bg border border-brand-navy/5 rounded-2xl focus:ring-4 focus:ring-brand-navy/5 focus:border-brand-navy transition-all outline-none text-sm font-medium text-brand-navy"
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] text-white bg-brand-navy hover:bg-brand-tan hover:text-brand-navy transition-all shadow-2xl shadow-brand-navy/20 transform active:scale-[0.98]"
          >
            Post {type}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostOrderModal;
