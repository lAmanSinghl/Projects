import crypto from "crypto";

export const generateOtp = () => {
    return crypto
        .randomInt(100000, 1000000)
        .toString();
};

export const hashOtp = (otp) => {
    return crypto
        .createHmac("sha256", process.env.OTP_SECRET)
        .update(otp)
        .digest("hex");
};