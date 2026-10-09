import express from "express";
import cookieParser from "cookie-parser";

import problemRoutes from "./routes/problem.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import submissionRoutes from "./routes/submission.routes.js";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));


//Middleware
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/problems", problemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);

//Centeralized Error Handeling
app.use(errorHandler);

export default app;