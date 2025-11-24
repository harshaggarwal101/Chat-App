import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {getAllUsers,searchUsers} from "../controllers/userController.js";

const router=express.Router();

router.get("/",authMiddleware,getAllUsers);
router.get("/search",authMiddleware,searchUsers);
export default router;