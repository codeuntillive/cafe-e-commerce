/**
 * Database Seeder
 * Creates demo data for development and testing
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const { Pool } = pg;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'restaurant_qr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

/**
 * Generate a unique QR token for tables
 */
function generateQRToken(): string {
  return nanoid(12);
}

/**
 * Hash phone number (simplified for demo)
 */
function hashPhone(phone: string): string {
  // In production, use proper hashing like bcrypt
  return `hashed_${phone}`;
}

/**
 * Seed the database with demo data
 */
async function seed(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Starting database seeding...');

    // =========================================================================
    // 1. Create Restaurant
    // =========================================================================
    console.log('📍 Creating restaurant...');
    
    const restaurantResult = await client.query(`
      INSERT INTO restaurants (name, slug, address, phone, settings)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      'The Golden Spoon',
      'golden-spoon',
      '123 Main Street, Downtown, City - 400001',
      '+91 9876543210',
      JSON.stringify({
        currency: 'INR',
        taxRate: 5,
        serviceChargePercent: 10,
        openingTime: '09:00',
        closingTime: '22:00',
        notificationSound: true,
        autoAcceptOrders: false,
      }),
    ]);

    const restaurantId = restaurantResult.rows[0].id;
    console.log(`   ✓ Restaurant created with ID: ${restaurantId}`);

    // =========================================================================
    // 2. Create Admin Users
    // =========================================================================
    console.log('👤 Creating admin users...');

    const passwordHash = await bcrypt.hash('admin123', 10);

    const adminUsers = [
      { email: 'owner@goldenspoon.com', name: 'John Owner', role: 'owner' },
      { email: 'manager@goldenspoon.com', name: 'Jane Manager', role: 'manager' },
      { email: 'staff@goldenspoon.com', name: 'Bob Staff', role: 'staff' },
    ];

    for (const admin of adminUsers) {
      await client.query(`
        INSERT INTO admin_users (restaurant_id, email, password_hash, name, role)
        VALUES ($1, $2, $3, $4, $5)
      `, [restaurantId, admin.email, passwordHash, admin.name, admin.role]);
      console.log(`   ✓ Created admin: ${admin.email} (${admin.role})`);
    }

    // =========================================================================
    // 3. Create Tables
    // =========================================================================
    console.log('🪑 Creating tables...');

    const tables = [
      { tableNumber: 'T1', capacity: 2 },
      { tableNumber: 'T2', capacity: 2 },
      { tableNumber: 'T3', capacity: 4 },
      { tableNumber: 'T4', capacity: 4 },
      { tableNumber: 'T5', capacity: 6 },
      { tableNumber: 'T6', capacity: 6 },
      { tableNumber: 'T7', capacity: 8 },
      { tableNumber: 'T8', capacity: 8 },
      { tableNumber: 'VIP1', capacity: 4 },
      { tableNumber: 'VIP2', capacity: 6 },
    ];

    const tableIds: string[] = [];

    for (const table of tables) {
      const qrToken = generateQRToken();
      const result = await client.query(`
        INSERT INTO tables (restaurant_id, table_number, qr_token, capacity, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, qr_token
      `, [restaurantId, table.tableNumber, qrToken, table.capacity, 'available']);
      
      tableIds.push(result.rows[0].id);
      console.log(`   ✓ Created table ${table.tableNumber} (QR: ${qrToken})`);
    }

    // =========================================================================
    // 4. Create Menu Categories
    // =========================================================================
    console.log('📂 Creating menu categories...');

    const categories = [
      { name: 'Appetizers', displayOrder: 1 },
      { name: 'Soups & Salads', displayOrder: 2 },
      { name: 'Main Course', displayOrder: 3 },
      { name: 'Biryani & Rice', displayOrder: 4 },
      { name: 'Breads', displayOrder: 5 },
      { name: 'Desserts', displayOrder: 6 },
      { name: 'Beverages', displayOrder: 7 },
    ];

    const categoryIds: string[] = [];

    for (const category of categories) {
      const result = await client.query(`
        INSERT INTO menu_categories (restaurant_id, name, display_order, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [restaurantId, category.name, category.displayOrder, true]);
      
      categoryIds.push(result.rows[0].id);
      console.log(`   ✓ Created category: ${category.name}`);
    }

    // =========================================================================
    // 5. Create Menu Items
    // =========================================================================
    console.log('🍽️ Creating menu items...');

    const menuItems = [
      // Appetizers
      { categoryId: 0, name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled to perfection', price: 299, modifiers: [
        { id: 'spice', name: 'Spice Level', required: true, maxSelections: 1, options: [
          { id: 'mild', name: 'Mild', price: 0 },
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'hot', name: 'Hot', price: 0 },
        ]},
      ]},
      { categoryId: 0, name: 'Chicken 65', description: 'Spicy deep-fried chicken bites', price: 349, modifiers: [
        { id: 'spice', name: 'Spice Level', required: true, maxSelections: 1, options: [
          { id: 'mild', name: 'Mild', price: 0 },
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'hot', name: 'Hot', price: 0 },
        ]},
      ]},
      { categoryId: 0, name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes', price: 99, modifiers: [] },
      { categoryId: 0, name: 'Spring Rolls', description: 'Vegetable stuffed crispy rolls', price: 179, modifiers: [] },
      
      // Soups & Salads
      { categoryId: 1, name: 'Tomato Soup', description: 'Creamy tomato soup with croutons', price: 149, modifiers: [] },
      { categoryId: 1, name: 'Manchow Soup', description: 'Indo-Chinese spicy vegetable soup', price: 169, modifiers: [] },
      { categoryId: 1, name: 'Caesar Salad', description: 'Fresh romaine lettuce with caesar dressing', price: 249, modifiers: [
        { id: 'protein', name: 'Add Protein', required: false, maxSelections: 1, options: [
          { id: 'chicken', name: 'Grilled Chicken', price: 100 },
          { id: 'paneer', name: 'Paneer', price: 80 },
        ]},
      ]},
      
      // Main Course
      { categoryId: 2, name: 'Butter Chicken', description: 'Tender chicken in rich tomato-based gravy', price: 399, modifiers: [
        { id: 'spice', name: 'Spice Level', required: true, maxSelections: 1, options: [
          { id: 'mild', name: 'Mild', price: 0 },
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'hot', name: 'Hot', price: 0 },
        ]},
      ]},
      { categoryId: 2, name: 'Paneer Butter Masala', description: 'Cottage cheese in creamy tomato gravy', price: 349, modifiers: [
        { id: 'spice', name: 'Spice Level', required: true, maxSelections: 1, options: [
          { id: 'mild', name: 'Mild', price: 0 },
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'hot', name: 'Hot', price: 0 },
        ]},
      ]},
      { categoryId: 2, name: 'Dal Makhani', description: 'Black lentils slow-cooked with butter', price: 279, modifiers: [] },
      { categoryId: 2, name: 'Chicken Tikka Masala', description: 'Grilled chicken in spiced gravy', price: 429, modifiers: [] },
      { categoryId: 2, name: 'Kadai Paneer', description: 'Paneer cooked with bell peppers', price: 319, modifiers: [] },
      { categoryId: 2, name: 'Mutton Rogan Josh', description: 'Kashmiri style mutton curry', price: 499, modifiers: [] },
      
      // Biryani & Rice
      { categoryId: 3, name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken', price: 349, modifiers: [] },
      { categoryId: 3, name: 'Veg Biryani', description: 'Fragrant rice with mixed vegetables', price: 279, modifiers: [] },
      { categoryId: 3, name: 'Mutton Biryani', description: 'Slow-cooked mutton biryani', price: 449, modifiers: [] },
      { categoryId: 3, name: 'Jeera Rice', description: 'Cumin flavored basmati rice', price: 149, modifiers: [] },
      
      // Breads
      { categoryId: 4, name: 'Butter Naan', description: 'Soft leavened bread with butter', price: 59, modifiers: [] },
      { categoryId: 4, name: 'Garlic Naan', description: 'Naan topped with garlic', price: 79, modifiers: [] },
      { categoryId: 4, name: 'Roti', description: 'Whole wheat bread', price: 39, modifiers: [] },
      { categoryId: 4, name: 'Laccha Paratha', description: 'Layered whole wheat bread', price: 69, modifiers: [] },
      
      // Desserts
      { categoryId: 5, name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in sugar syrup', price: 99, modifiers: [] },
      { categoryId: 5, name: 'Rasmalai', description: 'Soft paneer discs in sweet milk', price: 129, modifiers: [] },
      { categoryId: 5, name: 'Kulfi', description: 'Traditional Indian ice cream', price: 149, modifiers: [
        { id: 'flavor', name: 'Flavor', required: true, maxSelections: 1, options: [
          { id: 'malai', name: 'Malai', price: 0 },
          { id: 'pista', name: 'Pista', price: 20 },
          { id: 'mango', name: 'Mango', price: 20 },
        ]},
      ]},
      
      // Beverages
      { categoryId: 6, name: 'Masala Chai', description: 'Spiced Indian tea', price: 49, modifiers: [] },
      { categoryId: 6, name: 'Fresh Lime Soda', description: 'Refreshing lime drink', price: 79, modifiers: [
        { id: 'type', name: 'Type', required: true, maxSelections: 1, options: [
          { id: 'sweet', name: 'Sweet', price: 0 },
          { id: 'salt', name: 'Salt', price: 0 },
          { id: 'mixed', name: 'Mixed', price: 0 },
        ]},
      ]},
      { categoryId: 6, name: 'Mango Lassi', description: 'Creamy mango yogurt drink', price: 129, modifiers: [] },
      { categoryId: 6, name: 'Cold Coffee', description: 'Iced coffee with cream', price: 149, modifiers: [] },
    ];

    for (const item of menuItems) {
      await client.query(`
        INSERT INTO menu_items (category_id, restaurant_id, name, description, price, is_available, modifiers)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        categoryIds[item.categoryId],
        restaurantId,
        item.name,
        item.description,
        item.price,
        true,
        JSON.stringify(item.modifiers),
      ]);
    }
    console.log(`   ✓ Created ${menuItems.length} menu items`);

    // =========================================================================
    // 6. Create Sample Customers
    // =========================================================================
    console.log('👥 Creating sample customers...');

    const customers = [
      { phone: '9876543211', name: 'Alice Johnson', email: 'alice@example.com' },
      { phone: '9876543212', name: 'Bob Smith', email: 'bob@example.com' },
      { phone: '9876543213', name: 'Charlie Brown', email: null },
    ];

    const customerIds: string[] = [];

    for (const customer of customers) {
      const result = await client.query(`
        INSERT INTO customers (phone, name, email)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [hashPhone(customer.phone), customer.name, customer.email]);
      
      customerIds.push(result.rows[0].id);
      console.log(`   ✓ Created customer: ${customer.name}`);
    }

    // =========================================================================
    // 7. Create Sample Orders
    // =========================================================================
    console.log('📝 Creating sample orders...');

    // Create a few sample orders for demonstration
    const sampleOrders = [
      {
        tableIndex: 0,
        customerIndex: 0,
        status: 'completed',
        items: [
          { menuItemIndex: 0, quantity: 2 },
          { menuItemIndex: 7, quantity: 1 },
          { menuItemIndex: 16, quantity: 2 },
        ],
      },
      {
        tableIndex: 2,
        customerIndex: 1,
        status: 'preparing',
        items: [
          { menuItemIndex: 7, quantity: 1 },
          { menuItemIndex: 8, quantity: 1 },
          { menuItemIndex: 16, quantity: 3 },
        ],
      },
      {
        tableIndex: 4,
        customerIndex: 2,
        status: 'pending',
        items: [
          { menuItemIndex: 13, quantity: 2 },
          { menuItemIndex: 20, quantity: 4 },
        ],
      },
    ];

    for (const order of sampleOrders) {
      // Calculate totals
      let totalAmount = 0;
      const orderItems = order.items.map(item => {
        const menuItem = menuItems[item.menuItemIndex];
        const itemTotal = menuItem.price * item.quantity;
        totalAmount += itemTotal;
        return {
          ...item,
          unitPrice: menuItem.price,
          totalPrice: itemTotal,
        };
      });

      const taxAmount = totalAmount * 0.05; // 5% tax
      const serviceCharge = totalAmount * 0.10; // 10% service charge

      // Insert order
      const orderResult = await client.query(`
        INSERT INTO orders (restaurant_id, table_id, customer_id, status, total_amount, tax_amount, service_charge)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, order_number
      `, [
        restaurantId,
        tableIds[order.tableIndex],
        customerIds[order.customerIndex],
        order.status,
        totalAmount,
        taxAmount,
        serviceCharge,
      ]);

      const orderId = orderResult.rows[0].id;
      const orderNumber = orderResult.rows[0].order_number;

      // Insert order items
      for (const item of orderItems) {
        await client.query(`
          INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          orderId,
          // Need to get the actual menu item ID from database
          (await client.query('SELECT id FROM menu_items WHERE restaurant_id = $1 ORDER BY created_at OFFSET $2 LIMIT 1', [restaurantId, item.menuItemIndex])).rows[0].id,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
          order.status === 'completed' ? 'served' : 'pending',
        ]);
      }

      // Update table status
      if (order.status === 'pending' || order.status === 'preparing') {
        await client.query(`
          UPDATE tables SET status = 'occupied' WHERE id = $1
        `, [tableIds[order.tableIndex]]);
      }

      console.log(`   ✓ Created order #${orderNumber} (${order.status})`);
    }

    await client.query('COMMIT');
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - 1 Restaurant: The Golden Spoon (slug: golden-spoon)`);
    console.log(`   - 3 Admin Users: owner@, manager@, staff@goldenspoon.com (password: admin123)`);
    console.log(`   - 10 Tables with QR tokens`);
    console.log(`   - 7 Menu Categories`);
    console.log(`   - ${menuItems.length} Menu Items`);
    console.log(`   - 3 Sample Customers`);
    console.log(`   - 3 Sample Orders`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeder
seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
