import express from "express";
import verifyAccessToken from "../middlewares/authValidation/verifyAccessToken.js";
import validateObjectId from "../middlewares/globalValidation/validateObjectID.js";
import multer from "../middlewares/multer.js";
import uploadImage from "../middlewares/uploadImage.js";
import likeRouter from "./likeRouter.js";
import commentRouter from "./commentRouter.js";
import isDocumentExists from "./../middlewares/globalValidation/isDocumentExists.js";

import postModel from "../models/postModel.js";
import checkBodyFieldsExistence from "../middlewares/globalValidation/checkBodyFieldsExistence.js";
import isDocumentYours from "./../middlewares/globalValidation/isDocumentYours.js";
import {
  createPost,
  deletePost,
  getFeedPosts,
  getPost,
  updatePost,
  getUserPosts,
} from "../controllers/postController.js";
import isPageAdmin from "../middlewares/pageValidation/isPageAdmin.js";

const postRouter = express.Router({ mergeParams: true });

postRouter.use(verifyAccessToken);

postRouter.param("postId", validateObjectId("postId", "post"));
postRouter.param("postId", isDocumentExists(postModel, "postId", "post"));
//NOTE: only nested routes are implemented for likes and comments

postRouter.use("/:postId/likes", likeRouter);
postRouter.use("/:postId/comments", commentRouter);

postRouter.get("/feed", getFeedPosts);

postRouter
  .route("/")
  .get(getUserPosts)
  .post(
    multer.single("image"),
    checkBodyFieldsExistence(["description"]),
    isPageAdmin, //NOTE:if there is page id in the url it will check if the user is an admin of the page
    uploadImage,
    createPost
  );

//NOTE: if there is no :userId in the url it will return the current user posts

postRouter
  .route("/:postId")
  .get(getPost)
  .patch(
    checkBodyFieldsExistence(["description"]),
    isDocumentYours(postModel, "postId"),
    updatePost
  )
  .delete(isDocumentYours(postModel, "postId"), deletePost);

export default postRouter;
