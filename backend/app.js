import express from "express";
import dotenv from "dotenv";
import { auth_router } from "./route/auth.route.js";
import { interview_router } from "./route/interview.route.js";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";

// Configurations
dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "*"
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/test', (req, res) => {
    res.send('test route working');
});

app.use('/auth', auth_router);
app.use('/interview', interview_router);


export { httpServer, app };