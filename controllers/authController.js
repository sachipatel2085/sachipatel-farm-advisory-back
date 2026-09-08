import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "60m",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, phone, password, language, location } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "Name, phone and password are required",
      });
    }

    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      phone,
      password,
      language,
      location,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone and password are required",
      });
    }

    const user = await User.findOne({ phone }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid phone or password",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    console.log("Google credential received:", !!credential);

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log("Google payload:", payload);

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        message: "Google email is not verified",
      });
    }

    // Find existing user by Google ID OR email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    // Existing user
    if (user) {
      user.googleId = googleId;
      user.email = email;
      user.profileImage = picture;
      user.authProvider = "google";

      await user.save();
    }

    // New Google user
    else {
      user = await User.create({
        name,
        email,
        googleId,
        profileImage: picture,
        authProvider: "google",
        role: "farmer",
      });
    }

    // Use SAME JWT format as normal login
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Google login successful",

      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      profileImage: user.profileImage,

      token,
    });
  } catch (error) {
    console.error("=================================");
    console.error("GOOGLE LOGIN ERROR:");
    console.error(error);
    console.error("MESSAGE:", error.message);
    console.error("=================================");

    return res.status(401).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
};
