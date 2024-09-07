import express from "express";

import commentController from "../controllers/commentController.js";
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
  .get(commentController.getAllComment)
  .post(
    checkBodyFieldsExistence(["description"]),
    commentController.createComment
  );

commentRouter
  .route("/:commentId")
  .get(commentController.getComment)
  .patch(
    checkBodyFieldsExistence(["description"]),
    isDocumentYours(commentModel, "commentId"),
    commentController.updateComment
  )
  .delete(
    isDocumentYours(commentModel, "commentId"),
    commentController.deleteComment
  );

export default commentRouter;
