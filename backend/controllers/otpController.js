import Otp from "../models/otp.js";
import sendOtpEmail from "../utils/sendOTPEmail.js";

export const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.create({ email, otp });

        await sendOtpEmail(email, otp);

        res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error sending OTP" });
    }
};