import express from "express";
import multer from "multer";

import verifyAccessToken from "../middlewares/authValidation/verifyAccessToken.js";
import validateObjectID from "../middlewares/globalValidation/validateObjectID.js";
import postRouter from "./postRouter.js";
import pageModel from "../models/pageModel.js";
import isDocumentExits from "../middlewares/globalValidation/isDocumentExists.js";
import isOwner from "../middlewares/pageValidation/isOwner.js";
import isUserInPendingAdminRequests from "../middlewares/pageValidation/isUserInPendingAdminRequests.js";
import checkBodyFieldsExistence from "../middlewares/globalValidation/checkBodyFieldsExistence.js";
import allowRoutes from "./../middlewares/allowRoutes.js";
import uploadImage from "./../middlewares/uploadImage.js";
import {
  acceptAdmin,
  createPage,
  followAndUnFollowPage,
  getPageById,
  getAdmins,
  requestAndCancelRequestAdmin,
  getPendingAdminRequests,
  rejectAdminRequest,
  removeFromAdmin,
  editPage,
  getFollowers,
  searchPages,
} from "./../controllers/pageController.js";

const pageRouter = express.Router();
const upload = multer();

pageRouter.use(verifyAccessToken);

pageRouter.param("pageId", validateObjectID("pageId", "page"));
pageRouter.param("pageId", isDocumentExits(pageModel, "pageId", "page"));

// Nested router for handling posts related to the page
pageRouter.use(
  "/:pageId/posts",
  allowRoutes([
    { path: "/" },
    { path: "/:postId" },
    { path: "/:postId/likes" },
    { path: "/:postId/comments" },
  ]),
  postRouter
);

pageRouter.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  checkBodyFieldsExistence(["name", "description"]),
  uploadImage, //cloudinary
  createPage
);

pageRouter.get("/search", searchPages);

pageRouter
  .get("/:pageId", getPageById)
  .patch("/:pageId/follow", followAndUnFollowPage)
  .get("/:pageId/followers", getFollowers);

pageRouter.patch("/:pageId", isOwner, editPage);

//admins stuff
pageRouter.get("/:pageId/admins", getAdmins);

pageRouter.patch("/:pageId/admin/request", requestAndCancelRequestAdmin);

pageRouter
  .get("/:pageId/admin/pending", isOwner, getPendingAdminRequests)
  .patch(
    "/:pageId/admin/accept",
    isOwner,
    isUserInPendingAdminRequests,
    acceptAdmin
  )
  .patch(
    "/:pageId/admin/reject",
    isOwner,
    isUserInPendingAdminRequests,
    rejectAdminRequest
  )
  .patch("/:pageId/admin/remove", isOwner, removeFromAdmin);

export default pageRouter;
