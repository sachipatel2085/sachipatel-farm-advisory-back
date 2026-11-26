import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),

  language: z.enum(["gujarati", "hindi", "english"]).optional(),

  location: z
    .object({
      village: z.string().trim().max(100).optional(),
      district: z.string().trim().max(100).optional(),
      state: z.string().trim().max(100).optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid phone number"),

  password: z.string().min(1, "Password is required").max(72),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .union([
      z.string().trim().email("Enter a valid email address").max(150),
      z.literal(""),
      z.null(),
    ])
    .optional(),

  phone: z
    .union([
      z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
      z.literal(""),
      z.null(),
    ])
    .optional(),

  language: z.enum(["gujarati", "hindi", "english", "marathi"]).optional(),

  location: z
    .object({
      village: z.string().trim().max(100).optional(),
      district: z.string().trim().max(100).optional(),
      state: z.string().trim().max(100).optional(),
    })
    .optional(),

  notifications: z
    .object({
      weatherAlerts: z.boolean().optional(),
      diseaseAlerts: z.boolean().optional(),
      mandiAlerts: z.boolean().optional(),
    })
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().max(72).optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(72, "Password cannot exceed 72 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password").max(72),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });
