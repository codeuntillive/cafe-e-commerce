/**
 * API Client
 * Centralized API client with error handling
 */

import type { ApiResponse, MenuData, Order, CustomerSession } from '../types/index.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * API Error class
 */
class ApiClientError extends Error {
  public code: string;
  public details?: unknown[];

  constructor(message: string, code: string, details?: unknown[]) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Make an API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add session token if available
  const sessionToken = localStorage.getItem('customer-session');
  if (sessionToken) {
    try {
      const parsed = JSON.parse(sessionToken);
      if (parsed.state?.session?.sessionToken) {
        (headers as Record<string, string>)['X-Session-Token'] = parsed.state.session.sessionToken;
      }
    } catch {
      // Ignore parsing errors
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiClientError(
      data.error?.message || 'An error occurred',
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.details
    );
  }

  return data.data as T;
}

/**
 * API Client object
 */
export const api = {
  /**
   * Resolve QR code
   */
  async resolveQRToken(qrToken: string): Promise<{
    table: { id: string; tableNumber: string; status: string };
    restaurant: { id: string; name: string; slug: string };
  }> {
    return apiRequest(`/tables/resolve/${qrToken}`);
  },

  /**
   * Create customer session
   */
  async createSession(data: {
    tableId: string;
    restaurantId: string;
    customer?: { name: string; phone: string; email?: string };
  }): Promise<CustomerSession> {
    return apiRequest('/auth/customer/session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get menu by restaurant slug
   */
  async getMenu(restaurantSlug: string): Promise<MenuData> {
    return apiRequest(`/menu/${restaurantSlug}`);
  },

  /**
   * Create order
   */
  async createOrder(data: {
    items: {
      menuItemId: string;
      quantity: number;
      modifiersApplied?: { modifierId: string; optionIds: string[] }[];
      notes?: string;
    }[];
    notes?: string;
    customerName?: string;
    customerPhone?: string;
  }): Promise<Order> {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get my orders
   */
  async getMyOrders(): Promise<Order[]> {
    return apiRequest('/orders/my-orders');
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    return apiRequest(`/orders/${orderId}`);
  },

  /**
   * Create payment
   */
  async createPayment(data: {
    orderId: string;
    provider: 'stripe' | 'razorpay' | 'mock';
  }): Promise<{
    paymentId: string;
    status: string;
    transactionId?: string;
    redirectUrl?: string;
  }> {
    return apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export { ApiClientError };
export default api;
