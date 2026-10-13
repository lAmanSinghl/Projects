
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

const functionConfigSchema = z.object({
    parameters: z.array(
        z.object({
            name: z.string().trim().min(1).max(100),
            type: z.string().trim().min(1).max(100),
        }).strict()
    ),
    returnType: z.string().trim().min(1).max(100),
}).strict();

const starterCodeSchema = z.record(
    z.string(),
    z.string().min(1)
).superRefine((templates, ctx) => {
    for (const language of supportedLanguages) {
        if (!templates[language]?.trim()) {
            ctx.addIssue({
                code: "custom",
                path: [language],
                message: `Starter code for ${language} is required`,
            });
        }
    }

    for (const language of Object.keys(templates)) {
        if (!supportedLanguages.includes(language)) {
            ctx.addIssue({
                code: "custom",
                path: [language],
                message: `Unsupported language: ${language}`,
            });
        }
    }
});

const problemSchema = z.object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    function_name: z.string().trim().min(1).max(100),
    function_config: functionConfigSchema,
    starter_code: starterCodeSchema,
}).strict();

export default problemSchema;
