import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import { pagination } from "../Utils/queryProcesses.js";
import mongoose from "mongoose";
import {
  isLiked,
  includeUserAndPagePipeline,
  removePageAndUserPipeline,
} from "../Pipelines/PostPipelines.js";
import sendResponse from "../Utils/sendResponse.js";
import catchAsync from "../Utils/catchAsync.js";
import pageModel from "../models/pageModel.js";

export const createPost = catchAsync(async (req, res, next) => {
  const user = req.user;
  const image = res.locals.uploadedFiles[0]?.url || null;
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
    ...includeUserAndPagePipeline,
    ...isLiked(req.user._id),
  ]);

  sendResponse(res, {
    data: { post: { ...post[0] } },
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
      ...includeUserAndPagePipeline,
      ...isLiked(req.user._id),
    ])
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  sendResponse(res, { data: { page, posts } });
});

export const getUserOrPagePosts = catchAsync(async (req, res) => {
  const { skip, limit, page } = pagination(req);
  if (req.params.userId) {
    const userID = mongoose.Types.ObjectId(req.params.userId || req.user._id);

    const user = await userModel
      .findOne({ _id: userID })
      .select("name username avatar _id")
      .lean();

    // Query posts by user ID
    const posts = await postModel
      .aggregate([
        { $match: { user: userID, page: null } },
        ...isLiked(req.user._id),
        ...removePageAndUserPipeline,
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, { data: { user, page, posts } });
  } else {
    const pageID = mongoose.Types.ObjectId(req.params.pageId);

    const page = await pageModel
      .findOne({ _id: pageID })
      .select("name image _id")
      .lean();

    // Query posts by page ID
    const posts = await postModel
      .aggregate([
        { $match: { page: pageID } },
        ...isLiked(req.user._id),
        ...removePageAndUserPipeline,
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    sendResponse(res, { data: { page, posts } });
  }
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
