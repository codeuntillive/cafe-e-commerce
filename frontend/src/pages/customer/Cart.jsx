import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCustomerStore } from '../../zustnd/store';
import { toast } from 'react-toastify';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2,
  Loader2
} from 'lucide-react';
import './Cart.css';

const API_URL = 'http://localhost:3000/api';

const Cart = () => {
  const { uniqueLink } = useParams();
  const navigate = useNavigate();
  const { cart, currentTable, updateCartQuantity, removeFromCart, clearCart, setCurrentOrder, getCartTotal } = useCustomerStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [socket, setSocket] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    if (!currentTable) {
      navigate(`/table/${uniqueLink}`);
      return;
    }

    const newSocket = io('http://localhost:3000');
    newSocket.on('connect', () => {
      if (currentTable?.id) {
        newSocket.emit('join-table', currentTable.id);
      }
    });

    newSocket.on('order-status-updated', (order) => {
      if (order.table_id === currentTable?.id) {
        setOrderStatus(order.status);
        if (order.status === 'completed') {
          toast.success('Order completed! Thank you for dining with us.');
        }
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [currentTable, uniqueLink]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        special_instructions: item.special_instructions || ''
      }));

      const res = await axios.post(`${API_URL}/orders`, {
        table_id: currentTable.id,
        items: orderItems,
        customer_name: customerName,
        notes
      }, {
        withCredentials: true
      });

      setCurrentOrder(res.data);
      clearCart();
      toast.success('Order placed successfully!');
      
      navigate(`/customer/success/${res.data.id}`);
    } catch (err) {
      console.error('Order error:', err);
      toast.error(err.response?.data?.error || 'Failed to place order');
    }
    setIsProcessing(false);
  };

  const total = getCartTotal();
  const tax = total * 0.1;
  const grandTotal = total + tax;

  if (cart.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <div className="empty-icon animate-scale-in">
          <ShoppingCart size={64} />
        </div>
        <h2>Your Cart is Empty</h2>
        <p>Add some delicious items from the menu!</p>
        <Link to={`/table/${uniqueLink}`}>
          <Button size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="cart-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/table/${uniqueLink}`)}
          className="back-link"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        <div className="header-info">
          <h1>Your Cart</h1>
          <Badge variant="outline">Table: {currentTable?.table_number}</Badge>
        </div>
      </header>

      <div className="cart-content">
        <div className="cart-items-section">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Cart Items ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item, index) => (
                <div 
                  key={item.id} 
                  className="cart-item animate-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <span className="price">₹{item.price} each</span>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="quantity-btn"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="quantity">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="quantity-btn"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="subtotal">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="cart-summary-section">
          <Card className="summary-card animate-fade-in">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="form-group">
                <Label>Your Name (optional)</Label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <Label>Special Instructions</Label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests?"
                />
              </div>

              <div className="totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="place-order-btn w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order - ₹${grandTotal.toFixed(2)}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
