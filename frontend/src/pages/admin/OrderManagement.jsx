import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../zustnd/store';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Loader2, ShoppingBag, Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react';
import './OrderManagement.css';

const OrderManagement = () => {
  const { orders, fetchOrders, updateOrderStatus, isLoading } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchOrders();
    
    const newSocket = io('http://localhost:3000');
    newSocket.on('connect', () => {
      newSocket.emit('join-admin');
    });
    
    newSocket.on('new-order', (order) => {
      fetchOrders();
      toast.info(`New order received: ${order.order_number}`);
    });
    
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="order-management">
      <div className="page-header animate-fade-in">
        <div>
          <h2>Order Management</h2>
          <p className="page-subtitle">Track and manage customer orders</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setStatusFilter}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-2">
            <ShoppingBag size={16} />
            All Orders
            <Badge variant="secondary" className="ml-1">{statusCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock size={16} />
            Pending
            <Badge variant="warning" className="ml-1">{statusCounts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="preparing" className="gap-2">
            <ChefHat size={16} />
            Preparing
            <Badge variant="info" className="ml-1">{statusCounts.preparing}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ready" className="gap-2">
            <CheckCircle size={16} />
            Ready
            <Badge variant="success" className="ml-1">{statusCounts.ready}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle size={16} />
            Completed
            <Badge variant="secondary" className="ml-1">{statusCounts.completed}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-2">
            <XCircle size={16} />
            Cancelled
            <Badge variant="destructive" className="ml-1">{statusCounts.cancelled}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="loading">
          <Loader2 className="animate-spin mr-2" />
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="no-orders">
          <CardContent className="py-12 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p>No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="orders-container">
          {filteredOrders.map((order, index) => (
            <Card 
              key={order.id} 
              className="order-detail-card animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-number-row">
                      <span className="order-number">{order.order_number}</span>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <span className="table-number">Table: {order.table_number || 'N/A'}</span>
                  </div>
                  <div className="order-total">
                    <span className="total-label">Total</span>
                    <span className="total-amount">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="order-meta">
                  <span className="meta-date">
                    <Clock size={14} />
                    {formatDate(order.created_at)}
                  </span>
                  <Badge variant={order.payment_status === 'completed' ? 'success' : 'warning'}>
                    Payment: {order.payment_status}
                  </Badge>
                </div>
                
                <div className="order-items-list">
                  <h4>Order Items</h4>
                  <div className="items-grid">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <div className="item-info">
                          <span className="item-qty">{item.quantity}x</span>
                          <span className="item-name">{item.name}</span>
                        </div>
                        <span className="item-price">₹{parseFloat(item.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <Button 
                      variant="outline"
                      className="action-btn preparing"
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                    >
                      <ChefHat size={16} />
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button 
                      variant="outline"
                      className="action-btn ready"
                      onClick={() => handleStatusChange(order.id, 'ready')}
                    >
                      <CheckCircle size={16} />
                      Mark Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button 
                      variant="outline"
                      className="action-btn completed"
                      onClick={() => handleStatusChange(order.id, 'completed')}
                    >
                      <CheckCircle size={16} />
                      Complete Order
                    </Button>
                  )}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <Button 
                      variant="destructive"
                      className="action-btn cancelled"
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                    >
                      <XCircle size={16} />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
