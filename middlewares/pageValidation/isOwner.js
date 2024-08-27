const isOWner = (req, res, next) => {
  const { user, page } = res.locals;

  if (!page.owner.equals(user._id))
    return next(new ApiError("you are not the owner of this page", 400));

  next();
};

export default isOWner;
