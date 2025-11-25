import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5500",
    credentials: true
}));

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

// ------------------------
// SOCKET.IO SETUP
// ------------------------
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5500",
        credentials: true,
        methods: ["GET", "POST"]
    }
});

// Track online users: userId => socketId
const onlineUsers = new Map();

// Socket authentication middleware
io.use((socket, next) => {
    try {
        const rawCookie = socket.handshake.headers.cookie || "";
        const parsed = cookie.parse(rawCookie);
        const token = parsed.token;

        if (!token) {
            return next(new Error("Not authenticated"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;

        next();
    } catch (err) {
        console.error("Socket auth error:", err);
        next(new Error("Authentication error"));
    }
});

// Main socket connection
io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log("User connected:", userId);

    // Add user to online map
    onlineUsers.set(userId, socket.id);

    // Broadcast online users to all
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    // Handle disconnect
    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log("User disconnected:", userId);
    });
});

// Start Server
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
