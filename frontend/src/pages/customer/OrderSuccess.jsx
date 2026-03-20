import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Utensils,
  Loader2,
  Home
} from 'lucide-react';
import './OrderSuccess.css';

const API_URL = 'http://localhost:3000/api';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    
    const socket = io('http://localhost:3000');
    socket.on('order-status-updated', (updatedOrder) => {
      if (updatedOrder.id === parseInt(orderId)) {
        setOrder(updatedOrder);
      }
    });

    return () => socket.close();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Error fetching order:', err);
    }
    setIsLoading(false);
  };

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      completed: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getStatusSteps = (status) => {
    const order = ['pending', 'preparing', 'ready', 'completed'];
    return order.indexOf(status);
  };

  const currentStep = order ? getStatusSteps(order.status) : -1;

  const statusConfig = {
    pending: { icon: Clock, message: 'Your order has been received and is waiting to be prepared.' },
    preparing: { icon: ChefHat, message: 'Your order is being prepared by our chef.' },
    ready: { icon: Utensils, message: 'Your order is ready! Our staff will bring it to your table.' },
    completed: { icon: CheckCircle, message: 'Thank you for dining with us!' }
  };

  if (isLoading) {
    return (
      <div className="order-success loading">
        <Loader2 className="animate-spin h-10 w-10" />
        <p>Loading order status...</p>
      </div>
    );
  }

  const StatusIcon = statusConfig[order?.status]?.icon || Clock;

  return (
    <div className="order-success">
      {/* Success Header */}
      <div className="success-header animate-fade-in">
        <div className="success-icon">
          <CheckCircle size={64} />
        </div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your order</p>
      </div>

      {/* Order Details Card */}
      <Card className="order-details-card animate-fade-in stagger-1">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="detail-row">
            <span className="detail-label">Order Number</span>
            <span className="detail-value">{order?.order_number}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Table</span>
            <span className="detail-value">{order?.table_number || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Amount</span>
            <span className="detail-value total">₹{parseFloat(order?.total_amount || 0).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Card */}
      <Card className="status-card animate-fade-in stagger-2">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="status-current">
            <Badge variant={getStatusVariant(order?.status)} className="status-badge">
              <StatusIcon className="mr-2 h-4 w-4" />
              {order?.status?.toUpperCase()}
            </Badge>
            <p className="status-message">{statusConfig[order?.status]?.message}</p>
          </div>

          {/* Status Timeline */}
          <div className="status-timeline">
            <div className={`timeline-step ${currentStep >= 0 ? 'active completed' : ''}`}>
              <div className="step-circle">
                <Clock size={16} />
              </div>
              <span>Received</span>
            </div>
            <div className={`timeline-step ${currentStep >= 1 ? 'active completed' : ''}`}>
              <div className="step-circle">
                <ChefHat size={16} />
              </div>
              <span>Preparing</span>
            </div>
            <div className={`timeline-step ${currentStep >= 2 ? 'active completed' : ''}`}>
              <div className="step-circle">
                <Utensils size={16} />
              </div>
              <span>Ready</span>
            </div>
            <div className={`timeline-step ${currentStep >= 3 ? 'active completed' : ''}`}>
              <div className="step-circle">
                <CheckCircle size={16} />
              </div>
              <span>Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items Card */}
      <Card className="items-card animate-fade-in stagger-3">
        <CardHeader>
          <CardTitle>Items Ordered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="ordered-items">
            {order?.items?.map((item, idx) => (
              <div key={idx} className="ordered-item">
                <div className="item-details">
                  <span className="item-qty">{item.quantity}x</span>
                  <span className="item-name">{item.name}</span>
                </div>
                <span className="item-price">₹{parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Back Home Button */}
      <div className="action-buttons animate-fade-in stagger-4">
        <Link to="/">
          <Button size="lg">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
