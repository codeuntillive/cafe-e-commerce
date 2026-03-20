import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCustomerStore } from '../../zustnd/store';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Loader2,
  UtensilsCrossed,
  ArrowLeft
} from 'lucide-react';
import './CustomerMenu.css';

const CustomerMenu = () => {
  const { uniqueLink } = useParams();
  const navigate = useNavigate();
  const { currentTable, menu, fetchTableMenu, addToCart, cart } = useCustomerStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMenu();
  }, [uniqueLink]);

  const loadMenu = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchTableMenu(uniqueLink);
    } catch (err) {
      setError('Table not found or inactive');
      toast.error('Invalid table link');
    }
    setIsLoading(false);
  };

  const categories = ['all', ...new Set(menu.map(item => item.category).filter(Boolean))];

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.is_available;
  });

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (isLoading) {
    return (
      <div className="customer-loading">
        <Loader2 className="animate-spin h-10 w-10" />
        <p>Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-error">
        <div className="error-icon">⚠️</div>
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="customer-menu">
      {/* className="customer Header */}
      <header className="customer-header">
        <div className="header-content">
          <Button 
            variant="ghost" 
            size="sm" 
            className="back-button"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="restaurant-info">
            <h1>🍽️ {currentTable?.table_number || 'Restaurant'}</h1>
            <p>Scan, Order, Enjoy!</p>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="menu-controls">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <Input 
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-tabs">
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="category-tab"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="menu-items">
        {filteredMenu.length === 0 ? (
          <div className="no-items">
            <UtensilsCrossed size={48} />
            <p>No items found</p>
          </div>
        ) : (
          filteredMenu.map((item, index) => (
            <Card 
              key={item.id} 
              className="menu-item-card animate-scale-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="item-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <div className="no-image">
                    <UtensilsCrossed size={48} />
                  </div>
                )}
              </div>
              <CardContent className="item-details">
                <div className="item-header">
                  <h3>{item.name}</h3>
                  <Badge variant="outline" className="category-badge">
                    {item.category}
                  </Badge>
                </div>
                <p className="description">{item.description}</p>
                <div className="item-footer">
                  <span className="price">₹{item.price}</span>
                  <Button 
                    size="sm"
                    onClick={() => addToCart(item)}
                    className="add-button"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Floating Cart Button */}
      {getCartCount() > 0 && (
        <Link to={`/customer/cart/${uniqueLink}`} className="cart-floating-btn">
          <div className="cart-info">
            <ShoppingCart className="h-5 w-5" />
            <span className="cart-count">{getCartCount()} items</span>
          </div>
          <span className="cart-total">View Cart - ₹{getCartTotal()}</span>
        </Link>
      )}
    </div>
  );
};

export default CustomerMenu;
