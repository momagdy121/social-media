import {
  signUp,
  sendVerificationCode,
  verifyAccount,
  login,
  sendForgotPasswordCode,
  verifyForgotPasswordCode,
  refreshTheToken,
  logout,
} from "../controllers/authController.js";
import {
  validateEmail,
  isVerified,
  validateOTP,
  validateSignUp,
  validateLogin,
} from "../middlewares/authValidation/auth.js";

import { Router } from "express";
import { changePassword } from "../controllers/userController.js";
import upload from "../middlewares/multer.js";
import uploadImage from "../middlewares/uploadImage.js";

import handleTokenRefresh from "../services/token_management/handleTokenRefresh.js";

const authRouter = Router();

//login , sign up and verify account
authRouter.post(
  "/signup",
  upload.single("avatar"), //FIXME: this is not best practice
  validateSignUp,
  uploadImage,
  signUp
);

authRouter.post("/resend-otp", validateEmail, isVerified, sendVerificationCode);
authRouter.post("/token", handleTokenRefresh, refreshTheToken);

authRouter.patch(
  "/verify",
  validateEmail,
  isVerified,
  validateOTP,
  verifyAccount
);

authRouter.post("/login", validateLogin, login);

authRouter.post("/logout", logout);

//forgot password
authRouter.post("/forgot-password/code", validateEmail, sendForgotPasswordCode);

authRouter.post(
  "/forgot-password/verify",
  validateEmail,
  validateOTP,
  verifyForgotPasswordCode
);

authRouter.patch(
  "/forgot-password/reset",
  validateEmail,
  validateOTP,
  changePassword
);

export default authRouter;
