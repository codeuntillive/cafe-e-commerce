import express from "express";
import db from "./db.js";
import { checkauth } from "./auth.js";

const router = express.Router();

// Get all transactions (admin)
router.get("/", checkauth, async (req, res) => {
  try {
    const { start_date, end_date, status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT o.*, rt.table_number
      FROM orders o
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      WHERE o.payment_status = 'paid'
    `;
    const params = [];

    if (start_date) {
      params.push(start_date);
      query += ` AND DATE(o.created_at) >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND DATE(o.created_at) <= $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    // Get order items for each transaction
    const transactionsWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await db.query(
          `SELECT oi.*, mi.name 
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json(transactionsWithItems);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get transaction summary (admin)
router.get("/summary", checkauth, async (req, res) => {
  try {
    const { period = "today" } = req.query;
    
    let dateFilter = "CURRENT_DATE";
    if (period === "week") {
      dateFilter = "CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === "month") {
      dateFilter = "CURRENT_DATE - INTERVAL '30 days'";
    }

    const result = await db.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
      FROM orders 
      WHERE payment_status = 'paid'
      AND created_at >= ${dateFilter}
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching transaction summary:", err);
    res.status(500).json({ error: "Failed to fetch transaction summary" });
  }
});

// Get daily revenue (last 30 days)
router.get("/revenue/daily", checkauth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE payment_status = 'paid'
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching daily revenue:", err);
    res.status(500).json({ error: "Failed to fetch daily revenue" });
  }
});

// Get revenue by category
router.get("/revenue/by-category", checkauth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        mi.category,
        SUM(oi.subtotal) as revenue,
        SUM(oi.quantity) as items_sold,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
      GROUP BY mi.category
      ORDER BY revenue DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching revenue by category:", err);
    res.status(500).json({ error: "Failed to fetch revenue by category" });
  }
});

// Get popular items
router.get("/popular-items", checkauth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await db.query(`
      SELECT 
        mi.id,
        mi.name,
        mi.category,
        mi.image_url,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
      GROUP BY mi.id, mi.name, mi.category, mi.image_url
      ORDER BY total_sold DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching popular items:", err);
    res.status(500).json({ error: "Failed to fetch popular items" });
  }
});

export default router;
