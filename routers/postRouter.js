import express from "express";
import multer from "multer";
import verifyAccessToken from "../middlewares/authValidation/verifyAccessToken.js";
import validateObjectId from "../middlewares/globalValidation/validateObjectID.js";
import uploadImage from "../middlewares/uploadImage.js";
import likeRouter from "./likeRouter.js";
import commentRouter from "./commentRouter.js";
import isDocumentExists from "../middlewares/globalValidation/isDocumentExists.js";

import postModel from "../models/postModel.js";
import checkBodyFieldsExistence from "../middlewares/globalValidation/checkBodyFieldsExistence.js";
import isDocumentYours from "../middlewares/globalValidation/isDocumentYours.js";
import postController from "../controllers/postController.js";
import isPageAdmin from "../middlewares/pageValidation/isPageAdmin.js";

const postRouter = express.Router({ mergeParams: true });
const upload = multer();

// Ensure the user is authenticated for all routes
postRouter.use(verifyAccessToken);

// Validate `postId` parameter
postRouter.param("postId", validateObjectId("postId", "post"));
postRouter.param("postId", isDocumentExists(postModel, "postId", "post"));

// Nested routes for likes and comments
postRouter.use("/:postId/likes", likeRouter);
postRouter.use("/:postId/comments", commentRouter);

// Route to get the feed posts
postRouter.get("/feed", postController.getFeedPosts);

// Routes for user or page posts
postRouter
  .route("/")
  .get(postController.getUserOrPagePosts) // Return current user's posts if `:userId` is not provided
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    checkBodyFieldsExistence(["description"]),
    isPageAdmin, // Check if the user is an admin if `pageId` is present in the URL
    uploadImage,
    postController.createPost
  );

// Routes for specific post operations
postRouter
  .route("/:postId")
  .get(postController.getPost)
  .patch(
    checkBodyFieldsExistence(["description"]),
    isDocumentYours(postModel, "postId"), // Ensure the post belongs to the user
    postController.updatePost
  )
  .delete(
    isDocumentYours(postModel, "postId"), // Ensure the post belongs to the user
    postController.deletePost
  );

export default postRouter;
