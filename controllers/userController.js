import userModel from "../models/userModel.js";
import userErrors from "../errors/userErrors.js";
import catchAsync from "../utils/catchAsync.js";
import { pagination } from "../utils/queryProcesses.js";
import sendResponse from "../utils/sendResponse.js";

const checkUsername = catchAsync(async (req, res, next) => {
  const { username } = req.body;

  const user = await userModel.exists({ username });

  if (user) return next(userErrors.usernameNotAvailable());

  sendResponse(res, { message: "Username is available" });
});

const getProfile = catchAsync(async (req, res) => {
  const { _id, name, username, rule, verified, avatar, city, bio, website } =
    req.user;

  const user = {
    _id,
    name,
    username,
    rule,
    verified,
    avatar,
    city,
    bio,
    website,
  };

  sendResponse(res, { data: { user } });
});

const editProfile = catchAsync(async (req, res, next) => {
  const { name, city, bio, website } = req.body;
  const user = req.user;

  if (name !== undefined) user.name = name;
  if (city !== undefined) user.city = city;
  if (bio !== undefined) user.bio = bio;
  if (website !== undefined) user.website = website;

  await user.save();

  sendResponse(res, { data: { name, city, bio, website } });
});

const getFriends = catchAsync(async (req, res, next) => {
  const user = req.user;
  const friends = await userModel
    .find({ _id: { $in: user.friends } })
    .selectBasicInfo()
    .lean();

  sendResponse(res, { data: { friends } });
});

const usersSearch = catchAsync(async (req, res, next) => {
  const { limit, skip, page } = pagination(req);

  if (!req.query.q) return next(userErrors.provideSearchQuery());

  let users = await userModel
    .findByName(req.query.q)
    .limit(limit)
    .skip(skip)
    .selectBasicInfo()
    .lean();

  users.forEach((user) => {
    user.isFriend = req.user.friends.includes(user._id.toString());
  });

  sendResponse(res, { data: { page, users } });
});

const getUserById = catchAsync(async (req, res, next) => {
  let user = await userModel
    .findById(req.params.userId)
    .select("name username avatar _id bio city website")
    .lean();

  if (!user) return next(userErrors.userNotFound());

  user.isFriend = req.user.friends.includes(user._id.toString());

  sendResponse(res, { data: { user } });
});

const changePassword = catchAsync(async (req, res, next) => {
  const user = req.user;

  user.password = req.body.new;
  user.hashedCode = undefined;
  user.codeExpired = undefined;

  await user.save();

  res.clearCookie("refreshToken");

  sendResponse(res, {
    code: 202,
    message: "Password changed successfully, please login again",
  });
});

const sendRequest = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userModel.findById(userId);

  if (user.pendingRequests.includes(req.user._id))
    return next(userErrors.alreadySentRequest());

  user.pendingRequests.push(req.user._id);
  await user.save();

  sendResponse(res, { message: "Request sent successfully" });
});

const rejectRequest = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = req.user;

  if (!user.pendingRequests.includes(userId))
    return next(userErrors.requestNotFound());

  user.pendingRequests.pull(userId);
  await user.save();

  sendResponse(res, { message: "Request rejected successfully", code: 202 });
});

const acceptRequest = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { user } = req;

  if (!user.pendingRequests.includes(userId.toString()))
    return next(userErrors.requestNotFound());

  const otherUser = await userModel.findById(userId);

  user.pendingRequests.pull(userId);
  user.friends.push(user._id);
  otherUser.friends.push(user._id);

  await Promise.all([user.save(), otherUser.save()]);

  sendResponse(res, { message: "Request accepted successfully", code: 202 });
});

const getPendingRequests = catchAsync(async (req, res, next) => {
  const user = req.user;

  const users = await userModel
    .find({ _id: { $in: user.pendingRequests } })
    .selectBasicInfo()
    .lean();

  sendResponse(res, { data: { users } });
});

const userController = {
  checkUsername,
  getProfile,
  editProfile,
  getFriends,
  usersSearch,
  getUserById,
  changePassword,
  sendRequest,
  rejectRequest,
  acceptRequest,
  getPendingRequests,
};
export default userController;
