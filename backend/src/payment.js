import { Router } from "express";
import pg from "pg"
import dotenv from "dotenv";

dotenv.config();

const router = Router();
// setup menu database
const db=new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Initialize razorpay only if credentials are provided
let razorpayInstance = null;
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (razorpayKeyId && razorpayKeySecret && 
    razorpayKeyId !== 'enter your ID' && 
    razorpayKeySecret !== 'enter your secret key') {
  try {
    const Razorpay = (await import("razorpay")).default;
    razorpayInstance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });
    console.log("Razorpay initialized successfully");
  } catch (err) {
    console.warn("Failed to initialize Razorpay:", err.message);
  }
} else {
  console.warn("Razorpay credentials not configured. Payment features will be disabled.");
}


// routes
router.get("/", (req, res) => {
    res.send("payment")
})
router.post("/billing", async (req, res) => {
  try {
    // Check if Razorpay is initialized
    if (!razorpayInstance) {
      return res.status(503).json({ error: "Payment service not configured. Please contact administrator." });
    }

    let { items } = req.query;


    if (typeof items === "string") {
      items = items.split(",").map(Number);
    }


    const results = await Promise.all(
      items.map(item =>
        db.query("SELECT price FROM menu_items WHERE id=$1", [item])
      )
    );


    const totalAmount = results.reduce(
      (sum, r) => sum + Number(r.rows[0]?.price || 0),
      0
    );

   
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Billing failed" });
  }
});
router.post("/verify", async (req, res) => {
  try {
    // Check if Razorpay is initialized
    if (!razorpayInstance) {
      return res.status(503).json({ error: "Payment service not configured. Please contact administrator." });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const options = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };

    const response = await razorpayInstance.orders.verify(options);

    if (response) {
        db.query("INSERT INTO orders (order_id, payment_id) VALUES ($1, $2)", [razorpay_order_id, razorpay_payment_id]);
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});




export default router;
export { razorpayInstance };