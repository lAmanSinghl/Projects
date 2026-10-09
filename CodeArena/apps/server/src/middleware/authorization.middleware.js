import AppError from "../utils/AppError.js";

const requireAdmin = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        throw new AppError("Admin access required", 403);
    }
    next();
};

export default requireAdmin;