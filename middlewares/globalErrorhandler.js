import ApiError from "../Utils/apiError.js";

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Internal Server Error";
  err.message = err.message || "please try to report the backend developer";

  if (process.env.NODE_ENV === "production") {
    handleProdError(err, res);
  } else {
    handleDevError(err, res);
  }
};

function handleProdError(err, res) {
  let error = { ...err };
  error.message = err.message; // Ensure the error message is included
  if (err.name === "ValidationError") {
    error = handleValidatorErrors(err);
  } else if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
    error = handleEmailError();
  } else if (err.kind === "ObjectId" && err.path === "_id") {
    error = handleObjectIdError();
  } else if (
    err.name === "JsonWebTokenError" ||
    (err instanceof SyntaxError && err.message.includes("JSON"))
  ) {
    error = handleInvalidToken();
  } else if (err.name === "TokenExpiredError") {
    error = handleTokenExpiration();
  } else {
    error = handleOtherErrors(err);
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
}

function handleDevError(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    errorName: err.name,
  });
}

function handleValidatorErrors(err) {
  const errors = Object.values(err.errors).map((error) => error.message);
  return new ApiError(errors.join(", "), 400);
}

function handleEmailError() {
  return new ApiError("This email is already in use", 403);
}

function handleOtherErrors(err) {
  return new ApiError(
    err.message || "please try to report the backend developer",
    err.statusCode || 500
  );
}

function handleObjectIdError() {
  return new ApiError("Please enter a valid ID", 400);
}

function handleInvalidToken() {
  return new ApiError("invalid Token please login again", 401);
}
function handleTokenExpiration() {
  return new ApiError("The token has been expired ,please login again", 401);
}
export default globalErrorHandler;
