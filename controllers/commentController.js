import mongoose from "mongoose";
import commentModel from "../models/commentModel.js";
import { pagination } from "../Utils/queryProcesses.js";
import sendResponse from "../Utils/sendResponse.js";
import catchAsync from "./../Utils/catchAsync.js";

export const createComment = catchAsync(async (req, res, next) => {
  let postId = req.params.postId;
  postId = mongoose.Types.ObjectId(postId);

  const user = req.user;

  const comment = await commentModel.create({
    description: req.body.description,
    user: user._id,
    post: postId,
  });

  sendResponse(res, { code: 201, data: { comment } });
});
export const getComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  // Fetch the comment
  const comment = await commentModel.findById(commentId).populate({
    path: "user",
    select: "name username avatar _id",
  });

  sendResponse(res, { data: { comment } });
});

export const deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.commentId;

  // Delete the comment
  const comment = await commentModel.findByIdAndDelete(commentId);

  sendResponse(res, { data: { comment }, message: "comment deleted" });
});

export const updateComment = catchAsync(async (req, res) => {
  const commentId = req.params.commentId;
  // Update the comment
  const updatedComment = await commentModel.findByIdAndUpdate(
    commentId,
    { description: req.body.description },
    { new: true }
  );

  sendResponse(res, { data: { updatedComment } });
});

export const getAllComment = catchAsync(async (req, res) => {
  const { limit, skip, page } = pagination(req);

  const postId = mongoose.Types.ObjectId(req.params.postId);

  const comments = await commentModel
    .find({ post: postId })
    .select("-post -__v")
    .populate({
      path: "user",
      select: "name avatar _id username",
    })
    .lean()
    .skip(skip)
    .limit(limit);

  sendResponse(res, { data: { page, comments } });
});
