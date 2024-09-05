import userModel from "../models/userModel.js";
import ApiError from "../utils/apiError.js";
import catchAsync from "../utils/catchAsync.js";
import { pagination } from "../utils/queryProcesses.js";
import sendResponse from "../utils/sendResponse.js";

export const checkUsername = catchAsync(async (req, res, next) => {
  const { username } = req.body;

  const user = await userModel.exists({ username });

  if (user) return next(new ApiError("username is not available", 400));

  sendResponse(res, { message: "username is available" });
});

export const getProfile = catchAsync(async (req, res) => {
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
export const editProfile = catchAsync(async (req, res, next) => {
  const { name, city, bio, website } = req.body;
  const user = req.user;

  // Update only the fields that are provided in the request body
  if (name !== undefined) user.name = name;
  if (city !== undefined) user.city = city;
  if (bio !== undefined) user.bio = bio;
  if (website !== undefined) user.website = website;

  await user.save();

  // Send the response with updated user data
  sendResponse(res, { data: { name, city, bio, website } });
});

export const getFriends = catchAsync(async (req, res, next) => {
  const user = req.user;
  const friends = await userModel
    .find({ _id: { $in: user.friends } })
    .selectBasicInfo()
    .lean();

  sendResponse(res, { data: { friends } });
});

export const usersSearch = catchAsync(async (req, res, next) => {
  const { limit, skip, page } = pagination(req);

  if (!req.query.q)
    return next(new ApiError("Please provide a search query", 400));

  // Search for users matching the query
  let users = await userModel
    .findByName(req.query.q)
    .limit(limit)
    .skip(skip)
    .selectBasicInfo()
    .lean();

  // Check if each user is a friend of the current user
  users.forEach((user) => {
    user.isFriend = req.user.friends.includes(user._id.toString());
  });

  sendResponse(res, { data: { page, users } });
});

export const getUserById = catchAsync(async (req, res, next) => {
  let user = await userModel
    .findById(req.params.userId)
    .select("name username avatar _id bio city website")
    .lean();

  user.isFriend = req.user.friends.includes(user._id.toString());

  sendResponse(res, { data: { user } });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const user = req.user;

  user.password = req.body.new;
  user.hashedCode = undefined;
  user.codeExpired = undefined;

  await user.save();

  res.clearCookie("refreshToken");

  sendResponse(res, {
    code: 202,
    message: "password changed successfully, please login again",
  });
});

//requests
export const sendRequest = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userModel.findById(userId);

  if (user.pendingRequests.includes(req.user._id))
    return next(new ApiError("you already sent a request", 400));

  //add to pending requests and save
  user.pendingRequests.push(req.user._id);

  await user.save();

  sendResponse(res, { message: "request sent successfully" });
});

export const rejectRequest = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = req.user;

  if (!user.pendingRequests.includes(userId))
    return next(new ApiError("you don't have this request", 400));

  //remove from pending requests and save
  user.pendingRequests.pull(userId);

  await user.save();
  sendResponse(res, { message: "request rejected successfully", code: 202 });
});

export const acceptRequest = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { user } = req;

  if (!user.pendingRequests.includes(userId.toString()))
    return next(new ApiError("you don't have this request", 400));

  const otherUser = await userModel.findById(userId);

  //remove from pending requests and add to friends
  user.pendingRequests.pull(userId);

  //add to friends
  user.friends.push(req.user._id);
  otherUser.friends.push(user._id);

  await Promise.all([user.save(), otherUser.save()]);

  sendResponse(res, { message: "request accepted successfully", code: 202 });
});

export const getPendingRequests = catchAsync(async (req, res, next) => {
  const user = req.user;

  const users = await userModel
    .find({ _id: { $in: user.pendingRequests } })
    .selectBasicInfo()
    .lean();

  sendResponse(res, { data: { users } });
});

//ownership
/* export const changeRule = catchAsync((req, res, next) => {
  if (!req.body.rule) return next(new ApiError("Please provide rule", 400));

  if (![rule.ADMIN, rule.USER].includes(req.body.rule))
    return next(new ApiError("invalid rule provided", 400));

  userModel
    .findByIdAndUpdate(
      req.params.userId,
      { rule: req.body.rule },
      { new: true }
    )
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((error) => {
      return next(new ApiError("user not found", 404));
    });
});
export const getAllUser = catchAsync(async (req, res) => {
  const users = await userModel.find(req.query);
  sendResponse(res, { data: { users } });
});
 */
