import pageModel from "./../models/pageModel.js";
import followerModel from "./../models/follower.js";
import ApiError from "../Utils/apiError.js";
import sendResponse from "../Utils/sendResponse.js";
import catchAsync from "../Utils/catchAsync.js";
import { pagination } from "../Utils/queryProcesses.js";
import mongoose from "mongoose";
import {
  excludeAdminsPipeline,
  includeOwnerPipeline,
  isFollower,
} from "../Pipelines/pagePipelines.js";
import { countFollowersPipeline } from "../Pipelines/followersPipeLines.js";

export const getPageById = catchAsync(async (req, res, next) => {
  let { pageId } = req.params;

  pageId = mongoose.Types.ObjectId(pageId);

  const page = await pageModel.aggregate([
    {
      $match: { _id: pageId },
    },
    ...includeOwnerPipeline,
    ...excludeAdminsPipeline,
    ...isFollower,
  ]);

  const followers = await followerModel.aggregate([
    {
      $match: { page: pageId },
    },

    ...countFollowersPipeline,
  ]);
  let followersCount = followers[0]?.followersCount || 0;

  sendResponse(res, {
    data: { page: { ...page[0], followersCount } },
  });
});

export const getFollowers = catchAsync(async (req, res, next) => {
  let { pageId } = req.params;
  const { limit, skip, page } = pagination(req);

  let followers = await followerModel
    .find({ page: pageId })
    .select("user -_id")
    .populateUser()
    .limit(limit)
    .skip(skip)
    .lean();

  followers = followers.map((follower) => follower.user);

  sendResponse(res, { data: { page, followers } });
});

export const createPage = catchAsync(async (req, res, next) => {
  const image = res.locals.uploadedFiles[0]?.url || null;
  const cover = res.locals.uploadedFiles[1]?.url || null;
  const { name, description } = req.body;

  const user = req.user;

  const page = await pageModel.create({
    name,
    description,
    image,
    cover,
    owner: user._id,
  });
  sendResponse(res, { data: { page } });
});

export const followAndUnFollowPage = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { pageId } = req.params;

  const isFollower = await followerModel.exists({
    user: user._id,
    page: pageId,
  });

  if (isFollower) {
    await followerModel.findOneAndDelete({
      user: user._id,
      page: pageId,
    });
    user.followingPages.pull(pageId);
    await user.save();
    sendResponse(res, { message: "unfollowed" });
  } else {
    await followerModel.create({
      user: user._id,
      page: pageId,
    });
    user.followingPages.push(pageId);
    await user.save();
    sendResponse(res, { message: "followed" });
  }
});

export const getAdmins = catchAsync(async (req, res, next) => {
  const admins = await pageModel
    .findById(req.params.pageId)
    .select("admins -_id")
    .populate({
      path: "admins",
      select: "name username avatar _id",
    })
    .lean();
  sendResponse(res, { data: { ...admins } });
});

export const requestAndCancelRequestAdmin = catchAsync(
  async (req, res, next) => {
    const user = req.user;
    const { pageId } = req.params;
    const page = await pageModel.findById(pageId);

    if (page.admins.includes(user._id))
      return next(new ApiError("you are already an admin", 400));

    if (page.pendingAdminRequests.includes(user._id)) {
      page.pendingAdminRequests.pull(user._id);
      await page.save();
      sendResponse(res, { message: "request cancelled" });
    } else {
      page.pendingAdminRequests.push(user._id);
      await page.save();
      sendResponse(res, { message: "request sent" });
    }
  }
);
//owner
export const editPage = catchAsync(async (req, res, next) => {
  res.send({ message: "not implemented" });
});

export const acceptAdmin = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { page } = req;

  page.admins.push(userId);
  page.pendingAdminRequests.pull(userId);

  await page.save();

  sendResponse(res, { message: "admin accepted" });
});

export const getPendingAdminRequests = catchAsync(async (req, res, next) => {
  const { limit, skip, page } = pagination(req);

  const pendingAdmins = await pageModel
    .findById(req.params.pageId)
    .select("pendingAdminRequests -_id")
    .populate({
      path: "pendingAdminRequests",
      select: "name username avatar _id",
    })
    .skip(skip)
    .limit(limit)
    .lean();

  sendResponse(res, { data: { page, ...pendingAdmins } });
});

export const rejectAdminRequest = catchAsync(async (req, res, next) => {
  const page = req.page;
  const userId = req.body.userId;
  page.pendingAdminRequests.pull(userId);

  await page.save();

  sendResponse(res, { message: "admin rejected" });
});

export const removeFromAdmin = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { page } = req;

  if (!page.admins.includes(userId))
    return next(new ApiError("user is not an admin", 400));

  page.admins.pull(userId);

  await page.save();

  sendResponse(res, { message: "admin removed" });
});
