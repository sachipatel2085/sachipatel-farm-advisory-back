import { z } from "zod";

const optionalNumber = (schema) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    schema,
  );

export const createFarmSchema = z.object({
  farmName: z
    .string()
    .trim()
    .min(2, "Farm name must be at least 2 characters")
    .max(100, "Farm name cannot exceed 100 characters"),

  totalArea: z.coerce
    .number()
    .positive("Total area must be greater than 0")
    .max(100000, "Invalid farm area"),

  location: z
    .object({
      village: z
        .string()
        .trim()
        .max(100, "Village name is too long")
        .optional(),

      district: z
        .string()
        .trim()
        .max(100, "District name is too long")
        .optional(),

      state: z.string().trim().max(100, "State name is too long").optional(),

      latitude: optionalNumber(
        z.coerce
          .number()
          .min(-90, "Invalid latitude")
          .max(90, "Invalid latitude"),
      ).optional(),

      longitude: optionalNumber(
        z.coerce
          .number()
          .min(-180, "Invalid longitude")
          .max(180, "Invalid longitude"),
      ).optional(),
    })
    .optional(),
});

export const updateFarmSchema = z.object({
  farmName: z
    .string()
    .trim()
    .min(2, "Farm name must be at least 2 characters")
    .max(100, "Farm name cannot exceed 100 characters")
    .optional(),

  totalArea: z.coerce
    .number()
    .positive("Total area must be greater than 0")
    .max(100000, "Invalid farm area")
    .optional(),

  location: z
    .object({
      village: z.string().trim().max(100).optional(),

      district: z.string().trim().max(100).optional(),

      state: z.string().trim().max(100).optional(),

      latitude: optionalNumber(z.coerce.number().min(-90).max(90)).optional(),

      longitude: optionalNumber(
        z.coerce.number().min(-180).max(180),
      ).optional(),
    })
    .optional(),
});
