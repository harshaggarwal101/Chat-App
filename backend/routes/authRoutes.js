import express from "express";
import { verifyOtpAndSignup,loginUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendOtp } from "../controllers/otpController.js";

const router = express.Router();

router.post("/signup", sendOtp);
router.post("/verify-otp",verifyOtpAndSignup);
router.post("/login",loginUser);
router.get("/me",authMiddleware,(req,res)=>{
    res.json({
        success:true,
        user:req.user
    });
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
    });
    res.json({ success: true, message: "Logged out" });
});

export default router;
