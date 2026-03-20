/**
 * Core Type Definitions for Restaurant QR System
 * These types define the domain entities and DTOs used throughout the application
 */

// ============================================================================
// UUID Type
// ============================================================================

export type UUID = string;

// ============================================================================
// Enums
// ============================================================================

/**
 * Table status enum
 */
export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
}

/**
 * Order status enum with state machine transitions
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Order item status enum
 */
export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Payment provider enum
 */
export enum PaymentProvider {
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
  MOCK = 'mock',
}

// ============================================================================
// Restaurant Entity
// ============================================================================

export interface RestaurantSettings {
  currency: string;
  taxRate: number;
  serviceChargePercent: number;
  openingTime: string;
  closingTime: string;
  notificationSound: boolean;
  autoAcceptOrders: boolean;
}

export interface Restaurant {
  id: UUID;
  name: string;
  slug: string;
  address: string;
  phone: string;
  settings: RestaurantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRestaurantDTO {
  name: string;
  slug: string;
  address: string;
  phone: string;
  settings?: Partial<RestaurantSettings>;
}

// ============================================================================
// Table Entity
// ============================================================================

export interface Table {
  id: UUID;
  restaurantId: UUID;
  tableNumber: string;
  qrToken: string;
  capacity: number;
  status: TableStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTableDTO {
  restaurantId: UUID;
  tableNumber: string;
  capacity: number;
}

export interface UpdateTableDTO {
  tableNumber?: string;
  capacity?: number;
  status?: TableStatus;
}

// ============================================================================
// Customer Entity
// ============================================================================

export interface Customer {
  id: UUID;
  phone: string; // hashed
  name: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDTO {
  phone: string;
  name: string;
  email?: string;
}

// ============================================================================
// Menu Category Entity
// ============================================================================

export interface MenuCategory {
  id: UUID;
  restaurantId: UUID;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMenuCategoryDTO {
  restaurantId: UUID;
  name: string;
  displayOrder?: number;
}

export interface UpdateMenuCategoryDTO {
  name?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// ============================================================================
// Menu Item Entity
// ============================================================================

export interface MenuItemModifier {
  id: string;
  name: string;
  options: ModifierOption[];
  required: boolean;
  maxSelections: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: UUID;
  categoryId: UUID;
  restaurantId: UUID;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  modifiers: MenuItemModifier[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMenuItemDTO {
  categoryId: UUID;
  restaurantId: UUID;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  modifiers?: MenuItemModifier[];
}

export interface UpdateMenuItemDTO {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  modifiers?: MenuItemModifier[];
}

// ============================================================================
// Order Entity
// ============================================================================

export interface AppliedModifier {
  modifierId: string;
  optionIds: string[];
}

export interface OrderItem {
  id: UUID;
  orderId: UUID;
  menuItemId: UUID;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiersApplied: AppliedModifier[];
  status: OrderItemStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: UUID;
  restaurantId: UUID;
  tableId: UUID;
  customerId: UUID | null;
  orderNumber: number;
  status: OrderStatus;
  totalAmount: number;
  taxAmount: number;
  serviceCharge: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderItemDTO {
  menuItemId: UUID;
  quantity: number;
  modifiersApplied?: AppliedModifier[];
  notes?: string;
}

export interface CreateOrderDTO {
  restaurantId: UUID;
  tableId: UUID;
  customer?: CreateCustomerDTO;
  items: CreateOrderItemDTO[];
  notes?: string;
}

export interface UpdateOrderDTO {
  status?: OrderStatus;
  notes?: string;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { menuItem: MenuItem })[];
  table: Table;
  customer: Customer | null;
}

// ============================================================================
// Payment Entity
// ============================================================================

export interface Payment {
  id: UUID;
  orderId: UUID;
  provider: PaymentProvider;
  amount: number;
  status: PaymentStatus;
  transactionId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDTO {
  orderId: UUID;
  provider: PaymentProvider;
  amount: number;
}

export interface PaymentWebhookPayload {
  provider: PaymentProvider;
  transactionId: string;
  status: PaymentStatus;
  signature: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Audit Log Entity
// ============================================================================

export interface AuditLog {
  id: UUID;
  entityType: string;
  entityId: UUID;
  action: string;
  userId: UUID | null;
  changes: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateAuditLogDTO {
  entityType: string;
  entityId: UUID;
  action: string;
  userId?: UUID;
  changes: Record<string, unknown>;
}

// ============================================================================
// Admin User Entity
// ============================================================================

export interface AdminUser {
  id: UUID;
  restaurantId: UUID;
  email: string;
  passwordHash: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum AdminRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export interface CreateAdminUserDTO {
  restaurantId: UUID;
  email: string;
  password: string;
  name: string;
  role?: AdminRole;
}

// ============================================================================
// Session Types
// ============================================================================

export interface CustomerSession {
  id: UUID;
  tableId: UUID;
  restaurantId: UUID;
  customerId: UUID | null;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AdminSession {
  id: UUID;
  userId: UUID;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================================================
// JWT Payload Types
// ============================================================================

export interface AdminJWTPayload {
  userId: UUID;
  restaurantId: UUID;
  role: AdminRole;
  iat: number;
  exp: number;
}

export interface CustomerJWTPayload {
  sessionId: UUID;
  tableId: UUID;
  restaurantId: UUID;
  customerId: UUID | null;
  iat: number;
  exp: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    cursor: string | null;
    limit: number;
    hasMore: boolean;
  };
}

// ============================================================================
// Socket Event Types
// ============================================================================

export interface OrderCreatedEvent {
  order: OrderWithItems;
  restaurantId: UUID;
}

export interface OrderUpdatedEvent {
  orderId: UUID;
  status: OrderStatus;
  restaurantId: UUID;
}

export interface OrderItemReadyEvent {
  orderId: UUID;
  itemId: UUID;
  restaurantId: UUID;
}

export interface PaymentUpdatedEvent {
  orderId: UUID;
  paymentId: UUID;
  status: PaymentStatus;
  restaurantId: UUID;
}
