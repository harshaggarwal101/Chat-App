import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authMiddleware= async(req,res,next)=>{
    try{
        const token=req.cookies?.token;//optional chaining

        if(!token){
            return res.status(401).json({success:false,message:"not authenticated"});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        if(!decoded.id){
            return res.status(401).json({success:false,message:"invalid token"});
        }
        const user = await User.findById(decoded.id).select("-password");
         // exclude password
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        req.user=user;
        next();
    }
    catch(error){
        console.error("Auth Middleware Error",error);
        return res.status(401).json({success:false,message:"Authentication Failed"});
    }
    }
    export default authMiddleware;