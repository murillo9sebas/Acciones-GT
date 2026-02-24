
import React, { useState, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MarketPage from './pages/MarketPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AdminPage from './pages/AdminPage';
import { Currency } from './types';

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  formatPrice: (priceGTQ: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};

const USD_RATE = 7.8; // 1 USD = 7.8 GTQ

const App: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>(Currency.GTQ);

  const toggleCurrency = () => {
    setCurrency(prev => prev === Currency.GTQ ? Currency.USD : Currency.GTQ);
  };

  const formatPrice = (priceGTQ: number) => {
    if (currency === Currency.USD) {
      const usdPrice = priceGTQ / USD_RATE;
      return `$${usdPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `Q${priceGTQ.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatPrice }}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center space-x-12">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="w-12 h-12 bg-brand-navy rounded-xl flex items-center justify-center group-hover:bg-brand-tan transition-all duration-300 shadow-lg shadow-brand-navy/10">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-brand-navy tracking-tighter uppercase leading-none">La Rueda</span>
                    <span className="text-[10px] font-black text-brand-tan uppercase tracking-widest mt-1">de Acciones</span>
                  </div>
                </Link>
                <nav className="hidden md:flex space-x-8">
                  <Link to="/" className="text-xs font-black text-brand-navy hover:text-brand-tan uppercase tracking-widest transition-colors">Mercados</Link>
                  <Link to="/admin" className="text-xs font-black text-brand-navy hover:text-brand-tan uppercase tracking-widest transition-colors">Admin</Link>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleCurrency}
                  className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-inner"
                >
                  <span className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${currency === Currency.GTQ ? 'bg-brand-navy text-white shadow-md' : 'text-gray-400 hover:text-brand-navy'}`}>GTQ</span>
                  <span className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${currency === Currency.USD ? 'bg-brand-navy text-white shadow-md' : 'text-gray-400 hover:text-brand-navy'}`}>USD</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/market/:assetId" element={<MarketPage />} />
              <Route path="/order/:orderId" element={<OrderDetailsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>

          <footer className="bg-brand-navy py-20 mt-auto text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                  <h3 className="text-xs font-black text-brand-tan uppercase tracking-widest mb-6">Aviso de Mercado</h3>
                  <p className="text-sm text-gray-300 max-w-lg leading-relaxed font-medium">
                    Esta es una pizarra informativa para el mercado secundario. No se ejecutan transacciones directas. 
                    Toda negociación se realiza de forma privada entre partes. La Rueda no asume responsabilidad por acuerdos externos.
                  </p>
                </div>
                <div className="flex flex-col md:items-end justify-center space-y-4">
                  <div className="flex flex-col items-end">
                    <p className="text-lg font-black text-white uppercase tracking-tighter">La Rueda de Acciones</p>
                    <p className="text-xs text-brand-tan font-bold uppercase tracking-widest">© 2024 Guatemala</p>
                  </div>
                  <div className="w-12 h-1 bg-brand-tan rounded-full"></div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </CurrencyContext.Provider>
  );
};

export default App;
