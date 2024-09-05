import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import likeModel from "./../models/likeModel.js";

export const likeAndUnlike = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const user = req.user;

  const like = await likeModel.findOne({ user: user._id, post: postId });
  if (like) {
    await like.remove();
    return sendResponse(res, { message: "unliked" });
  } else {
    await likeModel.create({ user: user._id, post: postId });
    return sendResponse(res, { message: "liked" });
  }
});

export const getLikes = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const likers = await likeModel
    .find({ post: postId })
    .select("-post -__v")
    .populate({ path: "user", select: "name avatar _id username" });

  sendResponse(res, { data: { likers } });
});
