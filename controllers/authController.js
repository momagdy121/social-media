import userModel from "../models/userModel.js";
import catchAsync from "../Utils/catchAsync.js";
import verificationMail from "../services/mailService/verificationMail.js";
import resetPassMail from "../services/mailService/resetPassMail.js";
import generateTokensFullProcess from "../services/token_management/generateTokensFullProcess.js";

export const signUp = catchAsync(async (req, res, next) => {
  const { email, password, name, username } = req.body;

  let avatarUrl = res.locals.url || null;

  const user = await userModel.create({
    email,
    password,
    name,
    username,
    avatar: avatarUrl,
  });

  res.status(201).send({
    status: "success",
    user: {
      email,
      username,
      name,
      id: user._id,
      avatar: user.avatar,
    },
    message: "We sent a verification code to your email",
  });
});

export const sendVerificationCode = catchAsync(async (req, res, next) => {
  const user = req.user;

  const verificationCode = await user.createOTP();

  await user.save({ validateBeforeSave: false });

  await verificationMail(req.body.email, verificationCode);

  res.status(200).json({
    status: "success",
    message:
      "we sent a verification code to your email note: check your spam if you didn't find the message in your inbox",
  });
});

export const verifyAccount = catchAsync(async (req, res, next) => {
  const user = req.user;
  // Update user properties
  user.verified = true;
  user.hashedCode = undefined;
  user.codeExpired = undefined;

  // Create tokens
  await generateTokensFullProcess(user, res);

  res.send({
    status: "success",
    user: {
      email: user.email,
      username: user.username,
      name: user.name,
      id: user._id,
      avatar: user.avatar,
    },
    message: "your account has been verified",
  });
});

export const login = catchAsync(async (req, res, next) => {
  const user = req.user;
  await generateTokensFullProcess(user, res);

  res.status(200).send({ status: "success", message: "logged in" });
});

export const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.status(200).json({ status: "success", message: "logged out" });
});

export const sendForgotPasswordCode = catchAsync(async (req, res, next) => {
  const user = req.user;
  const resetCode = await user.createOTP();

  await resetPassMail(user.email, resetCode);

  await await user.save({ validateBeforeSave: false });
  res.json({
    status: "Success",
    message: `Reset password code sent to your email ${req.body.email},"will be expired in 10 minutes !!" note :check your spam if you didn't found the message in your inbox `,
  });
});

export const verifyForgotPasswordCode = catchAsync(async (req, res, next) => {
  res.send({
    status: "success",
    message:
      "now make patch request with the code , email and the the new password ",
  });
});

export const refreshTheToken = catchAsync(async (req, res, next) => {
  res.status(200).send({
    status: "success",
    message: "Token refreshed",
  });
});
