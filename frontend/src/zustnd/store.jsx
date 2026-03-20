import { create } from 'zustand';

const API_URL = 'http://localhost:3000/api';

// Admin Store
export const useAdminStore = create((set, get) => ({
  user: null,
  menuItems: [],
  tables: [],
  orders: [],
  stats: null,
  isLoading: false,
  
  setUser: (user) => set({ user }),
  
  // Menu actions
  fetchMenuItems: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/menu`);
      const data = await res.json();
      set({ menuItems: data, isLoading: false });
    } catch (err) {
      console.error('Error fetching menu:', err);
      set({ isLoading: false });
    }
  },
  
  addMenuItem: async (item) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/menu`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(item)
    });
    const newItem = await res.json();
    set(state => ({ menuItems: [...state.menuItems, newItem] }));
    return newItem;
  },
  
  updateMenuItem: async (id, item) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/menu/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(item)
    });
    const updated = await res.json();
    set(state => ({ 
      menuItems: state.menuItems.map(i => i.id === id ? updated : i) 
    }));
    return updated;
  },
  
  deleteMenuItem: async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/menu/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    const data = await res.json();
    
    // Check if item was soft-deleted (marked unavailable) or hard-deleted
    if (data.message && data.message.includes('unavailable')) {
      // Soft delete - update the item's availability in state
      set(state => ({ 
        menuItems: state.menuItems.map(i => 
          i.id === id ? { ...i, is_available: false } : i
        ) 
      }));
    } else {
      // Hard delete - remove from state
      set(state => ({ 
        menuItems: state.menuItems.filter(i => i.id !== id) 
      }));
    }
    
    return data;
  },
  
  // Table actions
  fetchTables: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/tables`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      set({ tables: data, isLoading: false });
    } catch (err) {
      console.error('Error fetching tables:', err);
      set({ isLoading: false });
    }
  },
  
  addTable: async (table) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tables`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(table)
    });
    const newTable = await res.json();
    set(state => ({ tables: [...state.tables, newTable] }));
    return newTable;
  },
  
  updateTable: async (id, table) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tables/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(table)
    });
    const updated = await res.json();
    set(state => ({ 
      tables: state.tables.map(t => t.id === id ? updated : t) 
    }));
    return updated;
  },
  
  deleteTable: async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/tables/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    set(state => ({ 
      tables: state.tables.filter(t => t.id !== id) 
    }));
  },
  
  // Order actions
  fetchOrders: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters);
      const res = await fetch(`${API_URL}/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      set({ orders: data, isLoading: false });
    } catch (err) {
      console.error('Error fetching orders:', err);
      set({ isLoading: false });
    }
  },
  
  updateOrderStatus: async (id, status) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    const updated = await res.json();
    set(state => ({ 
      orders: state.orders.map(o => o.id === id ? updated : o) 
    }));
    return updated;
  },
  
  // Stats
  fetchStats: async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/orders/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      set({ stats: data });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  },
  
  addOrder: (order) => {
    set(state => ({ orders: [order, ...state.orders] }));
  },
  
  updateOrderInList: (updatedOrder) => {
    set(state => ({ 
      orders: state.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o) 
    }));
  }
}));

// Customer Store
export const useCustomerStore = create((set, get) => ({
  currentTable: null,
  menu: [],
  cart: [],
  currentOrder: null,
  
  setCurrentTable: (table) => set({ currentTable: table }),
  
  fetchTableMenu: async (uniqueLink) => {
    try {
      const res = await fetch(`${API_URL}/tables/link/${uniqueLink}`);
      if (!res.ok) throw new Error('Table not found');
      const data = await res.json();
      set({ 
        currentTable: data.table, 
        menu: data.menu 
      });
      return data;
    } catch (err) {
      console.error('Error fetching table:', err);
      throw err;
    }
  },
  
  addToCart: (item) => {
    set(state => {
      const existingItem = state.cart.find(i => i.id === item.id);
      if (existingItem) {
        return {
          cart: state.cart.map(i => 
            i.id === item.id 
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        };
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] };
    });
  },
  
  removeFromCart: (itemId) => {
    set(state => ({
      cart: state.cart.filter(i => i.id !== itemId)
    }));
  },
  
  updateCartQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      set(state => ({ cart: state.cart.filter(i => i.id !== itemId) }));
    } else {
      set(state => ({
        cart: state.cart.map(i => 
          i.id === itemId ? { ...i, quantity } : i
        )
      }));
    }
  },
  
  clearCart: () => set({ cart: [] }),
  
  setCurrentOrder: (order) => set({ currentOrder: order }),
  
  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}));

export default useAdminStore;
export const useStore = useAdminStore;
