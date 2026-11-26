import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
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

    const allowedAudiences = [
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
      process.env.GOOGLE_IOS_CLIENT_ID,
    ].filter(Boolean);

    // Verify Google ID token (supports Web, Android, and iOS OAuth client IDs)
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: allowedAudiences,
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
      if (!user.profileImage) {
        user.profileImage = picture;
      }
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

const formatSafeUser = (userDoc) => {
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  const hasPassword = Boolean(obj.password);
  delete obj.password;
  return {
    ...obj,
    hasPassword,
  };
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(formatSafeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, language, location, notifications } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email ? email.trim().toLowerCase() : null;
      if (normalizedEmail && normalizedEmail !== user.email) {
        const existingEmail = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });
        if (existingEmail) {
          return res.status(409).json({
            message: "This email address is already linked to another account",
          });
        }
        user.email = normalizedEmail;
      } else if (!normalizedEmail && user.authProvider === "local") {
        user.email = undefined;
      }
    }

    if (phone !== undefined) {
      const normalizedPhone = phone ? phone.trim() : null;
      if (normalizedPhone && normalizedPhone !== user.phone) {
        const existingPhone = await User.findOne({
          phone: normalizedPhone,
          _id: { $ne: user._id },
        });
        if (existingPhone) {
          return res.status(409).json({
            message: "This phone number is already registered with another account",
          });
        }
        user.phone = normalizedPhone;
      } else if (!normalizedPhone && user.authProvider === "google") {
        user.phone = undefined;
      }
    }

    if (language) {
      user.language = language;
    }

    if (location && typeof location === "object") {
      user.location = {
        village: location.village !== undefined ? location.village.trim() : user.location?.village || "",
        district: location.district !== undefined ? location.district.trim() : user.location?.district || "",
        state: location.state !== undefined ? location.state.trim() : user.location?.state || "",
      };
    }

    if (notifications && typeof notifications === "object") {
      user.notifications = {
        weatherAlerts:
          notifications.weatherAlerts !== undefined
            ? Boolean(notifications.weatherAlerts)
            : user.notifications?.weatherAlerts ?? true,
        diseaseAlerts:
          notifications.diseaseAlerts !== undefined
            ? Boolean(notifications.diseaseAlerts)
            : user.notifications?.diseaseAlerts ?? true,
        mandiAlerts:
          notifications.mandiAlerts !== undefined
            ? Boolean(notifications.mandiAlerts)
            : user.notifications?.mandiAlerts ?? true,
      };
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: formatSafeUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(409).json({
        message: `That ${field} is already used by another account`,
      });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const uploadProfileAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select an image file to upload" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old local uploaded avatar if present
    if (user.profileImage && user.profileImage.startsWith("/uploads/")) {
      const oldPath = path.resolve(`.${user.profileImage}`);
      fs.unlink(oldPath, () => {});
    }

    const normalizedPath = `/${req.file.path.replace(/\\/g, "/")}`;
    user.profileImage = normalizedPath;
    await user.save();

    res.json({
      message: "Profile photo updated successfully",
      profileImage: user.profileImage,
      user: formatSafeUser(user),
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Failed to upload profile photo" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to set a new password",
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        // Return 400 (not 401) so frontend axios interceptor does not clear the active session
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: user.authProvider === "google" && !currentPassword
        ? "Password set successfully. You can now also sign in with your password."
        : "Password updated successfully",
      hasPassword: true,
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};

export const updatePushToken = async (req, res) => {
  try {
    const { expoPushToken } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.expoPushToken = typeof expoPushToken === "string" && expoPushToken.trim()
      ? expoPushToken.trim()
      : null;
    await user.save();

    res.json({
      message: "Push notification token updated",
      expoPushToken: user.expoPushToken,
    });
  } catch (error) {
    console.error("Push token update error:", error);
    res.status(500).json({ message: "Failed to update push token" });
  }
};
