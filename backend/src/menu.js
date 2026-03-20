import express from "express";
import db from "./db.js";
import { checkauth } from "./auth.js";

const router = express.Router();

// Get all menu items (public)
router.get("/", async (req, res) => {
  try {
    const { category, available } = req.query;
    let query = "SELECT * FROM menu_items WHERE 1=1";
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (available !== undefined) {
      params.push(available === "true");
      query += ` AND is_available = $${params.length}`;
    }

    query += " ORDER BY category, name";
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Get single menu item
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM menu_items WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching menu item:", err);
    res.status(500).json({ error: "Failed to fetch menu item" });
  }
});

// Add new menu item (admin only)
router.post("/", checkauth, async (req, res) => {
  try {
    const { name, description, price, category, image_url, is_available } =
      req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const result = await db.query(
      `INSERT INTO menu_items (name, description, price, category, image_url, is_available)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, price, category, image_url, is_available ?? true]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating menu item:", err);
    res.status(500).json({ error: "Failed to create menu item" });
  }
});

// Update menu item (admin only)
router.put("/:id", checkauth, async (req, res) => {
  try {
    const { name, description, price, category, image_url, is_available } =
      req.body;
    const { id } = req.params;

    const result = await db.query(
      `UPDATE menu_items 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           image_url = COALESCE($5, image_url),
           is_available = COALESCE($6, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, description, price, category, image_url, is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating menu item:", err);
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

// Delete menu item (admin only)
// Soft deletes if item is referenced in orders, hard deletes otherwise
router.delete("/:id", checkauth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item is referenced in any order_items
    const orderItemsCheck = await db.query(
      "SELECT COUNT(*) as count FROM order_items WHERE menu_item_id = $1",
      [id]
    );

    const orderCount = parseInt(orderItemsCheck.rows[0].count);

    if (orderCount > 0) {
      // Item has been ordered - soft delete by marking as unavailable
      const result = await db.query(
        "UPDATE menu_items SET is_available = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      return res.json({ 
        success: true,
        message: `Item has been ordered ${orderCount} time(s). Marked as unavailable instead of deleting to preserve order history.`,
        data: result.rows[0]
      });
    } else {
      // Item never ordered - safe to hard delete
      const result = await db.query(
        "DELETE FROM menu_items WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      return res.json({ 
        success: true,
        message: "Menu item permanently deleted."
      });
    }
  } catch (err) {
    console.error("Error deleting menu item:", err);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

// Get menu categories
router.get("/meta/categories", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT DISTINCT category FROM menu_items WHERE category IS NOT NULL"
    );
    res.json(result.rows.map((r) => r.category));
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
