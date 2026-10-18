
import { z } from "zod";

const supportedLanguages = [
    "javascript",
    "python",
    "cpp",
    "c",
    "java",
    "go",
    "rust",
];

const submissionSchema = z.object({
    problemId: z.coerce.number().int().positive(),
    sourceCode: z.string().min(1),
    language: z.enum(supportedLanguages),
}).strict();

export default submissionSchema;
