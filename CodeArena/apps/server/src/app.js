
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import problemRoutes from "./routes/problem.routes.js";
import authRoutes from "./routes/auth.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// CORS
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Routes
app.use("/api/problems", problemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);

// Centralized error handling — keep this last
app.use(errorHandler);

export default app;
