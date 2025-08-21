import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import connectDB from './config/DB.js';

const app = express();
connectDB();

import userRouter from "./modules/userModel/user.controller.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from 'cors';
import morgan from "morgan"; // logger middleware
import { rateLimit } from 'express-rate-limit';
import helmet from "helmet";
import messageRouter from "./modules/messageModel/message.controller.js";

export const bootstrap = () => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(cors());
    app.use(morgan("dev"))
    app.use(helmet({
        crossOriginResourcePolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginWindowPolicy: false,
        referrerPolicy: false,
        dnsPrefetchControl: false,
        expectCt: false,
        frameguard: false,
        hidePoweredBy: false,
        hsts: false,
        ieNoOpen: false,
        noSniff: false,
        permittedCrossDomainPolicies: false,
        xssFilter: false,
        contentSecurityPolicy: false,
    }))

    const limiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 mins
        limit: 15, // 15 requests in 5 mins
        message: {
            error: "Too many requests"
        },
        statusCode: 400,
        handler: (req, res, next) => {
            throw new Error("Too many requests", { cause: 400 })
        },
        legacyHeaders: true, // default false - thise shows rate limit in headers
        skipSuccessfulRequests: true // skips successful requests
    })
    app.use(limiter)

    app.use('/users', userRouter)
    app.use('/messages', messageRouter)
    app.use('/uploads', express.static('uploads'))

    app.use('{/*demo}', (req, res) => {
        res.send("Page not found")
    })
    app.use(errorHandler)


    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};