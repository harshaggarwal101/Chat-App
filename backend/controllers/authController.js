import User from "../models/user.js";
import Otp from "../models/otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const verifyOtpAndSignup = async (req, res) => {
    console.log("Signup API called");
    const { name, email, password, otp } = req.body;

    try {
        console.log("Fetching OTP record...");
        const otpRecord = await Otp.findOne({ email });

        console.log("OTP SENT BY USER:", otp);
        console.log("OTP STORED IN DB:", otpRecord?.otp);

        if (!otpRecord) {
            console.log("No OTP found");
            return res.status(400).json({ success: false, message: "OTP expired or not found" });
        }

        if (otpRecord.otp !== otp) {
            console.log("OTP mismatch");
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        if (await User.findOne({ email })) {
            return res.status(400).json({
            success: false,
            message: "Email already registered. Please login."
            });
        }
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Creating user...");
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        console.log("User created:", newUser);

        console.log("Deleting OTP...");
        await Otp.deleteMany({ email });

        console.log("Sending response...");
        return res.json({ success: true, message: "Signup successful" });

    } catch (error) {
        console.log("ERROR CAUGHT:", error);
        return res.status(500).json({ success: false, message: "Error verifying OTP" });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log("Login API called");                // DEBUG 1
    console.log("Request body:", req.body);         // DEBUG 2

    try {
        console.log("Checking user...");            // DEBUG 3
        const user = await User.findOne({ email });
        console.log("User found:", user);           // DEBUG 4

        if (!user) {
            console.log("User not found");          // DEBUG 5
            return res.status(400).json({ success: false, message: "User not found" });
        }

        console.log("Comparing password...");       // DEBUG 6
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);    // DEBUG 7

        if (!isMatch) {
            console.log("Password wrong");          // DEBUG 8
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        console.log("Generating JWT...");           // DEBUG 9
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        console.log("Sending cookie...");           // DEBUG 10
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log("Sending success response..."); // DEBUG 11
        return res.json({
            success: true,
            message: "Login successful",
            user: {
                name: user.name,
                email: user.email,
                id: user._id,
            },
        });

    } catch (error) {
        console.log("LOGIN ERROR:", error);         // DEBUG 12
        return res.status(500).json({ success: false, message: "Login failed" });
    }
};
