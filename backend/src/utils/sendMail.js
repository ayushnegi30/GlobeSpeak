import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // 👈 This should be the ENV variable key, not the actual email
    pass: process.env.EMAIL_PASS, // 👈 Same here, use the key not the actual password
  },
});

export const sendOtpMail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP Code is: ${otp}</h2><p>This code will expire in 5 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};
