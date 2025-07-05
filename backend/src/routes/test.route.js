import express from "express";
import { sendMail } from "../lib/sendMail.js";

const router = express.Router();

router.post("/test-email", async (req, res) => {
  const { to } = req.body;

  const sent = await sendMail({
    to,
    subject: "Test Email from App",
    text: "This is a plain text test email.",
    html: "<h2>This is a test email</h2><p>From your app</p>",
  });

  if (sent) return res.status(200).json({ message: "Email sent successfully" });
  return res.status(500).json({ message: "Email failed to send" });
});

export default router;
