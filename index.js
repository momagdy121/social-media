//dependencies
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

import startServer from "./config/server.js";
import connectToDatabase from "./config/DB.js";
import globalErrorHandler from "./middlewares/globalErrorhandler.js";
import ApiError from "./Utils/apiError.js";

//routers
import authRouter from "./routers/authRouter.js";
import postRouter from "./routers/postRouter.js";
import userRouter from "./routers/userRouter.js";
import pageRouter from "./routers/pageRouter.js";

const app = express();

dotenv.config({ path: "./config.env" });

startServer(app);
connectToDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

//routers
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/pages", pageRouter);
app.use("/api/posts", postRouter);

app.all("*", (req, res, next) => {
  return next(new ApiError(`can't find ${req.url}`, 404));
});

app.use(globalErrorHandler);
