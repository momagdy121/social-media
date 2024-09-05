import mongoose from "mongoose";
import ApiError from "../../utils/apiError.js";

const isUserInPendingAdminRequests = (req, res, next) => {
  const { userId } = req.body;
  const page = req.page;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId))
    return next(new ApiError("please provide valid user id as userId", 400));

  if (!page.pendingAdminRequests.includes(userId))
    return next(new ApiError("user is not pending  request", 400));
  next();
};

export default isUserInPendingAdminRequests;
