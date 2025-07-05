import { upsertStreamUser } from "../lib/stream.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/otp.model.js";

// ------------------- SIGNUP -------------------
export async function signup(req, res) {
  const { email, password, fullName, otp } = req.body;

  try {
    if (!email || !password || !fullName || !otp) {
      return res.status(400).json({ message: "All fields are required including OTP" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a different one" });
    }

    // ✅ Check OTP
    const otpRecord = await Otp.findOne({ email });

    if (
      !otpRecord ||
      otpRecord.otp !== otp ||
      new Date() > otpRecord.expiresAt
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ Delete OTP after verification
    await Otp.deleteOne({ email });

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
// ------------------- LOGIN -------------------
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || "",
      });
      console.log(`Stream user created for ${user.fullName}`);
    } catch (error) {
      console.log("Error creating stream user:", error);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        language: user.language,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ------------------- LOGOUT -------------------
export async function logout(req, res) {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
}

// ------------------- ONBOARD -------------------
export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, language, location, profilePic } = req.body;

    if (!fullName || !bio || !language || !location || !profilePic) {
      return res.status(400).json({
        message: "Please fill all fields",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !language && "language",
          !location && "location",
          !profilePic && "profilePic",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        language,
        location,
        profilePic,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic,
      });
      console.log(`✅ Stream user updated for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("⚠️ Stream update error:", streamError.message);
    }

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("❌ Onboard error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ------------------- GET AUTH USER -------------------
export async function getAuthUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      "fullName email profilePic language isOnboarded"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching auth user:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
