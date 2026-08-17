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
