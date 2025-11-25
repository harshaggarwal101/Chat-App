import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createOrGetConversation,getUserConversations } from "../controllers/conversationController.js";

const router = express.Router();

router.post("/",authMiddleware,createOrGetConversation);
router.get("/",authMiddleware,getUserConversations);

export default router;