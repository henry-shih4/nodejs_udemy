const User = require("../models/users");
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

//get current user profile => /api/v1/profile

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  console.log(req);
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
