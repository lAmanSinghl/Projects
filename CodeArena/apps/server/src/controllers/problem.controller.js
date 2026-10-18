
import {
    getAllProblems,
    createProblem,
    getProblemBySlug,
    deleteProblemBySlug,
} from "../services/problem.service.js";

import {
    createTestCase,
    createTestCasesBulk,
    getPublicTestCases,
} from "../services/testCase.service.js";

import problemSchema from "../validation/problem.schema.js";
import testCaseSchema from "../validation/testCase.schema.js";
import bulkTestCasesSchema from "../validation/bulkTestCase.schema.js";

const validateRequestBody = (schema, body, res) => {
    const result = schema.safeParse(body);

    if (!result.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });

        return null;
    }

    return result.data;
};

export const getProblem = async (req, res) => {
    const problem = await getProblemBySlug(req.params.slug);

    res.status(200).json(problem);
};

export const createProblemController = async (req, res) => {
    const validatedData = validateRequestBody(
        problemSchema,
        req.body,
        res
    );

    if (!validatedData) return;

    const problem = await createProblem(validatedData);

    res.status(201).json(problem);
};

export const getProblems = async (req, res) => {
    const problems = await getAllProblems();

    res.status(200).json(problems);
};

export const deleteProblem = async (req, res) => {
    const problem = await deleteProblemBySlug(req.params.slug);

    res.status(200).json(problem);
};

export const createTestCaseController = async (req, res) => {
    const validatedData = validateRequestBody(
        testCaseSchema,
        req.body,
        res
    );

    if (!validatedData) return;

    const testCase = await createTestCase(
        req.params.slug,
        validatedData
    );

    res.status(201).json(testCase);
};

export const getTestCases = async (req, res) => {
    const testCases = await getPublicTestCases(req.params.slug);

    res.status(200).json(testCases);
};

export const createTestCasesBulkController = async (req, res) => {
    const validatedData = validateRequestBody(
        bulkTestCasesSchema,
        req.body,
        res
    );

    if (!validatedData) return;

    const result = await createTestCasesBulk(
        req.params.slug,
        validatedData.testCases
    );

    res.status(201).json({
        message: "Test cases created successfully",
        ...result,
    });
};
