const jwt = require("jsonwebtoken");
const User = require("../src/models/users");

const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../src/utils/errorHandler");

//check if user is authenticated or not

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token = "null";
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token === "null") {
    return next(new ErrorHandler("Login first to access this resource", 401));
  } else {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  }
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`
        ),
        403
      );
    }
    next();
  };
};
