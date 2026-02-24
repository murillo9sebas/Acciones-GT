
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../services/dbService';
import { authService } from '../services/authService';
import { Order, Asset } from '../types';
import { useCurrency } from '../App';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isAdmin, setIsAdmin] = useState(authService.isAdmin());

  useEffect(() => {
    if (!orderId) return;
    const o = db.getOrder(orderId);
    if (!o) {
      navigate('/');
      return;
    }
    setOrder(o);
    setAsset(db.getAsset(o.asset_id) || null);
    setIsAdmin(authService.isAdmin());
  }, [orderId]);

  const handleCancel = () => {
    if (!orderId || !window.confirm('Are you sure you want to cancel this intention?')) return;
    db.cancelOrder(orderId);
    navigate(`/market/${order?.asset_id}`);
  };

  if (!order || !asset) return <div className="p-8 text-center">Loading order...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link 
          to={`/market/${asset.id}`}
          className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {asset.name} Market
        </Link>
        {isAdmin && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 uppercase tracking-widest">
            Admin View
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className={`p-8 border-b-4 ${order.type === 'BUY' ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                order.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {order.type} INTENTION
              </span>
              <h1 className="text-3xl font-black text-gray-900 mt-2">{asset.name}</h1>
            </div>
            {!order.active && (
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Cancelled</span>
            )}
          </div>
          <p className="text-sm text-gray-400">ID: {order.id}</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</div>
              <div className="text-3xl font-mono font-bold text-gray-900">{formatPrice(order.price)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Quantity</div>
              <div className="text-3xl font-mono font-bold text-gray-900">{order.quantity.toLocaleString()} <span className="text-sm text-gray-400 font-sans">shares</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Alias</div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold">
                  {order.alias.charAt(0).toUpperCase()}
                </div>
                <div className="text-lg font-semibold text-gray-900">{order.alias}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Info</div>
              {isAdmin ? (
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                  <div className="text-sm font-bold text-yellow-800 mb-1">Verified Info:</div>
                  <div className="text-lg font-mono font-bold text-gray-900 break-all">{order.contact}</div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="flex items-center text-gray-400 space-x-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs font-medium">Visible to administrators only</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {order.notes && isAdmin && (
            <div className="pt-8 border-t border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Special Notes</div>
              <div className="p-4 bg-gray-50 rounded-xl text-gray-600 italic">
                "{order.notes}"
              </div>
            </div>
          )}

          {!isAdmin && order.notes && (
             <div className="pt-8 border-t border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Special Notes</div>
              <div className="text-xs text-gray-400 italic">Notes are private.</div>
            </div>
          )}

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="text-xs text-gray-400">
              Posted on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </div>
            {order.active && isAdmin && (
              <div className="flex space-x-3 w-full md:w-auto">
                <button 
                  onClick={handleCancel}
                  className="flex-1 md:flex-none px-6 py-2 border border-red-200 text-red-500 font-bold rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Intention
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-100 border border-gray-200 rounded-xl">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Next Steps for Settlement:</h4>
        <ol className="list-decimal ml-5 text-sm text-gray-600 space-y-2">
          {isAdmin ? (
            <>
              <li>Reach out to <strong>{order.alias}</strong> via the contact info above.</li>
              <li>Agree on transaction terms (custody transfer, bank wire, etc).</li>
              <li>Once the offline trade is completed, the owner of this post should cancel it to keep the board clean.</li>
            </>
          ) : (
            <>
              <li>This intention is verified by our system.</li>
              <li>Contact an administrator to facilitate the introduction with <strong>{order.alias}</strong>.</li>
              <li>Only authorized users can view the full contact details to ensure market integrity.</li>
            </>
          )}
        </ol>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
