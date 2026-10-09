import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyAccessToken(token);

        req.user = {
            id: decoded.sub,
            role: decoded.role
        };

        next();

    } catch (error) {
        throw new AppError("Invalid or expired token", 401);
    }
};

export default authMiddleware;