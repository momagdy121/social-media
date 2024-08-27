import apiError from "../../Utils/apiError.js";
import userModel from "../../models/userModel.js";

export function isAuthorized(...rules) {
  return function (req, res, next) {
    if (rules.includes(req.user.rule)) {
      return next();
    }
    return next(new apiError("Unauthorized", 401));
  };
}

export async function validateOTP(req, res, next) {
  if (!req.body.code) return next(new apiError("please provide the code", 400));

  const user = req.user;

  if (!user.hashedCode)
    return next(new apiError("please request code first", 400));

  const isMatch = await user.compareOTPs(req.body.code, user.hashedCode);

  if (!isMatch) return next(new apiError("Invalid Code", 400));

  if (user.codeExpired < Date.now())
    return next(new apiError("the code has expired", 410));

  next();
}

export async function validateEmail(req, res, next) {
  if (!req.body.email)
    return next(new apiError("please provide an email", 400));

  const user = await userModel.findOne({
    email: req.body.email,
  });
  if (!user) return next(new apiError("User not found", 404));

  req.user = user;
  next();
}

export async function isVerified(req, res, next) {
  const user = req.user;
  if (user.verified)
    return next(new apiError("Account already  verified", 400));

  next();
}

export async function verifyPassword(req, res, next) {
  let { old } = req.body;

  const user = req.user;
  const isMatch = await user.comparePassword(old, user.password);

  if (!isMatch) return next(new apiError("wrong password", 401));

  next();
}
export const validateSignUp = async (req, res, next) => {
  const { email, password, name, username } = req.body;

  if (!email || !password || !name || !username)
    return next(
      new apiError(
        "Please enter all fields :email,password,name and username",
        401
      )
    );

  const currUser = await userModel.find({ $or: [{ email }, { username }] });

  if (currUser.length > 0)
    return next(new apiError("this username or email already taken", 401));

  next();
};

export const validateLogin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new apiError("please enter all fields", 400));

  const user = await userModel.findOne({ email });

  if (!user) return next(new apiError("user doesn't exit", 404));

  const isMatch = await user.comparePassword(password, user.password);

  if (!isMatch) return next(new apiError("wrong password", 401));

  if (!user.verified)
    return next(new apiError("Your account is not yet verified", 403));

  req.user = user;

  next();
};
