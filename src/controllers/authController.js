const User = require("../models/users");
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//create a new user ==> /api/v1/register

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, email, password, role } = req.body;
  const user = await User.create({
    username,
    email,
    password,
    role,
  });

  res
    .status(200)
    .json({
      success: true,
      message: `New user created: ${req.body.username}. Please log in.`,
    });
});


//Login user /api/v1/login

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password } = req.body;

  //check if email or password is entered by user
  if (!username || !password) {
    return next(new ErrorHandler("Please enter username and password"), 400);
  }

  //Finding user in database

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid username or password"), 401);
  }

  //check password correct
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid username or password", 401));
  }

  sendToken(user, 200, res);
});

//forot password  => api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  //check if user email exists
  if (!user) {
    return next(new ErrorHandler("No user with that email.", 404));
  }

  //get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //create resetpassword URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset link is here: \n\n${resetUrl} \n\n If you have not requested this, please ignore this message`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Jobbee-API Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfuly to user ${user.email}`,
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Email did not send.", 500));
  }
});

//reset password => /api/v1/password/reset/:token

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  //hash url token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //compare this hashurltoken to token in database
  //one user with the token, and the token should be greater than current date.
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Password reset token is invalid or has expired.", 400)
    );
  }

  //Setup new password

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

/// Logout user => /api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "User has been logged out successfuly",
  });
});

