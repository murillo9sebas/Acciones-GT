
export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum EventType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  CANCELLED = 'CANCELLED'
}

export enum Currency {
  GTQ = 'GTQ',
  USD = 'USD'
}

export interface Asset {
  id: string;
  name: string;
  created_at: number;
}

export interface Order {
  id: string;
  asset_id: string;
  type: OrderType;
  price: number; // Stored in GTQ (base currency)
  quantity: number;
  alias: string;
  contact: string;
  notes?: string;
  active: boolean;
  created_at: number;
  updated_at: number;
}

export interface Trade {
  id: string;
  asset_id: string;
  price: number;
  quantity: number;
  created_at: number;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: EventType;
  event_data: Partial<Order>;
  created_at: number;
}

export interface OrderBookRow {
  price: number;
  quantity: number;
  total: number;
  orders: Order[];
}

export interface MarketStats {
  lastPrice: number | null;
  bestAsk: number | null;
  bestBid: number | null;
  spread: number | null;
  volumeInProcess: number;
}
