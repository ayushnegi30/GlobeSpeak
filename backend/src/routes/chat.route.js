import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";
import { upsertStreamUser } from "../lib/stream.js";

const router = express.Router();

// 🟢 Get token for logged-in user
router.get("/token", protectRoute, getStreamToken);

// 🆕 Upsert target user for chat channel creation
router.post("/upsert-user", protectRoute, async (req, res) => {
  try {
    const { id, fullName, profilePic } = req.body;

    await upsertStreamUser({
      id,
      name: fullName || "Anonymous",
      image: profilePic || "https://ui-avatars.com/api/?name=User",
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error upserting user:", err);
    res.status(500).json({ error: "Failed to upsert user" });
  }
});

export default router;
