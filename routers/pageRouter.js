import express from "express";
import multer from "multer";
import verifyAccessToken from "../middlewares/authValidation/verifyAccessToken.js";
import validateObjectID from "../middlewares/globalValidation/validateObjectID.js";
import postRouter from "./postRouter.js";
import pageModel from "../models/pageModel.js";
import isDocumentExits from "../middlewares/globalValidation/isDocumentExists.js";
import checkBodyFieldsExistence from "../middlewares/globalValidation/checkBodyFieldsExistence.js";
import allowRoutes from "./../middlewares/allowRoutes.js";
import uploadImage from "./../middlewares/uploadImage.js";
import pageController from "./../controllers/pageController.js";
import pageValidation from "./../middlewares/pageValidation/index.js";

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
  pageController.createPage
);

pageRouter.get("/search", pageController.searchPages);

pageRouter
  .get("/:pageId", pageController.getPageById)
  .patch("/:pageId/follow", pageController.followAndUnFollowPage)
  .get("/:pageId/followers", pageController.getFollowers);

pageRouter.patch("/:pageId", pageValidation.isOwner, pageController.editPage);

//admins stuff
pageRouter.get("/:pageId/admins", pageController.getAdmins);

pageRouter.patch(
  "/:pageId/admin/request",
  pageController.requestAndCancelRequestAdmin
);

pageRouter
  .get(
    "/:pageId/admin/pending",
    pageValidation.isOwner,
    pageController.getPendingAdminRequests
  )
  .patch(
    "/:pageId/admin/accept",
    pageValidation.isOwner,
    pageValidation.isUserInPendingAdminRequests,
    pageController.acceptAdmin
  )
  .patch(
    "/:pageId/admin/reject",
    pageValidation.isOwner,
    pageValidation.isUserInPendingAdminRequests,
    pageController.rejectAdminRequest
  )
  .patch(
    "/:pageId/admin/remove",
    pageValidation.isOwner,
    pageController.removeFromAdmin
  );

export default pageRouter;
