
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/dbService';
import { authService } from '../services/authService';
import { Asset, Order, OrderType } from '../types';
import { useCurrency } from '../App';

const AdminPage: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newName, setNewName] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(authService.isAdmin());
  const [password, setPassword] = useState('');

  const loadData = () => {
    setAssets(db.getAssets());
    setOrders(db.getOrders());
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authService.login(password)) {
      setIsAuthorized(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthorized(false);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    db.addAsset(newName);
    loadData();
    setNewName('');
  };

  const handleDeleteAsset = (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar COMPLETAMENTE la acción "${name}"? Esto borrará de forma permanente la acción y TODAS sus intenciones asociadas.`)) {
      db.deleteAsset(id);
      loadData();
    }
  };

  const handleClearOrders = (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar TODAS las intenciones para "${name}"? El registro de la acción se mantendrá.`)) {
      db.clearAssetOrders(id);
      loadData();
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('¿Eliminar esta intención de forma permanente?')) {
      db.deleteOrder(id);
      loadData();
    }
  };

  // Group active orders by asset
  const ordersByAsset = useMemo(() => {
    const grouped: Record<string, Order[]> = {};
    orders.filter(o => o.active).forEach(order => {
      if (!grouped[order.asset_id]) grouped[order.asset_id] = [];
      grouped[order.asset_id].push(order);
    });
    return grouped;
  }, [orders]);

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-20">
        <div className="bg-white p-10 border border-brand-navy/10 rounded-3xl shadow-xl shadow-brand-navy/10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-brand-navy uppercase tracking-tighter">Acceso Admin</h1>
          </div>
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-brand-navy/40 uppercase tracking-widest mb-2">Contraseña del Sistema</label>
              <input 
                autoFocus
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-brand-bg border border-brand-navy/10 rounded-xl outline-none focus:ring-4 focus:ring-brand-navy/5 focus:border-brand-navy transition-all font-mono"
                placeholder="••••••••"
              />
              <p className="mt-3 text-[11px] text-brand-navy/40 font-medium italic">Pista: guatemala2024</p>
            </div>
            <button type="submit" className="w-full bg-brand-navy text-white font-black py-4 rounded-xl hover:bg-brand-navy/90 active:scale-95 transition-all shadow-lg shadow-brand-navy/10 uppercase tracking-wider text-sm">
              Entrar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-brand-navy uppercase tracking-tighter">Panel de Control</h1>
          <p className="text-brand-navy/40 font-bold text-sm uppercase tracking-widest mt-1">Gestión Central de La Rueda</p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-6 py-2.5 bg-white text-brand-navy/60 font-black rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-all uppercase text-[10px] tracking-widest border border-brand-navy/10"
        >
          Cerrar Sesión
        </button>
      </div>
      
      {/* Asset Management Section */}
      <section className="bg-white/50 p-8 border border-brand-navy/5 rounded-3xl">
        <h2 className="text-xl font-black text-brand-navy uppercase tracking-tight mb-6 flex items-center">
          <span className="w-1.5 h-6 bg-brand-navy rounded-full mr-3"></span>
          Gestión de Acciones
        </h2>
        <form onSubmit={handleAddAsset} className="flex gap-4 mb-8">
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-5 py-3.5 bg-white border border-brand-navy/10 rounded-xl outline-none focus:ring-4 focus:ring-brand-navy/5 focus:border-brand-navy transition-all font-semibold"
            placeholder="Nombre de la nueva acción (ej. Cementos Progreso)"
          />
          <button type="submit" className="bg-brand-navy text-white font-black px-8 py-3.5 rounded-xl hover:bg-brand-navy/90 transition-all shadow-md active:scale-95 uppercase text-xs tracking-wider">
            Añadir Acción
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {assets.map(asset => (
            <div key={asset.id} className="p-5 bg-white border border-brand-navy/5 rounded-2xl flex justify-between items-start group relative transition-all hover:border-brand-tan shadow-sm">
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-sm font-black text-brand-navy truncate leading-tight mb-1">{asset.name}</div>
                <div className="text-[10px] font-mono font-bold text-brand-navy/30 uppercase">{asset.id}</div>
                <div className="mt-3 text-[10px] font-bold text-brand-navy/40 bg-brand-bg inline-block px-2 py-1 rounded border border-brand-navy/5">
                  Alta: {new Date(asset.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <button 
                  onClick={() => handleDeleteAsset(asset.id, asset.name)}
                  className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all border border-rose-100 shadow-sm"
                  title="Eliminar Acción Completa"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Orders Section */}
      <section className="space-y-10">
        <h2 className="text-xl font-black text-brand-navy uppercase tracking-tight flex items-center">
          <span className="w-1.5 h-6 bg-brand-buy rounded-full mr-3"></span>
          Intenciones Activas por Acción
        </h2>

        {assets.map(asset => {
          const assetOrders = ordersByAsset[asset.id] || [];
          if (assetOrders.length === 0) return null;

          return (
            <div key={asset.id} className="bg-white border border-brand-navy/5 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-8 py-6 bg-brand-bg border-b border-brand-navy/5 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-black text-brand-navy leading-none">{asset.name}</h3>
                  <span className="text-[10px] font-black bg-white border border-brand-navy/5 text-brand-navy/60 px-3 py-1 rounded-full uppercase tracking-wider">
                    {assetOrders.length} {assetOrders.length === 1 ? 'Intención' : 'Intenciones'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleClearOrders(asset.id, asset.name)}
                    className="px-4 py-2 bg-white text-brand-navy/40 font-bold rounded-lg border border-brand-navy/10 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all uppercase text-[9px] tracking-widest shadow-sm"
                  >
                    Borrar todas las intenciones
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left table-fixed">
                  <thead className="bg-brand-bg/50 border-b border-brand-navy/5">
                    <tr className="text-[10px] font-black text-brand-navy/30 uppercase tracking-widest">
                      <th className="px-8 py-4 w-28">Tipo</th>
                      <th className="px-8 py-4 w-32">Precio</th>
                      <th className="px-8 py-4 w-24">Cant.</th>
                      <th className="px-8 py-4 w-40">Publicado por</th>
                      <th className="px-8 py-4 w-60">Contacto Privado</th>
                      <th className="px-8 py-4">Notas</th>
                      <th className="px-8 py-4 w-24 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-navy/5">
                    {assetOrders.map(order => (
                      <tr key={order.id} className="text-xs group hover:bg-brand-bg transition-colors align-top">
                        <td className="px-8 py-6">
                          <span className={`font-black px-2.5 py-1 rounded-md text-[9px] uppercase tracking-wider border shadow-sm ${
                            order.type === OrderType.BUY ? 'bg-emerald-50 text-brand-buy border-emerald-100' : 'bg-orange-50 text-brand-sell border-orange-100'
                          }`}>
                            {order.type === OrderType.BUY ? 'Compra' : 'Venta'}
                          </span>
                        </td>
                        <td className={`px-8 py-6 font-black font-mono text-sm whitespace-nowrap ${order.type === OrderType.BUY ? 'text-brand-buy' : 'text-brand-sell'}`}>
                          {formatPrice(order.price)}
                        </td>
                        <td className="px-8 py-6 font-black font-mono text-brand-navy text-sm whitespace-nowrap">
                          {order.quantity.toLocaleString()}
                        </td>
                        <td className="px-8 py-6 font-bold text-brand-navy text-sm">
                          {order.alias}
                        </td>
                        <td className="px-8 py-6">
                           <div className="font-mono text-brand-tan font-black break-all text-xs bg-brand-cream p-2 rounded-lg border border-brand-tan/10 hover:bg-brand-tan/5 transition-colors">
                            {order.contact}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-brand-navy/70 text-xs leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {order.notes ? (
                              <p className="italic">{order.notes}</p>
                            ) : (
                              <span className="text-brand-navy/20 italic">Sin notas adicionales</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteOrder(order.id);
                            }}
                            className="text-brand-navy/20 hover:text-rose-600 p-2.5 rounded-xl hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 shadow-none hover:shadow-sm"
                            title="Eliminar Intención Individual"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {Object.keys(ordersByAsset).length === 0 && (
          <div className="py-24 text-center bg-white border border-brand-navy/5 rounded-3xl shadow-inner">
            <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-brand-navy/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 00-2 2H6a2 2 0 00-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-brand-navy/30 font-black uppercase tracking-widest text-sm">No hay intenciones de mercado activas</p>
          </div>
        )}
      </section>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a67c52;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
