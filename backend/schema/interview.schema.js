import z from "zod";

export const interviewSchema = z.object({
    topic: z.string().min(3).max(100),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
});