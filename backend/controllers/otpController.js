import Otp from "../models/otp.js";
import sendOtpEmail from "../utils/sendOTPEmail.js";

export const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 🔥 Delete old OTPs for this email
        await Otp.deleteMany({ email });

        // 🔥 Store NEW OTP
        await Otp.create({ email, otp });

        // 🔥 Send email
        await sendOtpEmail(email, otp);

        res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        console.log("Send OTP Error:", error);
        res.status(500).json({ success: false, message: "Error sending OTP" });
    }
};
