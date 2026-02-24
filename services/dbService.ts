
import { Asset, Order, OrderEvent, OrderType, EventType, Trade } from '../types';

const ASSETS_KEY = 'otc_pool_assets';
const ORDERS_KEY = 'otc_pool_orders';
const EVENTS_KEY = 'otc_pool_events';
const TRADES_KEY = 'otc_pool_trades';

const INITIAL_ASSETS: Asset[] = [
  { id: '1', name: 'BI Capital', created_at: Date.now() },
  { id: '2', name: 'EEGSA', created_at: Date.now() },
  { id: '3', name: 'InterBanco', created_at: Date.now() },
  { id: '4', name: 'GyT Holdings', created_at: Date.now() },
  { id: '5', name: 'Aseguradora Confío', created_at: Date.now() },
  { id: '6', name: 'DEOCSA', created_at: Date.now() },
  { id: '7', name: 'DEORSA', created_at: Date.now() },
];

class DBService {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private save<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  constructor() {
    if (!localStorage.getItem(ASSETS_KEY)) {
      this.save(ASSETS_KEY, INITIAL_ASSETS);
    }
    if (!localStorage.getItem(ORDERS_KEY)) {
      this.seedMockData();
    }
  }

  private seedMockData() {
    const assets = this.getAssets();
    const orders: Order[] = [];
    const events: OrderEvent[] = [];
    const trades: Trade[] = [];

    assets.forEach(asset => {
      const basePrice = Math.round(100 + (parseInt(asset.id) * 50) + Math.random() * 50);
      
      // Seed orders
      for (let i = 1; i <= 4; i++) {
        const order: Order = {
          id: Math.random().toString(36).substr(2, 9),
          asset_id: asset.id,
          type: OrderType.BUY,
          price: Math.round(basePrice - (i * 10)),
          quantity: Math.round(100 * i * (Math.floor(Math.random() * 3) + 1)),
          alias: `Buyer_${asset.id}_${i}`,
          contact: `buyer${i}@example.com`,
          notes: i === 1 ? 'Looking for quick settlement' : undefined,
          active: true,
          created_at: Date.now() - (1000 * 60 * 60 * i),
          updated_at: Date.now() - (1000 * 60 * 60 * i)
        };
        orders.push(order);
        events.push({
          id: Math.random().toString(36).substr(2, 9),
          order_id: order.id,
          event_type: EventType.CREATED,
          event_data: order,
          created_at: order.created_at
        });
      }

      for (let i = 1; i <= 4; i++) {
        const order: Order = {
          id: Math.random().toString(36).substr(2, 9),
          asset_id: asset.id,
          type: OrderType.SELL,
          price: Math.round(basePrice + (i * 10)),
          quantity: Math.round(50 * i * (Math.floor(Math.random() * 5) + 1)),
          alias: `Seller_${asset.id}_${i}`,
          contact: `seller${i}@example.com`,
          notes: i === 4 ? 'Partial fill possible' : undefined,
          active: true,
          created_at: Date.now() - (1000 * 60 * 30 * i),
          updated_at: Date.now() - (1000 * 60 * 30 * i)
        };
        orders.push(order);
        events.push({
          id: Math.random().toString(36).substr(2, 9),
          order_id: order.id,
          event_type: EventType.CREATED,
          event_data: order,
          created_at: order.created_at
        });
      }

      // Seed mock trades (Sales History)
      for (let i = 0; i < 5; i++) {
        trades.push({
          id: Math.random().toString(36).substr(2, 9),
          asset_id: asset.id,
          price: basePrice + (Math.random() > 0.5 ? 5 : -5),
          quantity: Math.round(200 + Math.random() * 800),
          created_at: Date.now() - (1000 * 60 * 60 * 24 * (i + 1))
        });
      }
    });

    this.save(ORDERS_KEY, orders);
    this.save(EVENTS_KEY, events);
    this.save(TRADES_KEY, trades);
  }

  // Assets
  getAssets(): Asset[] {
    return this.get<Asset>(ASSETS_KEY);
  }

  getAsset(id: string): Asset | undefined {
    return this.getAssets().find(a => a.id === id);
  }

  addAsset(name: string): Asset {
    const assets = this.getAssets();
    const newAsset = { id: Math.random().toString(36).substr(2, 9), name, created_at: Date.now() };
    this.save(ASSETS_KEY, [...assets, newAsset]);
    return newAsset;
  }

  deleteAsset(id: string): void {
    const assets = this.getAssets().filter(a => a.id !== id);
    this.save(ASSETS_KEY, assets);
    this.clearAssetOrders(id);
  }

  clearAssetOrders(assetId: string): void {
    const orders = this.get<Order>(ORDERS_KEY);
    const assetOrderIds = orders.filter(o => o.asset_id === assetId).map(o => o.id);
    const filteredOrders = orders.filter(o => o.asset_id !== assetId);
    this.save(ORDERS_KEY, filteredOrders);

    const events = this.get<OrderEvent>(EVENTS_KEY);
    const filteredEvents = events.filter(e => !assetOrderIds.includes(e.order_id));
    this.save(EVENTS_KEY, filteredEvents);
  }

  // Orders
  getOrders(assetId?: string): Order[] {
    const orders = this.get<Order>(ORDERS_KEY);
    if (assetId) return orders.filter(o => o.asset_id === assetId);
    return orders;
  }

  getOrder(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  createOrder(orderData: Omit<Order, 'id' | 'active' | 'created_at' | 'updated_at'>): Order {
    const orders = this.get<Order>(ORDERS_KEY);
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substr(2, 9),
      active: true,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    this.save(ORDERS_KEY, [...orders, newOrder]);
    
    this.logEvent(newOrder.id, EventType.CREATED, newOrder);
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const orders = this.get<Order>(ORDERS_KEY);
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;

    const updatedOrder = { ...orders[index], ...updates, updated_at: Date.now() };
    orders[index] = updatedOrder;
    this.save(ORDERS_KEY, orders);

    this.logEvent(id, EventType.UPDATED, updates);
    return updatedOrder;
  }

  deleteOrder(id: string): void {
    const orders = this.get<Order>(ORDERS_KEY);
    const filteredOrders = orders.filter(o => o.id !== id);
    this.save(ORDERS_KEY, filteredOrders);

    const events = this.get<OrderEvent>(EVENTS_KEY);
    const filteredEvents = events.filter(e => e.order_id !== id);
    this.save(EVENTS_KEY, filteredEvents);
  }

  cancelOrder(id: string): Order | undefined {
    return this.updateOrder(id, { active: false });
  }

  // Events
  getEvents(assetId?: string): OrderEvent[] {
    const events = this.get<OrderEvent>(EVENTS_KEY);
    if (assetId) {
      const orders = this.getOrders(assetId);
      const orderIds = orders.map(o => o.id);
      return events.filter(e => orderIds.includes(e.order_id));
    }
    return events;
  }

  // Trades
  getTrades(assetId?: string): Trade[] {
    const trades = this.get<Trade>(TRADES_KEY);
    if (assetId) return trades.filter(t => t.asset_id === assetId);
    return trades;
  }

  private logEvent(orderId: string, type: EventType, data: Partial<Order>): void {
    const events = this.get<OrderEvent>(EVENTS_KEY);
    const newEvent: OrderEvent = {
      id: Math.random().toString(36).substr(2, 9),
      order_id: orderId,
      event_type: type,
      event_data: data,
      created_at: Date.now()
    };
    this.save(EVENTS_KEY, [...events, newEvent]);
  }
}

export const db = new DBService();
