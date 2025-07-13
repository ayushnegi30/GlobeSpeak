import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import avatarRoutes from "./routes/avatar.route.js";
import otpRoutes from "./routes/otp.route.js";
import { connectDB } from "./lib/db.js";

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve dirname
const __dirname = path.resolve();

// Connect to MongoDB
connectDB();

// ✅ Improved CORS config
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://globe-speak.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/avatar", avatarRoutes);

// Production static serving
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Test route
app.get("/", (req, res) => {
  res.send("GlobeSpeak backend is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
