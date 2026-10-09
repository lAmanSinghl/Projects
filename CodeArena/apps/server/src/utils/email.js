
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your CodeArena verification code",
        text: `Your CodeArena verification code is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                <h2>Welcome to CodeArena!</h2>
                <p>Use the verification code below to complete your registration.</p>
                <h1 style="letter-spacing: 8px;">${otp}</h1>
                <p>This code expires in <strong>10 minutes</strong>.</p>
                <p>If you did not request this code, you can ignore this email.</p>
            </div>
        `
    });
};