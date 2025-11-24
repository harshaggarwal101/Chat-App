import express from "express";
import { verifyOtpAndSignup,loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", verifyOtpAndSignup);
router.post("/login",loginUser);

export default router;
