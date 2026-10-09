import jwt from "jsonwebtoken";

const createAccessToken = (user) => {
    return jwt.sign(
        {
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            subject: user.id.toString(),
            expiresIn: "15m",
            algorithm: "HS256"
        }
    );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
            algorithms: ["HS256"]
        }
    );
};

export default createAccessToken;