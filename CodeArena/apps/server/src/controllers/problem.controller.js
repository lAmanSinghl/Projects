import {
    getAllProblems,
    createProblem,
    getProblemBySlug,
    deleteProblemBySlug
} from "../services/problem.service.js";

import {
    createTestCase,
    getPublicTestCases
} from "../services/testCase.service.js";

import problemSchema from "../validation/problem.schema.js";
import testCaseSchema from "../validation/testCase.schema.js";

export const getProblem = async (req, res) => {
    const problem = await getProblemBySlug(req.params.slug);
    res.status(200).json(problem);
};

export const createProblemController = async (req, res) => {
    //Using Zod 
    const validatedData = problemSchema.parse(req.body);

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
    //Using Zod
    const validatedData = testCaseSchema.parse(req.body);

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