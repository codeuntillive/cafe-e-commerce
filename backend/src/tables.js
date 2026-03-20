import express from "express";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import db from "./db.js";
import { checkauth } from "./auth.js";

const router = express.Router();

// Base URL for QR codes (configure for production)
const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

// Generate unique link
const generateUniqueLink = () => {
  return `table-${uuidv4().slice(0, 8)}`;
};

// Generate QR code as data URL
const generateQRCode = async (tableId) => {
  try {
    const table = await db.query(
      "SELECT * FROM restaurant_tables WHERE id = $1",
      [tableId]
    );
    if (table.rows.length === 0) return null;

    const link = `${BASE_URL}/table/${table.rows[0].unique_link}`;
    const qrCodeDataUrl = await QRCode.toDataURL(link, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    return qrCodeDataUrl;
  } catch (err) {
    console.error("Error generating QR code:", err);
    return null;
  }
};

// Get all tables (admin)
router.get("/", checkauth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM restaurant_tables ORDER BY table_number"
    );
    
    // Generate QR codes for each table
    const tablesWithQR = await Promise.all(
      result.rows.map(async (table) => {
        const qrCodeUrl = await generateQRCode(table.id);
        return { ...table, qr_code_url: qrCodeUrl };
      })
    );
    
    res.json(tablesWithQR);
  } catch (err) {
    console.error("Error fetching tables:", err);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
});

// Get all active tables (public - for display in customer view)
router.get("/active", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, table_number, capacity FROM restaurant_tables WHERE is_active = true ORDER BY table_number"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching active tables:", err);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
});

// Get single table by ID (admin)
router.get("/:id", checkauth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM restaurant_tables WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Table not found" });
    }
    const table = result.rows[0];
    const qrCodeUrl = await generateQRCode(table.id);
    res.json({ ...table, qr_code_url: qrCodeUrl });
  } catch (err) {
    console.error("Error fetching table:", err);
    res.status(500).json({ error: "Failed to fetch table" });
  }
});

// Customer access via QR link (public)
router.get("/link/:uniqueLink", async (req, res) => {
  try {
    const { uniqueLink } = req.params;
    const result = await db.query(
      "SELECT * FROM restaurant_tables WHERE unique_link = $1 AND is_active = true",
      [uniqueLink]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Table not found or inactive" });
    }
    
    const table = result.rows[0];
    // Get menu items for this table
    const menuResult = await db.query(
      "SELECT * FROM menu_items WHERE is_available = true ORDER BY category, name"
    );
    
    res.json({
      table: {
        id: table.id,
        table_number: table.table_number,
        capacity: table.capacity,
      },
      menu: menuResult.rows,
    });
  } catch (err) {
    console.error("Error fetching table link:", err);
    res.status(500).json({ error: "Failed to fetch table data" });
  }
});

// Create new table (admin)
router.post("/", checkauth, async (req, res) => {
  try {
    const { table_number, capacity } = req.body;

    if (!table_number) {
      return res.status(400).json({ error: "Table number is required" });
    }

    const unique_link = generateUniqueLink();

    const result = await db.query(
      `INSERT INTO restaurant_tables (table_number, unique_link, capacity)
       VALUES ($1, $2, $3) RETURNING *`,
      [table_number, unique_link, capacity ?? 4]
    );

    const table = result.rows[0];
    const qrCodeUrl = await generateQRCode(table.id);

    res.status(201).json({ ...table, qr_code_url: qrCodeUrl });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Table number already exists" });
    }
    console.error("Error creating table:", err);
    res.status(500).json({ error: "Failed to create table" });
  }
});

// Update table (admin)
router.put("/:id", checkauth, async (req, res) => {
  try {
    const { table_number, capacity, is_active } = req.body;
    const { id } = req.params;

    const result = await db.query(
      `UPDATE restaurant_tables 
       SET table_number = COALESCE($1, table_number),
           capacity = COALESCE($2, capacity),
           is_active = COALESCE($3, is_active)
       WHERE id = $4 RETURNING *`,
      [table_number, capacity, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Table not found" });
    }

    const table = result.rows[0];
    const qrCodeUrl = await generateQRCode(table.id);

    res.json({ ...table, qr_code_url: qrCodeUrl });
  } catch (err) {
    console.error("Error updating table:", err);
    res.status(500).json({ error: "Failed to update table" });
  }
});

// Delete table (admin)
router.delete("/:id", checkauth, async (req, res) => {
  try {
    // Check if table has pending orders
    const orderCheck = await db.query(
      "SELECT COUNT(*) FROM orders WHERE table_id = $1 AND status NOT IN ('completed', 'cancelled')",
      [req.params.id]
    );

    if (parseInt(orderCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: "Cannot delete table with active orders" 
      });
    }

    const result = await db.query(
      "DELETE FROM restaurant_tables WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Table not found" });
    }

    res.json({ message: "Table deleted successfully" });
  } catch (err) {
    console.error("Error deleting table:", err);
    res.status(500).json({ error: "Failed to delete table" });
  }
});

// Regenerate QR code for a table (admin)
router.post("/:id/qrcode", checkauth, async (req, res) => {
  try {
    const qrCodeUrl = await generateQRCode(req.params.id);
    if (!qrCodeUrl) {
      return res.status(404).json({ error: "Table not found" });
    }
    res.json({ qr_code_url: qrCodeUrl });
  } catch (err) {
    console.error("Error regenerating QR code:", err);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

export default router;
