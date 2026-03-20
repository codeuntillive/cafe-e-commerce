import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  QrCode, 
  Clock, 
  Users, 
  Shield, 
  Zap,
  BarChart3,
  UtensilsCrossed,
  ShoppingCart,
  Bell,
  Settings,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import '../style/Home.css';

const Home = () => {
  return (
    <div className="brutalist-home">
      {/* Hero Section */}
      <section className="brutalist-hero">
        <div className="brutalist-hero-content">
          <h1 className="brutalist-hero-title">
            Digital
            <span>Menu System</span>
          </h1>
          <p className="brutalist-hero-subtitle">
            A comprehensive restaurant management platform featuring QR code ordering, 
            real-time kitchen coordination, inventory tracking, and seamless payment processing. 
            Built for modern hospitality.
          </p>
          <div className="brutalist-hero-actions">
            <Link to="/signup" className="brutalist-btn brutalist-btn-primary">
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="brutalist-btn brutalist-btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="brutalist-hero-visual">
          <span className="brutalist-hero-label">Restaurant Technology</span>
          <div className="brutalist-hero-badge">Est. 2024</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="brutalist-section-header">
        <div className="brutalist-container">
          <h2>Core Features</h2>
          <p>Everything you need to run a modern restaurant operation efficiently</p>
        </div>
      </section>
      
      <section className="brutalist-features">
        <div className="brutalist-feature">
          <div className="brutalist-feature-number">01</div>
          <h3>QR Code Ordering</h3>
          <p>
            Customers scan a QR code at their table to access the full digital menu on their 
            smartphone. No app download required. Orders are transmitted directly to the kitchen 
            display system, eliminating manual order taking and reducing errors by up to 95%.
          </p>
        </div>
        <div className="brutalist-feature">
          <div className="brutalist-feature-number">02</div>
          <h3>Real-Time Updates</h3>
          <p>
            Live order tracking with instant notifications. Kitchen staff receive orders immediately 
            with preparation timers. Customers receive status updates when their order is confirmed, 
            being prepared, and ready for pickup or table delivery.
          </p>
        </div>
        <div className="brutalist-feature">
          <div className="brutalist-feature-number">03</div>
          <h3>Inventory Management</h3>
          <p>
            Automatic stock tracking with low-inventory alerts. Menu items can be marked unavailable 
            in real-time when ingredients run out. Integration with supplier ordering systems for 
            automated reordering based on consumption patterns.
          </p>
        </div>
      </section>

      {/* System Overview Section */}
      <section className="brutalist-system">
        <div className="brutalist-system-info">
          <div className="brutalist-system-title">Platform Overview</div>
          <h3>Complete Restaurant Ecosystem</h3>
          <p className="brutalist-system-description">
            Our online menu system is a full-stack solution designed specifically for the food 
            service industry. The platform consists of three integrated components: a customer-facing 
            ordering interface, a kitchen display system, and an administrative dashboard for 
            comprehensive management.
          </p>
          <ul className="brutalist-system-list">
            <li>Customer mobile ordering interface</li>
            <li>Kitchen display and order management</li>
            <li>Admin dashboard with analytics</li>
            <li>Multi-location support</li>
            <li>Payment gateway integration</li>
            <li>Staff management tools</li>
          </ul>
        </div>
        <div className="brutalist-system-visual">
          <div className="brutalist-stat">
            <span className="brutalist-stat-number">3</span>
            <span className="brutalist-stat-label">User Interfaces</span>
          </div>
          <div className="brutalist-stat">
            <span className="brutalist-stat-number">∞</span>
            <span className="brutalist-stat-label">Menu Items</span>
          </div>
          <div className="brutalist-stat">
            <span className="brutalist-stat-number">24/7</span>
            <span className="brutalist-stat-label">System Uptime</span>
          </div>
          <div className="brutalist-stat">
            <span className="brutalist-stat-number">100%</span>
            <span className="brutalist-stat-label">Mobile Compatible</span>
          </div>
        </div>
      </section>

      {/* User Interface Section */}
      <section className="brutalist-section-header">
        <div className="brutalist-container">
          <h2>User Interfaces</h2>
          <p>Purpose-built interfaces for every stakeholder in the restaurant ecosystem</p>
        </div>
      </section>

      <section className="brutalist-interface">
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <Smartphone size={28} />
          </div>
          <h4>Customer Portal</h4>
          <p>
            Mobile-optimized menu browsing with high-resolution food images, detailed descriptions, 
            allergen information, and customization options. Supports multiple languages and 
            accessibility features.
          </p>
        </div>
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <UtensilsCrossed size={28} />
          </div>
          <h4>Kitchen Display</h4>
          <p>
            Real-time order queue with preparation timers, order prioritization, and completion 
            tracking. Supports multiple kitchen stations with order routing based on menu item type.
          </p>
        </div>
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <BarChart3 size={28} />
          </div>
          <h4>Admin Dashboard</h4>
          <p>
            Complete control center for menu management, pricing, inventory, staff scheduling, 
            and comprehensive sales analytics with exportable reports.
          </p>
        </div>
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <ShoppingCart size={28} />
          </div>
          <h4>Order Management</h4>
          <p>
            Centralized order processing with status tracking, modification capabilities, 
            refund processing, and customer communication tools.
          </p>
        </div>
      </section>

      {/* Additional Interface Features */}
      <section className="brutalist-interface">
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <QrCode size={28} />
          </div>
          <h4>Table QR Codes</h4>
          <p>
            Unique QR codes for each table enabling location-based ordering. Automatic table 
            assignment for delivery and service tracking.
          </p>
        </div>
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <Bell size={28} />
          </div>
          <h4>Notification System</h4>
          <p>
            Multi-channel notifications via SMS, email, and push alerts. Automated customer 
            updates and staff alerts for critical events.
          </p>
        </div>
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <Settings size={28} />
          </div>
          <h4>Configuration Panel</h4>
          <p>
            Flexible system settings for operating hours, tax rates, payment methods, 
            promotional campaigns, and loyalty program integration.
          </p>
        </div>
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <Users size={28} />
          </div>
          <h4>Staff Management</h4>
          <p>
            Role-based access control, shift scheduling, performance metrics, and 
            tip distribution tracking for service staff.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="brutalist-benefits">
        <div className="brutalist-benefits-header">
          <h3>Why Choose Our System?</h3>
          <p>Proven results for restaurants of all sizes</p>
        </div>
        <div className="brutalist-benefits-grid">
          <div className="brutalist-benefit">
            <h4>Increased Efficiency</h4>
            <p>
              Reduce order processing time by 60%. Staff can focus on food preparation and 
              customer service instead of manual order taking. Table turnover rates improve 
              significantly with streamlined ordering.
            </p>
          </div>
          <div className="brutalist-benefit">
            <h4>Higher Average Orders</h4>
            <p>
              Visual menu presentation with high-quality images increases average order value 
              by 25-30%. Smart upselling suggestions and combo deals are automatically 
              presented to customers.
            </p>
          </div>
          <div className="brutalist-benefit">
            <h4>Reduced Errors</h4>
            <p>
              Eliminate miscommunication between staff and kitchen. Digital orders are 
              transmitted exactly as entered, with special instructions clearly highlighted 
              for kitchen staff.
            </p>
          </div>
          <div className="brutalist-benefit">
            <h4>Data-Driven Decisions</h4>
            <p>
              Comprehensive analytics reveal customer preferences, peak hours, popular items, 
              and revenue trends. Make informed decisions about menu changes, pricing, and 
              staffing levels.
            </p>
          </div>
          <div className="brutalist-benefit">
            <h4>Contactless Experience</h4>
            <p>
              Full contactless ordering and payment capability. Customers feel safer with 
              minimal physical interaction. Meets health department requirements for 
              hygiene compliance.
            </p>
          </div>
          <div className="brutalist-benefit">
            <h4>Scalable Solution</h4>
            <p>
              From single-location cafes to multi-branch restaurant chains, the system 
              scales effortlessly. Centralized management for all locations with 
              location-specific customization.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="brutalist-section-header">
        <div className="brutalist-container">
          <h2>Technical Specifications</h2>
          <p>Enterprise-grade technology stack for reliability and performance</p>
        </div>
      </section>

      <section className="brutalist-interface">
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <Zap size={28} />
          </div>
          <h4>Real-Time Sync</h4>
          <p>
            WebSocket-based real-time communication ensures instant order transmission. 
            No page refreshes needed. All connected devices stay synchronized automatically.
          </p>
        </div>
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <Shield size={28} />
          </div>
          <h4>Secure Payments</h4>
          <p>
            PCI-DSS compliant payment processing with support for credit cards, digital wallets, 
            and UPI. End-to-end encryption for all financial transactions.
          </p>
        </div>
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <Clock size={28} />
          </div>
          <h4>99.9% Uptime</h4>
          <p>
            Cloud-hosted infrastructure with automatic failover and load balancing. 
            Your restaurant operations continue uninterrupted even during peak demand.
          </p>
        </div>
        <div className="brutalist-interface-item">
          <div className="brutalist-interface-icon">
            <Smartphone size={28} />
          </div>
          <h4>Progressive Web App</h4>
          <p>
            No app store downloads required. Works on any device with a web browser. 
            Offline capability ensures menu access even with unstable internet connections.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="brutalist-cta">
        <div className="brutalist-cta-content">
          <h3>Ready to Transform Your Restaurant?</h3>
          <p>
            Join hundreds of restaurants already using our digital menu system. 
            Setup takes less than 30 minutes. No technical knowledge required. 
            Our team provides full onboarding support.
          </p>
          <div className="brutalist-cta-actions">
            <Link to="/signup" className="brutalist-btn brutalist-btn-primary">
              Create Account
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="brutalist-btn brutalist-btn-secondary">
              Staff Login
            </Link>
          </div>
        </div>
        <div className="brutalist-cta-visual"></div>
      </section>

      {/* Contact Section */}
      <section className="brutalist-contact">
        <div className="brutalist-contact-item">
          <div className="brutalist-contact-icon">
            <Phone size={24} />
          </div>
          <h4>Phone</h4>
          <p>+91 98765 43210</p>
        </div>
        <div className="brutalist-contact-item">
          <div className="brutalist-contact-icon">
            <Mail size={24} />
          </div>
          <h4>Email</h4>
          <p>contact@digitalmenu.com</p>
        </div>
        <div className="brutalist-contact-item">
          <div className="brutalist-contact-icon">
            <MapPin size={24} />
          </div>
          <h4>Location</h4>
          <p>Mumbai, Maharashtra, India</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="brutalist-footer">
        <p>&copy; 2024 Digital Menu System. All Rights Reserved.</p>
        <div className="brutalist-footer-links">
          <Link to="/login">Admin Portal</Link>
          <Link to="/signup">Register</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
