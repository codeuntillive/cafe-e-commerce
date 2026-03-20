/**
 * Socket.io Client
 * Real-time connection for order updates
 */

import { io, Socket } from 'socket.io-client';
import type { OrderUpdatedEvent, ItemReadyEvent } from '../types/index.ts';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Initialize socket connection for customer
 */
export function initCustomerSocket(sessionToken: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(`${SOCKET_URL}/customer`, {
    auth: { sessionToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

/**
 * Initialize socket connection for admin
 */
export function initAdminSocket(accessToken: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(`${SOCKET_URL}/admin`, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Admin socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Admin socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Admin socket connection error:', error);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Subscribe to order updates
 */
export function subscribeToOrder(
  orderId: string,
  callbacks: {
    onOrderUpdated?: (data: OrderUpdatedEvent) => void;
    onItemReady?: (data: ItemReadyEvent) => void;
  }
): () => void {
  if (!socket) {
    console.warn('Socket not connected');
    return () => {};
  }

  // Subscribe to order room
  socket.emit('subscribe:order', orderId);

  // Set up listeners
  const handleOrderUpdated = (data: OrderUpdatedEvent) => {
    if (data.orderId === orderId) {
      callbacks.onOrderUpdated?.(data);
    }
  };

  const handleItemReady = (data: ItemReadyEvent) => {
    if (data.orderId === orderId) {
      callbacks.onItemReady?.(data);
    }
  };

  socket.on('order:updated', handleOrderUpdated);
  socket.on('item:ready', handleItemReady);

  // Return unsubscribe function
  return () => {
    socket?.emit('unsubscribe:order', orderId);
    socket?.off('order:updated', handleOrderUpdated);
    socket?.off('item:ready', handleItemReady);
  };
}

/**
 * Subscribe to restaurant updates (admin)
 */
export function subscribeToRestaurant(
  restaurantId: string,
  callbacks: {
    onOrderCreated?: (data: unknown) => void;
    onOrderUpdated?: (data: OrderUpdatedEvent) => void;
    onTableUpdated?: (data: unknown) => void;
  }
): () => void {
  if (!socket) {
    console.warn('Socket not connected');
    return () => {};
  }

  socket.on('order:created', callbacks.onOrderCreated || (() => {}));
  socket.on('order:updated', callbacks.onOrderUpdated || (() => {}));
  socket.on('table:updated', callbacks.onTableUpdated || (() => {}));

  return () => {
    socket?.off('order:created');
    socket?.off('order:updated');
    socket?.off('table:updated');
  };
}

export default {
  initCustomerSocket,
  initAdminSocket,
  getSocket,
  disconnectSocket,
  subscribeToOrder,
  subscribeToRestaurant,
};
