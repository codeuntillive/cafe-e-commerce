import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { sendOTPEmail } from "./controller/sendotp.js";
import db, { connectDB } from "./db.js";

dotenv.config();

// main
const router = express.Router();

// Initialize database connection and passport strategy
let isInitialized = false;

const initializeAuth = async () => {
  if (isInitialized) return;
  
  try {
    await connectDB();
    
    // Configure passport strategy after database is ready
    passport.use(new LocalStrategy(async function verify(username, password, cb) {
      try {
        const res = await db.query("SELECT * FROM users WHERE email=$1", [username]);
        if (res.rows.length === 0) {
          return cb(null, false, { message: "User not found" });
        }
        const user = res.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return cb(null, user);
        } else {
          return cb(null, false, { message: "Incorrect password" });
        }
      } catch (err) {
        return cb(err);
      }
    }));

    passport.serializeUser(function(user, cb) {
      cb(null, user.email);
    });

    passport.deserializeUser(async function(email, cb) {
      try {
        const res = await db.query("SELECT * FROM users WHERE email=$1", [email]);
        if (res.rows.length === 0) {
          return cb(null, false);
        }
        const user = res.rows[0];
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    });

    isInitialized = true;
    console.log("Auth module initialized");
  } catch (err) {
    console.error("Failed to initialize auth module:", err);
    throw err;
  }
};

// Middleware to ensure auth is initialized
const waitForInit = async (req, res, next) => {
  try {
    await initializeAuth();
    next();
  } catch (err) {
    console.error("Auth not ready:", err);
    res.status(503).send({ message: "Service temporarily unavailable. Please try again." });
  }
};

// Apply middleware to all routes
router.use(waitForInit);

// Login route
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (info && info.message) {
      return res.status(401).send(info.message);
    }

    if (err) {
      console.error('Authentication Error:', err);
      return res.status(500).send('Authentication error.');
    }
    if (!user) {
      return res.status(401).send(info.message || 'Authentication failed.');
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      console.log('User authenticated:', user.email);
      return res.status(200).send('Logged in successfully!');
    });
  })(req, res, next);
});

// Logout route
router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.send({ message: "Logged out successfully" });
  });
});

// Check if user is authenticated
router.get('/check-auth', function(req, res) {
  if (req.isAuthenticated()) {
    res.send({ authenticated: true });
  } else {
    res.send({ authenticated: false });
  }
});

// Registration route
router.post("/register", async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.send({ validate: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.send({ validate: false, message: "Password must be at least 6 characters" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.send({ validate: false, message: "Invalid email format" });
    }

    let userCheck = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userCheck.rows.length > 0) {
      return res.send({ validate: false, message: "User already exists" });
    }

    // Wait for hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Add expiry time => 2 minutes
    const otpExpiry = Date.now() + 2 * 60 * 1000;

    // Save in session
    req.session.data = {
      fullname,
      email,
      passwordHash: hashedPassword,
      otp,
      otpExpiry
    };

    const mess_otp = await sendOTPEmail(email, otp);

    if (mess_otp.messageId) {
      res.send({
        message: "OTP sent to email. Please verify to complete registration.",
        validate: true
      });
    } else {
      res.send({
        message: "Error sending OTP email.",
        validate: false,
        error: mess_otp
      });
    }

  } catch (err) {
    console.log(err);
    res.status(500).send({ validate: false, message: "Registration error" });
  }
});

// OTP verification route
router.post("/otp", async (req, res, next) => {
  const { otp } = req.body;

  if (!req.session.data) {
    return res.status(400).send({ validate: false, message: "No registration in progress" });
  }

  const { email, passwordHash, fullname, otp: sessionOtp, otpExpiry } = req.session.data;

  // Check expiry
  if (Date.now() > otpExpiry) {
    req.session.data = null;
    return res.status(410).send({ validate: false, message: "OTP has expired. Please register again." });
  }

  if (parseInt(otp) !== sessionOtp) {
    return res.status(401).send({ validate: false, message: "Invalid OTP" });
  }

  try {
    await db.query("INSERT INTO users (fullname, email, password, profilepic, role) VALUES ($1, $2, $3, $4, $5)", [
      fullname,
      email,
      passwordHash,
      null,
      'customer'
    ]);

    const newUser = { email: email, password: passwordHash };
    
    req.session.data = null;  // Clear temporary session

    req.logIn(newUser, (err) => {
      if (err) return next(err);

      console.log("User registered & logged in:", newUser);

      return res.status(201).send({
        validate: true,
        message: "Registration successful & user logged in",
        user: newUser
      });
    });

  } catch (err) {
    console.log(err);
    res.status(500).send({ validate: false, message: "Error during registration" });
  }
});

// Resend OTP route
router.post("/resend-otp", async (req, res) => {
  if (!req.session.data) {
    return res.status(400).send({ validate: false, message: "No registration in progress" });
  }
  
  const { email } = req.session.data;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiry = Date.now() + 2 * 60 * 1000;
  req.session.data.otp = otp;
  req.session.data.otpExpiry = otpExpiry;

  const mess_otp = await sendOTPEmail(email, otp);

  if (mess_otp) {
    res.send({
      message: "OTP resent successfully.",
      validate: true
    });
  } else {
    res.send({
      message: "Error sending OTP email.",
      validate: false,
      error: mess_otp
    });
  }
});

// Auth check middleware
const checkauth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.send({ validate: false, message: "User not logged in" });
  }
};

// Update profile route
router.post("/update-profile", checkauth, async (req, res) => {
  const { fullname } = req.body;
  const email = req.user.email;
  try {
    const result = await db.query(
      "UPDATE users SET fullname = $1, profilepic = $2 WHERE email = $3 RETURNING *",
      [fullname, null, email]
    );
    res.send({ validate: true, message: "Profile updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error updating profile" });
  }
});

// Get user data
router.get("/user", checkauth, async (req, res) => {
  try {
    const user = req.user;
    res.send({ validate: true, user: user });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error fetching user data" });
  }
});

// Check if user is admin
router.get("/is-admin", checkauth, async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === 'admin';
    res.send({ validate: true, isAdmin: isAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).send({ validate: false, message: "Error checking admin status" });
  }
});

// Export router
export default router;
export { checkauth };
