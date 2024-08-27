const isUserInPendingAdminRequests = (req, res, next) => {
  const { _id } = req.body;

  if (!_id || !mongoose.Types.ObjectId.isValid(_id))
    return next(new ApiError("please provide valid user id ", 400));

  if (!page.pendingAdminRequests.includes(_id))
    return next(new ApiError("user is not pending  request", 400));
  next();
};

export default isUserInPendingAdminRequests;
