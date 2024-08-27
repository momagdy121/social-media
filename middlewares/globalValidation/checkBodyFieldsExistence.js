import ApiError from "../../Utils/apiError.js";

//TODO:use me
function checkBodyFieldsExistence(fields) {
  return (req, res, next) => {
    const missingFields = fields
      .filter((field) => !req.body[field] || req.body[field].trim() === "")
      .join(", ");

    if (missingFields) {
      return next(
        new ApiError(`Missing or empty fields: ${missingFields}`, 400)
      );
    }

    next();
  };
}

export default checkBodyFieldsExistence;
