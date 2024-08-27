import express from "express";

import {
  getAllComment,
  createComment,
  deleteComment,
  getComment,
  updateComment,
} from "../controllers/commentController.js";
import checkBodyFieldsExistence from "../middlewares/globalValidation/checkBodyFieldsExistence.js";
import isDocumentExists from "../middlewares/globalValidation/isDocumentExists.js";
import isDocumentYours from "../middlewares/globalValidation/isDocumentYours.js";
import validateObjectID from "../middlewares/globalValidation/validateObjectID.js";
import commentModel from "../models/commentModel.js";

const commentRouter = express.Router({ mergeParams: true });

commentRouter.param("commentId", validateObjectID("commentId", "comment"));

commentRouter.param(
  "commentId",
  isDocumentExists(commentModel, "commentId", "comment")
);

commentRouter
  .route("/")
  .get(getAllComment)
  .post(checkBodyFieldsExistence(["description"]), createComment);

commentRouter
  .route("/:commentId")
  .get(getComment)
  .patch(
    checkBodyFieldsExistence(["description"]),
    isDocumentYours(commentModel, "commentId"),
    updateComment
  )
  .delete(isDocumentYours(commentModel, "commentId"), deleteComment);

export default commentRouter;
