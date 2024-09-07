import { Router } from "express";
import postRouter from "./postRouter.js";
import validateObjectID from "../middlewares/globalValidation/validateObjectID.js";
import authValidation from "../middlewares/authValidation/index.js";
import userController from "./../controllers/userController.js";
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

userRouter.use(authValidation.verifyAccessToken); //verify the access token

//get the data of the user
userRouter
  .route("/profile")
  .get(userController.getProfile)
  .patch(userController.editProfile);

userRouter.get("/search", userController.usersSearch);

userRouter.patch(
  "/password/change",
  checkBodyFieldsExistence(["old", "new"]),
  authValidation.verifyPassword,
  userController.changePassword
);

//friend request
userRouter.get("/pending-requests", userController.getPendingRequests);
userRouter.get("/friends", userController.getFriends);

userRouter
  .post("/:userId/request", userController.sendRequest)

  .patch("/:userId/request/reject", userController.rejectRequest)
  .patch("/:userId/request/accept", userController.acceptRequest);

userRouter.get("/:userId", userController.getUserById);

//admin //owner

// userRouter.get("/all-users", isAuthorized(rule.OWNER, rule.ADMIN), getAllUser);
// userRouter.patch("/:userId/change-rule", isAuthorized(rule.OWNER), changeRule);

export default userRouter;
