import z from "zod";

export const registerSchema = z.object({
    name: z.string().min(3,"name must be at least 3 characters long"),
    email: z.string().email("invalid email"),
    password: z.string().min(6).max(20,"password must be at least 6 characters long"),
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(20)
})