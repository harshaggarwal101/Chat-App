import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import Message from "./models/message.js";
import Conversation from "./models/conversation.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost",
        "http://localhost:5500",
        "http://127.0.0.1",
        "http://127.0.0.1:5500"
    ],
    credentials: true
}));

// REST API Routes
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Socket.io Setup
const io = new Server(httpServer, {
    cors: {
        origin: [
        "http://localhost",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
        credentials: true,
        methods: ["GET", "POST"]
    }
});

// Track online users: userId => socketId
const onlineUsers = new Map();

// Socket authentication
io.use((socket, next) => {
    try {
        const rawCookie = socket.handshake.headers.cookie || "";
        const parsed = cookie.parse(rawCookie);
        const token = parsed.token;

        if (!token) return next(new Error("Not authenticated"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;

        next();
    } catch (err) {
        next(new Error("Socket authentication failed"));
    }
});

// Real-time connections
io.on("connection", (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    // Real-time message sending
    socket.on("sendMessage", async ({ conversationId, text, replyTo }) => {
        try {
            const senderId = socket.userId;

            const newMessage = await Message.create({
                conversation: conversationId,
                sender: senderId,
                text,
                replyTo,
                readBy: [senderId]
            });

            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id,
                updatedAt: new Date()
            });

            const conversation = await Conversation.findById(conversationId);

            for (const memberId of conversation.members) {
                const sid = onlineUsers.get(memberId.toString());
                if (sid && memberId.toString() !== senderId.toString()) {
                    io.to(sid).emit("receiveMessage", newMessage);
                }
            }

            socket.emit("messageSent", newMessage);

        } catch (err) {
            console.error("sendMessage error:", err);
        }
    });

    // Read receipts
    socket.on("markAsRead", async ({ conversationId }) => {
        try {
            const userId = socket.userId;

            await Message.updateMany(
                { conversation: conversationId, readBy: { $ne: userId } },
                { $push: { readBy: userId } }
            );

            const conversation = await Conversation.findById(conversationId);

            for (const memberId of conversation.members) {
                const sid = onlineUsers.get(memberId.toString());
                if (sid) {
                    io.to(sid).emit("messagesRead", {
                        conversationId,
                        readerId: userId
                    });
                }
            }

        } catch (err) {
            console.error("markAsRead error:", err);
        }
    });

    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
});

// Start server
const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
