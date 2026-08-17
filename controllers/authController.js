import User from "../models/User.js";
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
