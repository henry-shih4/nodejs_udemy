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

//update current data password

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isMatched = await user.comparePassword(req.body.currentPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Password entered is incorrect"), 401);
  } else {
    user.password = req.body.newPassword;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "password has been updated." });
  }
});

//Update current user data  /api/v1/profile/update

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    username: req.body.username,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res
    .status(200)
    .json({ success: true, message: "user updated successfully", data: user });
});

//delete current user. ==> /api/v1/profile/delete

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user.id);

  res.cookie("token", null, {
    expires: newDate(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: `User ${req.user.username} has been deleted. bye!`,
  });
});
