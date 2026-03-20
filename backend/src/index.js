import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import authRouter from "./auth.js";
import paymentRouter from "./payment.js";
import menuRouter from "./menu.js";
import tablesRouter from "./tables.js";
import ordersRouter from "./orders.js";
import transactionsRouter from "./transactions.js";
import { initDatabase } from "./db.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join admin room for order notifications
  socket.on("join-admin", () => {
    socket.join("admin");
    console.log("Admin client joined");
  });

  // Join specific table room for order status updates
  socket.on("join-table", (tableId) => {
    socket.join(`table-${tableId}`);
    console.log(`Client joined table-${tableId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "cache-control"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'the secret key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

const __dirname = path.resolve();

// API Routes
app.use("/api/auth", authRouter);
// app.use("/api/payment", paymentRouter);
app.use("/api/menu", menuRouter);
app.use("/api/tables", tablesRouter);
app.use("/api/orders", ordersRouter);
// app.use("/api/transactions", transactionsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;

// Initialize database before starting server
initDatabase()
  .then((success) => {
    if (success) {
      console.log("Database initialized successfully");
      httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log("Server is ready to accept connections");
      });
    } else {
      console.error("Failed to initialize database. Server not started.");
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

export default app;
