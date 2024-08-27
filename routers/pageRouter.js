import express from "express";
import verifyAccessToken from "../middlewares/authValidation/verifyAccessToken.js";
import validateObjectID from "../middlewares/globalValidation/validateObjectID.js";
import postRouter from "./postRouter.js";
import pageModel from "../models/pageModel.js";

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
} from "./../controllers/pageController.js";

import isDocumentExits from "../middlewares/globalValidation/isDocumentExists.js";
import isOwner from "../middlewares/pageValidation/isOwner.js";
import isUserInPendingAdminRequests from "../middlewares/pageValidation/isUserInPendingAdminRequests.js";
import checkBodyFieldsExistence from "../middlewares/globalValidation/checkBodyFieldsExistence.js";
import allowRoutes from "./../middlewares/allowRoutes.js";

const pageRouter = express.Router();

pageRouter.use(verifyAccessToken);

pageRouter.param("pageId", validateObjectID("pageId", "page"));
pageRouter.param("pageId", isDocumentExits(pageModel, "pageId", "page"));

// Nested router for handling posts related to the page
pageRouter.use(
  "/:pageId/posts",
  allowRoutes([
    { methods: ["GET"], path: "/" },
    { methods: ["GET"], path: "/:postId" },
    { path: "/:postId/likes" },
    { path: "/:postId/comments" },
  ]),
  postRouter
);

pageRouter.post(
  "/",
  checkBodyFieldsExistence(["name", "description"]),
  createPage
);

// Routes for page-level actions for users
pageRouter
  .get("/:pageId", getPageById)
  .patch("/:pageId/follow", followAndUnFollowPage);

// Route to edit a page - Only the owner can edit
pageRouter.patch("/:pageId/edit", isOwner, editPage);

// Routes for admin management
pageRouter.get("/:pageId/admins", getAdmins);

pageRouter.patch("/:pageId/request-admin", requestAndCancelRequestAdmin);

// Routes for managing admin requests
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
