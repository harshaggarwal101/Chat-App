import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

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
import otpRoutes from "./routes/otpRoutes.js"
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

// Socket.io Setup
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5500",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
