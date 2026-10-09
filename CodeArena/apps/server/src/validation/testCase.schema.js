import { z } from "zod";

const testCaseSchema = z.object({
    input: z.string(),
    expected_output: z.string(),
    is_hidden: z.boolean().default(true)
});

export default testCaseSchema;