import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../zustnd/store';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  ShoppingCart, 
  Clock, 
  Flame, 
  IndianRupee,
  Utensils,
  Users,
  TrendingUp
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { orders, stats, fetchOrders, fetchStats, addOrder, updateOrderInList } = useAdminStore();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();

    const newSocket = io('http://localhost:3000', {
      transports: ['websocket']
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join-admin');
    });

    newSocket.on('new-order', (order) => {
      console.log('New order received:', order);
      addOrder(order);
      fetchStats();
    });

    newSocket.on('order-status-updated', (order) => {
      console.log('Order status updated:', order);
      updateOrderInList(order);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      completed: 'secondary',
      cancelled: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      preparing: '#2196f3',
      ready: '#4caf50',
      completed: '#9e9e9e',
      cancelled: '#f44336'
    };
    return colors[status] || '#666';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card animate-fade-in stagger-1">
          <CardContent className="p-6">
            <div className="stat-content">
              <div className="stat-icon orders">
                <ShoppingCart size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.today?.total_orders || 0}</span>
                <span className="stat-label">Today's Orders</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card animate-fade-in stagger-2">
          <CardContent className="p-6">
            <div className="stat-content">
              <div className="stat-icon pending">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.today?.pending_orders || 0}</span>
                <span className="stat-label">Pending Orders</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card animate-fade-in stagger-3">
          <CardContent className="p-6">
            <div className="stat-content">
              <div className="stat-icon preparing">
                <Flame size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.today?.preparing_orders || 0}</span>
                <span className="stat-label">Preparing</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card animate-fade-in stagger-4">
          <CardContent className="p-6">
            <div className="stat-content">
              <div className="stat-icon revenue">
                <IndianRupee size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{formatCurrency(stats?.today?.total_revenue || 0)}</span>
                <span className="stat-label">Today's Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="additional-stats">
        <Card className="animate-fade-in stagger-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="quick-stats-grid">
              <div className="quick-stat">
                <Utensils size={18} />
                <span className="quick-stat-label">Active Tables</span>
                <span className="quick-stat-value">{stats?.active_tables || 0}</span>
              </div>
              <div className="quick-stat">
                <Users size={18} />
                <span className="quick-stat-label">Total Customers</span>
                <span className="quick-stat-value">{stats?.total_customers || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="recent-orders animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="no-orders">
              <ShoppingCart size={48} className="text-muted-foreground mb-4" />
              <p>No orders yet. Waiting for customers...</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 10).map((order, index) => (
                <div 
                  key={order.id} 
                  className="order-card animate-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="order-header">
                    <div className="order-number-group">
                      <span className="order-number">{order.order_number}</span>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <span className="order-amount">{formatCurrency(order.total_amount)}</span>
                  </div>
                  
                  <div className="order-details">
                    <div className="order-detail">
                      <span className="detail-label">Table:</span>
                      <span className="detail-value">{order.table_number || 'N/A'}</span>
                    </div>
                    <div className="order-detail">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="order-detail">
                      <span className="detail-label">Payment:</span>
                      <Badge variant={order.payment_status === 'completed' ? 'success' : 'warning'}>
                        {order.payment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <Badge key={idx} variant="outline" className="item-badge">
                        {item.quantity}x {item.name}
                      </Badge>
                    ))}
                    {order.items?.length > 3 && (
                      <Badge variant="outline" className="item-badge">
                        +{order.items.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
