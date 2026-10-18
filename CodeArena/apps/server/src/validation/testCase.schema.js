
import { z } from "zod";

const testCaseSchema = z.object({
    input: z.string(),

    expected_output: z.string().refine(
        (value) => {
            try {
                JSON.parse(value);
                return true;
            } catch {
                return false;
            }
        },
        {
            message: "Expected output must be a valid JSON value",
        }
    ),

    is_hidden: z.boolean().default(true),
}).strict();

export default testCaseSchema;
