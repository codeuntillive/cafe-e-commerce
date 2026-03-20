import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

// Use Pool instead of Client for connection pooling
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Connect to database and initialize
const initDatabase = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log("Database connection established");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profilepic TEXT,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("users table created");

    // Create menu_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50),
        image_url TEXT,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("menu_items table created");

    // Create tables table
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id SERIAL PRIMARY KEY,
        table_number VARCHAR(20) UNIQUE NOT NULL,
        unique_link VARCHAR(100) UNIQUE NOT NULL,
        qr_code_url TEXT,
        capacity INTEGER DEFAULT 4,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("restaurant_tables table created");

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES restaurant_tables(id),
        order_number VARCHAR(20) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_id VARCHAR(100),
        razorpay_order_id VARCHAR(100),
        customer_name VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("orders table created");

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id INTEGER REFERENCES menu_items(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("order_items table created");

    // Insert some sample menu items if empty
    const menuCount = await client.query("SELECT COUNT(*) FROM menu_items");
    if (parseInt(menuCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO menu_items (name, description, price, category, image_url, is_available) VALUES
        ('Margherita Pizza', 'Classic Italian pizza with tomato sauce and mozzarella', 299, 'main', 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400', true),
        ('Chicken Burger', 'Juicy chicken patty with fresh vegetables', 199, 'main', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', true),
        ('Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 149, 'appetizer', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),
        ('Masala Dosa', 'Crispy rice pancake with spiced potato filling', 120, 'main', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400', true),
        ('Chocolate Ice Cream', 'Rich and creamy chocolate ice cream', 80, 'dessert', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', true),
        ('Fresh Orange Juice', 'Freshly squeezed orange juice', 60, 'drinks', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', true),
        ('Paneer Tikka', 'Grilled paneer cubes with spices', 220, 'appetizer', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', true),
        ('Chicken Fried Rice', 'Stir-fried rice with chicken and vegetables', 180, 'main', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', true);
      `);
      console.log("Sample menu items inserted");
    }

    // Insert some sample tables if empty
    const tableCount = await client.query("SELECT COUNT(*) FROM restaurant_tables");
    if (parseInt(tableCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO restaurant_tables (table_number, unique_link, capacity) VALUES
        ('Table 1', 'table-001-abc123', 4),
        ('Table 2', 'table-002-def456', 4),
        ('Table 3', 'table-003-ghi789', 6),
        ('Table 4', 'table-004-jkl012', 2),
        ('Table 5', 'table-005-mno345', 8);
      `);
      console.log("Sample tables inserted");
    }

    // Insert default admin user if not exists
    const adminCheck = await client.query("SELECT COUNT(*) FROM users WHERE email = 'admin@restaurant.com'");
    if (parseInt(adminCheck.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO users (fullname, email, password, role) VALUES
        ('Admin', 'admin@restaurant.com', $1, 'admin')
      `, [hashedPassword]);
      console.log("Default admin user created");
      console.log("Admin credentials: email=admin@restaurant.com, password=admin123");
    }

    console.log("Database initialization complete!");
    return true;
  } catch (err) {
    console.error("Database initialization error:", err);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Export pool with query method for simple queries
const db = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
  end: () => pool.end(),
};

export default db;
export { initDatabase, initDatabase as connectDB };
