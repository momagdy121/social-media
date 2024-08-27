import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import { pagination } from "../Utils/queryProcesses.js";
import mongoose from "mongoose";
import { includeUserPipeline, isLiked } from "../Utils/Pipelines.js";
import sendResponse from "../Utils/sendResponse.js";
import catchAsync from "../Utils/catchAsync.js";
import likeModel from "./../models/likeModel.js";

export const createPost = catchAsync(async (req, res, next) => {
  const user = req.user;
  const image = res.locals.url || null;
  const { description } = req.body;
  const { pageId } = req.params || null; // Extracting pageId from the URL params if it exists

  const post = await postModel.create({
    user: user._id,
    description,
    image,
    page: pageId ? mongoose.Types.ObjectId(pageId) : null,
  });

  sendResponse(res, { data: { post } });
});

export const getPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  let post = await postModel.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(postId) },
    },
    ...includeUserPipeline, // Include user data dynamically
  ]);

  const isLiked = await likeModel.exists({
    user: req.user._id,
    post: mongoose.Types.ObjectId(postId),
  });

  sendResponse(res, {
    data: { post: { ...post[0], isLiked: !!isLiked } },
  });
});

export const getFeedPosts = catchAsync(async (req, res) => {
  const user = req.user;

  const { skip, limit, page } = pagination(req);

  //find posts where post.user in user.friends and in the user._id
  const posts = await postModel
    .aggregate([
      {
        $match: {
          $or: [{ user: { $in: user.friends } }, { user: user._id }],
        },
      },
      ...includeUserPipeline,
      ...isLiked(req.user._id),
    ])
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  sendResponse(res, { data: { page, posts } });
});

export const getUserPosts = catchAsync(async (req, res) => {
  const { skip, limit, page } = pagination(req);

  const userID = mongoose.Types.ObjectId(req.params.userId || req.user._id);

  const user = await userModel
    .findOne({ _id: userID })
    .select("name username avatar _id")
    .lean();

  // Query posts by user ID
  const posts = await postModel
    .aggregate([{ $match: { user: userID } }])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendResponse(res, { data: { user, page, posts } });
});

export const updatePost = catchAsync(async (req, res) => {
  let { postId } = req.params;
  const { description } = req.body;

  postId = mongoose.Types.ObjectId(postId);

  const post = await postModel.findByIdAndUpdate(
    postId,
    { description, isEdited: true },
    { new: true }
  );

  sendResponse(res, {
    message: "post updated",
    data: { post },
  });
});

export const deletePost = catchAsync(async (req, res) => {
  let { id } = req.params;

  id = mongoose.Types.ObjectId(id);
  const post = await postModel.findByIdAndDelete(id);

  //remove from posts collection
  sendResponse(res, { message: "post deleted successfully", data: { post } });
});
