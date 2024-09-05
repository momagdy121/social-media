import jwt from "jsonwebtoken";
import apiError from "../../utils/apiError.js";
import userModel from "../../models/userModel.js";
import catchAsync from "../../utils/catchAsync.js";
import checkTokenDate from "../../services/token_management/checkTokenDate.js";
import handleTokenRefresh from "../../services/token_management/handleTokenRefresh.js";

const verifyAccessToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  if (!refreshToken) return next(new apiError("Please log in first", 401));

  // If access token is not provided, immediately attempt to refresh using refresh token
  if (!accessToken) return await handleTokenRefresh(req, res, next);

  try {
    // Verify the access token
    const payload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_STRING
    );

    const user = await userModel.findById(payload.id);

    if (!user) return next(new apiError("User not found!", 404));

    // Validate token date against user data
    checkTokenDate(user, user.accessTokenCreatedAt, payload);

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // If the access token is expired, refresh it
      return await handleTokenRefresh(req, res, next);
    } else {
      return next(new apiError("Invalid access token", 401));
    }
  }
});

export default verifyAccessToken;
// Function to handle the creation and setting of new tokens
