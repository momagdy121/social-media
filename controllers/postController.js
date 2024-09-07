import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import { pagination } from "../utils/queryProcesses.js";
import mongoose from "mongoose";
import {
  isLiked,
  includeUserAndPagePipeline,
  removePageAndUserPipeline,
  feedsPipeline,
} from "../pipelines/PostPipelines.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import pageModel from "../models/pageModel.js";

const createPost = catchAsync(async (req, res, next) => {
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

const getPost = catchAsync(async (req, res, next) => {
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

const getFeedPosts = catchAsync(async (req, res) => {
  const user = req.user;

  const { skip, limit, page } = pagination(req);

  //find posts where post.user in user.friends and in the user._id
  const posts = await postModel
    .aggregate([
      ...feedsPipeline(user),
      ...includeUserAndPagePipeline,
      ...isLiked(user._id),
    ])
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  sendResponse(res, { data: { page, posts } });
});

const getUserOrPagePosts = catchAsync(async (req, res) => {
  const { skip, limit, page } = pagination(req);

  const entityID = mongoose.Types.ObjectId(
    req.params.userId || req.params.pageId
  );
  const isUser = Boolean(req.params.userId);

  // Fetch the entity (either user or page)
  const entity = isUser
    ? await userModel.findOne({ _id: entityID }).selectBasicInfo().lean()
    : await pageModel
        .findOne({ _id: entityID })
        .select("name image _id")
        .lean();

  // Define the match condition based on whether the entity is a user or a page
  const matchCondition = isUser
    ? { user: entityID, page: null }
    : { page: entityID };

  // Query posts by the user or page ID
  const posts = await postModel
    .aggregate([
      { $match: matchCondition },
      ...isLiked(req.user._id),
      ...removePageAndUserPipeline,
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendResponse(res, {
    data: {
      page,
      [isUser ? "user" : "page"]: entity,
      posts,
    },
  });
});

const updatePost = catchAsync(async (req, res) => {
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

const deletePost = catchAsync(async (req, res) => {
  let { id } = req.params;

  id = mongoose.Types.ObjectId(id);
  const post = await postModel.findByIdAndDelete(id);

  //remove from posts collection
  sendResponse(res, { message: "post deleted successfully", data: { post } });
});

const postController = {
  createPost,
  getPost,
  getFeedPosts,
  getUserOrPagePosts,
  updatePost,
  deletePost,
};

export default postController;
