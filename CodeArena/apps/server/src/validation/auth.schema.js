import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().trim().min(3).max(50),
    email: z.string().trim().pipe(z.email()),
    password: z.string().min(8).max(100)
});

export const loginSchema = z.object({
    identifier: z.string().trim().min(1),
    password: z.string().min(1)
});

export const verifyEmailSchema = z.object({
    email: z.string().trim().pipe(z.email()),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits")
});

export const googleRegistrationSchema = registerSchema.pick({
    username: true
});