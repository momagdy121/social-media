import express from "express";
import likeController from "../controllers/likeController.js";
import validateObjectId from "../middlewares/globalValidation/validateObjectID.js"; // To validate postId if used in the route

const likeRouter = express.Router({ mergeParams: true });

// Input validation middleware for postId if postId is part of the route parameters or query
likeRouter.use("/:postId", validateObjectId("postId", "post"));

// Route to handle liking/unliking a post and retrieving likes
likeRouter
  .route("/")
  .post(likeController.likeAndUnlike) // Controller to like or unlike a post
  .get(likeController.getLikes); // Controller to get all likes for a post

export default likeRouter;
