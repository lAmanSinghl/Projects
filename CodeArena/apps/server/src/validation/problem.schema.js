
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



const createLanguageRecordSchema = (fieldName) =>
    z.record(
        z.string(),
        z.string().min(1)
    ).superRefine((templates, ctx) => {
        for (const language of supportedLanguages) {
            const template = templates[language];

            if (typeof template !== "string" || !template.trim()) {
                ctx.addIssue({
                    code: "custom",
                    path: [language],
                    message: `${fieldName} for ${language} is required`,
                });
                continue;
            }

            if (fieldName === "Language template") {
                const placeholder = "{{USER_SOLUTION}}";
                const occurrences = template.split(placeholder).length - 1;

                if (occurrences !== 1) {
                    ctx.addIssue({
                        code: "custom",
                        path: [language],
                        message:
                            `Template for ${language} must contain exactly one ` +
                            `${placeholder} placeholder`,
                    });
                }
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

const starterCodeSchema = createLanguageRecordSchema("Starter code");

const languageTemplatesSchema =
    createLanguageRecordSchema("Language template");

const problemSchema = z.object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    starter_code: starterCodeSchema,
    language_templates: languageTemplatesSchema,
}).strict();

export default problemSchema;
