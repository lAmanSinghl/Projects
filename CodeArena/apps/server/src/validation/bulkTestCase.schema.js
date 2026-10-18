
import { z } from "zod";
import testCaseSchema from "./testCase.schema.js";

const bulkTestCasesSchema = z.object({
    testCases: z
        .array(testCaseSchema)
        .min(1, "At least one test case is required")
        .max(500, "A maximum of 500 test cases can be uploaded at once"),
}).strict();

export default bulkTestCasesSchema;
