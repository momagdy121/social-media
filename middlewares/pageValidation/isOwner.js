import ApiError from "../../utils/apiError.js";
import pageModel from "./../../models/pageModel.js";

const isOWner = async (req, res, next) => {
  const { user } = req;
  const page = await pageModel.findOne({ _id: req.params.pageId });

  if (!page.owner.equals(user._id))
    return next(new ApiError("you are not the owner of this page", 401));
  req.page = page;
  next();
};

export default isOWner;
