import { z } from "zod";

const problemSchema = z.object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"])
});

export default problemSchema;