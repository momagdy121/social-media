import jwt from "jsonwebtoken";
import userModel from "../../models/userModel.js";
import apiError from "../../Utils/apiError.js";
import checkTokenDate from "../../services/token_management/checkTokenDate.js";

const verifyRefreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) throw new apiError("Please log in first", 401);
  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_STRING
    );

    const user = await userModel.findById(payload.id);

    if (!user) throw new apiError("User not found!", 404);

    checkTokenDate(user, user.refreshTokenCreatedAt, payload, apiError);

    req.user = user;
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      throw new apiError("Invalid refresh token please,login again", 401);
    } else {
      throw new apiError(error.message, 401);
    }
  }
};

export default verifyRefreshToken;
