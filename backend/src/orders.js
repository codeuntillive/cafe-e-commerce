import express from "express";
import db from "./db.js";
import { checkauth } from "./auth.js";

const router = express.Router();

// Helper to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Get all orders (admin)
router.get("/", checkauth, async (req, res) => {
  try {
    const { status, date, table_id } = req.query;
    let query = `
      SELECT o.*, rt.table_number, rt.unique_link
      FROM orders o
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    if (date) {
      params.push(date);
      query += ` AND DATE(o.created_at) = $${params.length}`;
    }

    if (table_id) {
      params.push(table_id);
      query += ` AND o.table_id = $${params.length}`;
    }

    query += " ORDER BY o.created_at DESC";

    const result = await db.query(query, params);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await db.query(
          `SELECT oi.*, mi.name, mi.image_url 
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order by ID
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, rt.table_number, rt.unique_link
       FROM orders o
       LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
       WHERE o.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = result.rows[0];
    const itemsResult = await db.query(
      `SELECT oi.*, mi.name, mi.image_url 
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    res.json({ ...order, items: itemsResult.rows });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Get orders by table (for customer tracking)
router.get("/table/:tableId", async (req, res) => {
  try {
    const { tableId } = req.params;
    const result = await db.query(
      `SELECT o.*, rt.table_number
       FROM orders o
       LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
       WHERE o.table_id = $1
       ORDER BY o.created_at DESC`,
      [tableId]
    );

    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await db.query(
          `SELECT oi.*, mi.name, mi.image_url 
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error("Error fetching table orders:", err);
    res.status(500).json({ error: "Failed to fetch table orders" });
  }
});

// Create new order (customer)
router.post("/", async (req, res) => {
  const client = await db.connect();
  
  try {
    await client.query("BEGIN");

    const { table_id, items, customer_name, notes } = req.body;

    if (!table_id || !items || items.length === 0) {
      return res.status(400).json({ error: "Table ID and items are required" });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuResult = await client.query(
        "SELECT price FROM menu_items WHERE id = $1 AND is_available = true",
        [item.menu_item_id]
      );

      if (menuResult.rows.length === 0) {
        throw new Error(`Menu item ${item.menu_item_id} not available`);
      }

      const unitPrice = parseFloat(menuResult.rows[0].price);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: subtotal,
        special_instructions: item.special_instructions,
      });
    }

    const orderNumber = generateOrderNumber();

    // Insert order
    const orderResult = await client.query(
      `INSERT INTO orders (table_id, order_number, total_amount, customer_name, notes, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'pending')
       RETURNING *`,
      [table_id, orderNumber, totalAmount, customer_name || null, notes || null]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, special_instructions)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.menu_item_id, item.quantity, item.unit_price, item.subtotal, item.special_instructions]
      );
    }

    await client.query("COMMIT");

    // Get the complete order with items
    const fullOrder = await db.query(
      `SELECT o.*, rt.table_number
       FROM orders o
       LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
       WHERE o.id = $1`,
      [order.id]
    );

    const itemsResult = await db.query(
      `SELECT oi.*, mi.name, mi.image_url 
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    const finalOrder = { 
      ...fullOrder.rows[0], 
      items: itemsResult.rows 
    };

    // Emit socket event for real-time update
    if (req.app.get("io")) {
      req.app.get("io").emit("new-order", finalOrder);
    }

    res.status(201).json(finalOrder);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", err);
    res.status(500).json({ error: err.message || "Failed to create order" });
  } finally {
    client.release();
  }
});

// Update order status (admin)
router.put("/:id/status", checkauth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await db.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = result.rows[0];

    // Get table info for response
    const tableResult = await db.query(
      "SELECT table_number FROM restaurant_tables WHERE id = $1",
      [order.table_id]
    );

    const fullOrder = { 
      ...order, 
      table_number: tableResult.rows[0]?.table_number 
    };

    // Emit socket event for real-time update
    if (req.app.get("io")) {
      req.app.get("io").emit("order-status-updated", fullOrder);
    }

    res.json(fullOrder);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Update payment status (webhook/callback)
router.put("/:id/payment", async (req, res) => {
  try {
    const { payment_status, payment_id, razorpay_order_id } = req.body;
    const { id } = req.params;

    const result = await db.query(
      `UPDATE orders 
       SET payment_status = $1, 
           payment_id = COALESCE($2, payment_id),
           razorpay_order_id = COALESCE($3, razorpay_order_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [payment_status, payment_id, razorpay_order_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating payment status:", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

// Get order statistics (admin)
router.get("/stats/summary", checkauth, async (req, res) => {
  try {
    // Today's stats
    const todayResult = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing_orders,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready_orders,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue
      FROM orders 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // This week's stats
    const weekResult = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue
      FROM orders 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    res.json({
      today: todayResult.rows[0],
      thisWeek: weekResult.rows[0],
    });
  } catch (err) {
    console.error("Error fetching order stats:", err);
    res.status(500).json({ error: "Failed to fetch order statistics" });
  }
});

export default router;
