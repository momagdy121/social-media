import pageModel from "./../../models/pageModel.js";
import ApiError from "../../utils/apiError.js";

const isPageAdmin = async (req, res, next) => {
  if (!req.params.pageId) return next();
  const user = req.user;
  const page = await pageModel.findById(req.params.pageId);

  // Check if the user is either the owner or an admin of the page
  const isOwner = page.owner.toString() === user._id.toString();
  const isAdmin = page.admins.some(
    (adminId) => adminId.toString() === user._id.toString()
  );

  if (!isOwner && !isAdmin) {
    return next(
      new ApiError("You are not an admin nor the owner of this page", 401)
    );
  }

  next();
};

export default isPageAdmin;
