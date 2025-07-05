import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * @route   GET /api/avatar/:seed
 * @desc    Proxy avatar from multiavatar.com
 * @access  Public
 */
router.get("/:seed", async (req, res) => {
  try {
    const { seed } = req.params;
    const avatarUrl = `https://api.multiavatar.com/${encodeURIComponent(seed)}.svg`;

    const response = await axios.get(avatarUrl, {
      responseType: "text",
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(response.data);
  } catch (error) {
    console.error("Avatar generation error:", error.message);
    res.status(500).send("Failed to fetch avatar");
  }
});

export default router;
