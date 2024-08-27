import pageModel from "./../models/pageModel.js";

import ApiError from "../Utils/apiError.js";
import userModel from "../models/userModel.js";
import sendResponse from "../Utils/sendResponse.js";
import catchAsync from "../Utils/catchAsync.js";

export const getPageById = catchAsync(async (req, res, next) => {
  const page = await pageModel
    .findById(req.params.pageId)
    .select("name description profileImage coverImage _id");

  sendResponse(res, { data: { page } });
});

export const getFollowers = catchAsync(async (req, res, next) => {});

export const createPage = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    profileImage = null,
    coverImage = null,
  } = req.body;
  const user = req.user;

  const page = await pageModel.create({
    name,
    description,
    profileImage,
    coverImage,
    owner: user._id,
  });
  sendResponse(res, { data: { page } });
});

export const followAndUnFollowPage = catchAsync(async (req, res, next) => {
  const { user, page } = res.locals;

  if (user.followingPages.includes(page._id)) {
    user.followingPages.pull(page._id);
    await user.save();
    sendResponse(res, { message: "unfollowed" });
  } else {
    user.followingPages.push(page._id);
    await user.save();
    sendResponse(res, { message: "followed" });
  }
});

export const getAdmins = catchAsync(async (req, res, next) => {
  const { page } = res.locals;

  const admins = await userModel
    .find({ _id: { $in: page.admins } })
    .select("name username avatar _id");

  sendResponse(res, { data: { admins } });
});

export const requestAndCancelRequestAdmin = catchAsync(
  async (req, res, next) => {
    const { page, user } = res.locals;

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
  const { _id } = req.body;
  const { page } = res.locals;

  page.admins.push(_id);
  page.pendingAdminRequests.pull(_id);

  await page.save();

  sendResponse(res, { message: "admin accepted" });
});

export const getPendingAdminRequests = catchAsync(async (req, res, next) => {
  const { page } = res.locals;

  const pendingAdmins = await userModel
    .find({ _id: { $in: page.pendingAdminRequests } })
    .select("name username avatar _id");

  sendResponse(res, { data: { pendingAdmins } });
});

export const rejectAdminRequest = catchAsync(async (req, res, next) => {
  const { page } = res.locals;

  page.pendingAdminRequests.pull(_id);

  await page.save();

  sendResponse(res, { message: "admin rejected" });
});

export const removeFromAdmin = catchAsync(async (req, res, next) => {
  const { _id } = req.body;
  const { page } = res.locals;

  if (!page.admins.includes(_id))
    return next(new ApiError("user is not an admin", 400));

  page.admins.pull(_id);

  await page.save();

  sendResponse(res, { message: "admin removed" });
});
