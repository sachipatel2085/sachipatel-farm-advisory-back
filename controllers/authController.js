import User from "../models/User.js";
import jwt from "jsonwebtoken";

/* Generate JWT */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password, language, location } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      phone,
      email,
      password,
      language,
      location
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};