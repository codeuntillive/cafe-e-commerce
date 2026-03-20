/**
 * Customer Frontend Types
 * TypeScript interfaces for the customer PWA
 */

// ============================================================================
// Menu Types
// ============================================================================

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemModifier {
  id: string;
  name: string;
  options: ModifierOption[];
  required: boolean;
  maxSelections: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  modifiers: MenuItemModifier[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  settings: RestaurantSettings;
}

export interface RestaurantSettings {
  currency: string;
  taxRate: number;
  serviceChargePercent: number;
  openingTime: string;
  closingTime: string;
  notificationSound: boolean;
  autoAcceptOrders: boolean;
}

export interface MenuData {
  restaurant: Restaurant;
  categories: MenuCategory[];
}

// ============================================================================
// Cart Types
// ============================================================================

export interface AppliedModifier {
  modifierId: string;
  optionIds: string[];
}

export interface CartItem {
  id: string; // Unique cart item ID
  menuItem: MenuItem;
  quantity: number;
  modifiersApplied: AppliedModifier[];
  notes: string;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  taxAmount: number;
  serviceCharge: number;
  grandTotal: number;
}

// ============================================================================
// Order Types
// ============================================================================

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiersApplied: AppliedModifier[];
  status: OrderItemStatus;
  notes: string | null;
  menuItem?: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
  };
}

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  customerId: string | null;
  orderNumber: number;
  status: OrderStatus;
  totalAmount: number;
  taxAmount: number;
  serviceCharge: number;
  notes: string | null;
  items: OrderItem[];
  table?: {
    id: string;
    tableNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Session Types
// ============================================================================

export interface CustomerSession {
  sessionToken: string;
  customerId: string | null;
  tableId: string;
  tableNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
  };
}

// ============================================================================
// Socket Event Types
// ============================================================================

export interface OrderCreatedEvent {
  order: Order;
  restaurantId: string;
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
}

export interface ItemReadyEvent {
  orderId: string;
  itemId: string;
  itemName?: string;
  timestamp: string;
}

export interface PaymentUpdatedEvent {
  orderId: string;
  paymentStatus: string;
  timestamp: string;
}
