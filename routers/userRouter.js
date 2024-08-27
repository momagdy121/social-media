import { Router } from "express";
import rule from "../Utils/rules.js";
import postRouter from "./postRouter.js";
import validateObjectID from "../middlewares/globalValidation/validateObjectID.js";
import verifyAccessToken from "./../middlewares/authValidation/verifyAccessToken.js";

import {
  isAuthorized,
  verifyPassword,
} from "../middlewares/authValidation/auth.js";
import {
  getFriends,
  changePassword,
  changeRule,
  checkUsername,
  getAllUser,
  getProfile,
  acceptRequest,
  rejectRequest,
  sendRequest,
  getPendingRequests,
  getUserById,
  usersSearch,
} from "./../controllers/userController.js";
import allowRoutes from "../middlewares/allowRoutes.js";
import checkBodyFieldsExistence from "../middlewares/globalValidation/checkBodyFieldsExistence.js";
import isDocumentExists from "./../middlewares/globalValidation/isDocumentExists.js";
import userModel from "../models/userModel.js";

const userRouter = Router();

userRouter.param("userId", validateObjectID("userId", "user"));
userRouter.param("userId", isDocumentExists(userModel, "userId", "user"));

// NOTE: nested and separate routes are implemented for posts
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

//check if the user name is available or not to use
userRouter.get(
  "/username/check",
  checkBodyFieldsExistence(["username"]),
  checkUsername
);

userRouter.use(verifyAccessToken); //verify the access token

//get the data of the user
userRouter.get("/profile", getProfile);

userRouter.get("/search", usersSearch);

userRouter.patch(
  "/password/change",
  checkBodyFieldsExistence(["old", "new"]),
  verifyPassword,
  changePassword
);

//friend request
userRouter.get("/pending-requests", getPendingRequests);
userRouter.get("/friends", getFriends);

userRouter
  .post("/:userId/request", sendRequest)

  .patch("/:userId/request/reject", rejectRequest)
  .patch("/:userId/request/accept", acceptRequest);

userRouter.get("/:userId", getUserById);

//admin //owner

userRouter.get("/all-users", isAuthorized(rule.OWNER, rule.ADMIN), getAllUser);
userRouter.patch("/:userId/change-rule", isAuthorized(rule.OWNER), changeRule);

export default userRouter;
