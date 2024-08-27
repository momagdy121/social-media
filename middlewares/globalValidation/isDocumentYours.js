import ApiError from "../../Utils/apiError.js";

function isDocumentYours(docModel, paramId) {
  return async (req, res, next) => {
    const user = req.user;

    const document = await docModel
      .findOne({ _id: req.params[paramId] })
      .select("_id user");

    if (document.user.toString() !== user._id.toString())
      return next(new ApiError(`this document is not yours`, 403));

    next();
  };
}
export default isDocumentYours;
