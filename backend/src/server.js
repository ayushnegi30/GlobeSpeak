import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./lib/db.js";
import avatarRoutes from "./routes/avatar.route.js";
import otpRoutes from "./routes/otp.route.js";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();
connectDB();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174","https://globe-speak.vercel.app"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/avatar", avatarRoutes);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  })
}


app.get("/", (req, res) => {
  res.send(" Vibely backend is running!");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
 
});

