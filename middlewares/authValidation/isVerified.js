import authErrors from "../../errors/authErrors";
async function isVerified(req, res, next) {
  const user = req.user;
  if (user.verified) return next(authErrors.accountAlreadyVerified());

  next();
}

export default isVerified;
