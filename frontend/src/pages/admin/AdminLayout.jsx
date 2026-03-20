import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../zustnd/authStore';
import { Button } from '../../components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  UtensilsCrossed, 
  Table2, 
  History, 
  LogOut,
  Menu,
  X,
  ChefHat,
  User
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, checkAuth, isAuthenticated, isAdmin } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuth();
      if (!authenticated) {
        navigate('/login');
      }
    };
    verifyAuth();
  }, [checkAuth, navigate]);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
    { path: '/admin/tables', icon: Table2, label: 'Tables' },
    { path: '/admin/history', icon: History, label: 'History' },
  ];

  const currentPage = menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="admin-layout">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </Button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <ChefHat className="logo-icon" />
            {isSidebarOpen && <span className="logo-text">Restaurant</span>}
          </div>
          <button 
            className="toggle-btn desktop-only"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`nav-item animate-fade-in ${location.pathname === item.path ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="nav-icon" size={20} />
              {isSidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={18} />
            </div>
            {isSidebarOpen && (
              <div className="user-details">
                <span className="user-name">{user?.fullname || 'Admin'}</span>
                <span className="user-role">Administrator</span>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      <main className={`main-content ${!isSidebarOpen ? 'expanded' : ''}`}>
        <header className="top-bar">
          <div className="page-title">
            <h1>{currentPage}</h1>
            <span className="breadcrumb">Admin / {currentPage}</span>
          </div>
          <div className="header-actions">
            <div className="user-info">
              <span>Welcome back,</span>
              <strong>{user?.fullname || 'Admin'}</strong>
            </div>
          </div>
        </header>
        
        <div className="content-area animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
