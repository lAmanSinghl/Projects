import { z } from "zod";

const submissionSchema = z.object({
    problemId: z.coerce.number().int().positive(),
    sourceCode: z.string().min(1),
    language: z.string().trim().min(1).max(30),
    mode: z.enum(["run", "submit"]).default("submit")
});

export default submissionSchema;