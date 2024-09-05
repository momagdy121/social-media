import { Router } from "express";
import postRouter from "./postRouter.js";
import validateObjectID from "../middlewares/globalValidation/validateObjectID.js";
import verifyAccessToken from "./../middlewares/authValidation/verifyAccessToken.js";

import { verifyPassword } from "../middlewares/authValidation/auth.js";
import {
  getFriends,
  changePassword,
  checkUsername,
  getProfile,
  acceptRequest,
  rejectRequest,
  sendRequest,
  getPendingRequests,
  getUserById,
  usersSearch,
  editProfile,
} from "./../controllers/userController.js";
import allowRoutes from "../middlewares/allowRoutes.js";
import checkBodyFieldsExistence from "../middlewares/globalValidation/checkBodyFieldsExistence.js";
import isDocumentExists from "./../middlewares/globalValidation/isDocumentExists.js";
import userModel from "../models/userModel.js";

const userRouter = Router();

// Param Middleware for Validating userId
userRouter.param("userId", validateObjectID("userId", "user"));
userRouter.param("userId", isDocumentExists(userModel, "userId", "user"));

// Nested Routes for Posts
userRouter.use(
  "/:userId/posts",
  allowRoutes([
    { methods: ["GET"], path: "/" },
    { methods: ["GET"], path: "/:postId" },
    { path: "/:postId/likes" },
    { path: "/:postId/comments" },
  ]),
  verifyAccessToken,
  postRouter
);

// Public Routes
userRouter.get(
  "/username/check",
  checkBodyFieldsExistence(["username"]),
  checkUsername
);

// Authenticated Routes
userRouter.use(verifyAccessToken); // Apply Access Token Verification for routes below

// User Profile Management
userRouter.route("/profile").get(getProfile).patch(editProfile);

// User Search
userRouter.get("/search", usersSearch);

// Password Management
userRouter.patch(
  "/password/change",
  checkBodyFieldsExistence(["old", "new"]),
  verifyPassword,
  changePassword
);

// Friend Requests Management
userRouter.get("/pending-requests", getPendingRequests);
userRouter.get("/friends", getFriends);

userRouter
  .route("/:userId/request")
  .post(sendRequest)
  .patch("/reject", rejectRequest)
  .patch("/accept", acceptRequest);

// Get User by ID
userRouter.get("/:userId", getUserById);

// Admin/Owner Routes (if needed, uncomment and implement proper authorization)
// userRouter.get("/all-users", isAuthorized(rule.OWNER, rule.ADMIN), getAllUser);
// userRouter.patch("/:userId/change-rule", isAuthorized(rule.OWNER), changeRule);

export default userRouter;
