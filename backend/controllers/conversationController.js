import Conversation from "../models/conversation.js";

export const createOrGetConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({ success: false, message: "otherUserId required" });
        }

        // 1. Check if conversation already exists
        let conversation = await Conversation.findOne({
            members: { $all: [userId, otherUserId] }
        }).populate("lastMessage");

        if (conversation) {
            return res.json({ success: true, conversation });
        }

        // 2. Create new conversation
        conversation = await Conversation.create({
            members: [userId, otherUserId]
        });

        return res.json({ success: true, conversation });
    } catch (err) {
        console.error("Error creating conversation:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getUserConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Find all conversations where the logged-in user is a member
        const conversations = await Conversation.find({
            members: userId
        })
            .populate("members", "name email _id")      // get other user details
            .populate("lastMessage")                    // get last message
            .sort({ updatedAt: -1 });                   // newest first

        res.json({
            success: true,
            conversations
        });

    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch conversations"
        });
    }
};

