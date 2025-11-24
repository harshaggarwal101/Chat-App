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

export default router;
