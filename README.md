# 📦 E-Com: Modern E-Commerce Platform

> A full-stack MERN e-commerce application with modern features, real-time updates, and a seamless user experience.



![Version](https://img.shields.io/badge/version-1.0.0-success)
![Build Status](https://img.shields.io/badge/build-passing-success)
![Node.js](https://img.shields.io/badge/Node.js-%3E=18.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)

---

## 📋 Table of Contents

- [🎯 About](#-about)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [📖 Usage](#-usage)
  - [API Endpoints](#api-endpoints)
  - [Frontend Screenshots](#frontend-screenshots)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👏 Credits](#-credits)
- [❓ FAQ](#-faq)

---

## 🎯 About

[**Project Name**] is a modern, full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It provides a complete solution for online shopping with features like user authentication, product management, shopping cart, order processing, and admin dashboard.

This project demonstrates best practices in full-stack development, including RESTful API design, real-time updates, secure authentication, and responsive UI design.

### Key Highlights

- 🔐 **Secure Authentication** - JWT-based auth with OTP verification
- 🛒 **Shopping Cart** - Persistent cart with Zustand state management
- 📊 **Admin Dashboard** - Comprehensive management interface
- 💳 **Payment Integration** - Secure payment processing
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Updates** - Live order status updates

---

## ✨ Features

### User Features

| Feature | Description |
|---------|-------------|
| 👤 **User Authentication** | Sign up, login, and secure session management with JWT tokens |
| 🔢 **OTP Verification** | Additional security layer with one-time password verification |
| 🛒 **Shopping Cart** | Add/remove items, update quantities, persistent cart state |
| 🛍️ **Product Browsing** | Browse products by categories, search, and filter |
| 📦 **Order Management** | Place orders, track status, view order history |
| 💳 **Secure Payments** | Integrated payment processing |

### Admin Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Overview of sales, orders, and key metrics |
| 🍔 **Menu Management** | Add, edit, delete products and categories |
| 🪑 **Table Management** | Manage restaurant/table bookings (if applicable) |
| 📋 **Order Management** | View and update order status in real-time |
| 💰 **Transaction History** | Complete financial records and reporting |
| 👥 **User Management** | Manage customer accounts |

---

## 🛠️ Tech Stack

### Frontend

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4D4D4D?style=for-the-badge&logo=zustand&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

</div>

### Backend

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-282828?style=for-the-badge&logo=bun&logoColor=white)

</div>

### Additional Tools

- **Database Migrations**: PostgreSQL with SQL migrations
- **Caching**: Redis for performance optimization
- **Real-time**: WebSocket for live updates
- **Containerization**: Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Installation |
|------|---------|--------------|
| **Node.js** | ≥ 18.x | [Download](https://nodejs.org/) |
| **npm** or **bun** | Latest | Comes with Node.js |
| **PostgreSQL** | ≥ 14.x | [Download](https://www.postgresql.org/download/) |
| **Redis** | ≥ 6.x | [Download](https://redis.io/download/) |
| **Git** | Latest | [Download](https://git-scm.com/) |

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/[your-username]/[your-repo-name].git
cd [your-repo-name]
```

#### 2. Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies (using bun recommended)
bun install

# Or using npm
npm install
```

#### 3. Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies (using bun recommended)
bun install

# Or using npm
npm install
```

### Environment Variables

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_db_name

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=5

# Payment Configuration (Example with Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
# API Base URL
VITE_API_URL=http://localhost:3000

# WebSocket URL
VITE_WS_URL=ws://localhost:3000
```

### Running the Application

#### Option 1: Run with Docker (Recommended)

```bash
# From the project root directory
docker-compose up -d
```

#### Option 2: Run Manually

**Start Backend:**

```bash
cd backend
bun run dev
# OR
npm run dev
```

**Start Frontend:**

```bash
cd frontend
bun run dev
# OR
npm run dev
```

#### Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3000 |
| **API Documentation** | http://localhost:3000/api (if available) |

---

## 📖 Usage

### API Endpoints

#### Authentication

```
POST /api/auth/register    - Register new user
POST /api/auth/login       - User login
POST /api/auth/verify-otp   - Verify OTP
POST /api/auth/logout      - User logout
GET  /api/auth/me          - Get current user
```

#### Products/Menu

```
GET    /api/menu           - Get all menu items
GET    /api/menu/:id       - Get single menu item
POST   /api/menu           - Create menu item (Admin)
PUT    /api/menu/:id       - Update menu item (Admin)
DELETE /api/menu/:id       - Delete menu item (Admin)
```

#### Orders

```
GET    /api/orders         - Get user's orders
POST   /api/orders         - Create new order
GET    /api/orders/:id     - Get order details
PUT    /api/orders/:id     - Update order status (Admin)
```

#### Tables (if applicable)

```
GET    /api/tables         - Get all tables
POST   /api/tables         - Book a table
PUT    /api/tables/:id     - Update table status (Admin)
```

#### Payments

```
POST /api/payment/create-intent    - Create payment intent
POST /api/payment/webhook          - Payment webhook handler
```

### Usage Examples

#### Making an API Request

```javascript
// Using fetch
const response = await fetch('http://localhost:3000/api/menu');
const data = await response.json();
console.log(data);
```

#### Using the API Client

```javascript
import { api } from './lib/api';

// Get all products
const products = await api.get('/menu');
console.log(products);

// Place an order
const order = await api.post('/orders', {
  items: [
    { productId: '123', quantity: 2 }
  ],
  totalAmount: 49.99
});
console.log(order);
```

#### State Management (Zustand)

```javascript
import { useCartStore } from './stores/cartStore';

// Add item to cart
useCartStore.getState().addItem({
  id: 'product-123',
  name: 'Product Name',
  price: 19.99,
  quantity: 1
});

// Get cart items
const cartItems = useCartStore.getState().items;

// Clear cart
useCartStore.getState().clearCart();
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps to contribute:

### Contributing Guidelines

1. **Fork the Repository**
   ```bash
   git fork https://github.com/codeuntillive/cafe-e-commerce.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Write clean, commented code
   - Follow existing code style and conventions
   - Add appropriate tests

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: Description of your changes"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes in detail
   - Submit for review

### Code Style Guidelines

- Use meaningful variable and function names
- Add comments for complex logic
- Follow ESLint configuration
- Write descriptive commit messages

### Reporting Issues

If you find a bug or have a suggestion:

1. Search existing issues first
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior

---


### Acknowledgments

- [List any resources, tutorials, or inspiration]
- [Credit open-source libraries used]
- [Thank contributors]

### Dependencies

This project uses the following major packages:

**Backend:**
- `express` - Web framework
- `pg` - PostgreSQL client
- `redis` - Redis client
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing

**Frontend:**
- `react` - UI library
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `zustand` - State management

---

## ❓ FAQ

### Q: How do I set up the database?

**A:** 
1. Install PostgreSQL on your machine
2. Create a new database named `ecommerce`
3. Update the `.env` file with your database credentials
4. Run migrations: `bun run db:migrate` (or `npm run db:migrate`)

### Q: How do I run the project locally?

**A:** Follow the installation steps above. You can either:
- Use Docker: `docker-compose up -d`
- Run manually: Start backend with `cd backend && bun run dev`, then frontend with `cd frontend && bun run dev`

### Q: How do I create an admin account?

**A:** 
1. Register a new user through the frontend
2. Manually update the `role` field in the database to `'admin'`
3. Or use a seed script: `bun run db:seed`

### Q: Is payment integration included?

**A:** The project includes a payment integration structure (currently set up for Stripe). You need to:
1. Create a Stripe account
2. Add your API keys to the `.env` file
3. Configure webhook endpoints

### Q: How do I enable Redis caching?

**A:** 
1. Install Redis on your machine or use a cloud service
2. Update the `REDIS_URL` in your `.env` file
3. The application will automatically use Redis for caching

### Q: Can I use this project for production?

**A:** This is a demo/learning project. Before deploying to production:
- Change all default secrets and API keys
- Set up proper SSL/HTTPS
- Configure production database
- Review and enhance security measures
- Set up proper logging and monitoring

### Q: How do I add new features?

**A:**
1. Fork the repository
2. Create a new branch: `git checkout -b feature/feature-name`
3. Implement your feature
4. Add tests if applicable
5. Submit a pull request

### Q: Where can I find the database schema?

**A:** The database schema is defined in `backend/src/infrastructure/database/migrations/001_initial_schema.sql`

---

## 📞 Support

If you need help or have questions:

- 📧 **Email**: codeuntillive@gmial.com


---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ and ☕

</div>

---


