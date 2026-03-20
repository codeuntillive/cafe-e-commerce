import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
export const sendOTPEmail = async (to, otp) => {
    try {
        if (!to) throw new Error("Recipient email is required");
        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.opt_user,
                pass: process.env.otp_token,
            }
        })
        const info = await transporter.sendMail({
            from: '"Aditya Gautam" ',
            to: to,
            subject: "OTP Verification",
            text: "otp verification",
            html: `<b>Your OTP is: ${otp}</b>`,

        });
        return { messageId: info.messageId };
    }catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
    
}