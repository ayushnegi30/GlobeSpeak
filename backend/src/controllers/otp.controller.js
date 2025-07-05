import Otp from "../models/otp.model.js";
import { transporter } from "../utils/mailer.js";

// -------------------- Send OTP --------------------
export const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Valid for 5 minutes

  // Save OTP to MongoDB
  await Otp.findOneAndUpdate(
    { email },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  try {
    // Send OTP via email
    await transporter.sendMail({
      from: `"GlobeSpeak OTP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your GlobeSpeak OTP",
      text: `Your OTP is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>GlobeSpeak Verification Code</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 2px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    console.log(`✅ OTP for ${email}: ${otp}`);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// -------------------- Verify OTP --------------------
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const record = await Otp.findOne({ email });

  if (!record || record.otp !== otp || Date.now() > new Date(record.expiresAt).getTime()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await Otp.deleteOne({ email });

  return res.status(200).json({ message: "OTP verified successfully" });
};
