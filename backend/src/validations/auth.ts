import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name must be at most 50 characters");

const emailSchema = z.string().trim().email("Invalid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

  export const SignupSchema = z.object({
  name: nameSchema,
  email: emailSchema, 
  password: passwordSchema,
});

export const SigninSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});