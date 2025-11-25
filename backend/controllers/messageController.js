import Message from "../models/message.js";

export const getMessages= async (req,res)=>{
    try{
        const conversationId=req.params.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversation: conversationId })
            .populate("sender", "name email _id")
            .populate("replyTo")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            messages: messages.reverse()
        });
    }
    catch(error){
        console.error("error fetching messages",error);
        res.status(500).json({success: false,message: "Failed to fetch messages"});
    }
};