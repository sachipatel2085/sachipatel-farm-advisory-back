import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Not authorized",
    });
  }
};

export const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (error) {
    // Gracefully ignore token errors for optional protection
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized. Please login." });
  }

  if (req.user.role !== "admin" && req.user.role !== "moderator") {
    return res.status(403).json({
      message: "Access forbidden: Administrator or Moderator privileges required",
    });
  }

  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized. Please login." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access forbidden: Requires one of the following roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
