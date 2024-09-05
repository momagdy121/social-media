import express from "express";
import { likeAndUnlike, getLikes } from "../controllers/likeController.js";
import verifyAccessToken from "../middlewares/authValidation/verifyAccessToken.js";
import validateObjectId from "../middlewares/globalValidation/validateObjectID.js"; // To validate postId if used in the route

const likeRouter = express.Router({ mergeParams: true });

// Ensure the user is authenticated for all like-related routes
likeRouter.use(verifyAccessToken);

// Input validation middleware for postId if postId is part of the route parameters or query
likeRouter.use("/:postId", validateObjectId("postId", "post"));

// Route to handle liking/unliking a post and retrieving likes
likeRouter
  .route("/")
  .post(likeAndUnlike) // Controller to like or unlike a post
  .get(getLikes); // Controller to get all likes for a post

export default likeRouter;
