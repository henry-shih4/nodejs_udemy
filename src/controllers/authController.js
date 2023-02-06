const User = require("../models/users");
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");

//create a new user ==> /api/v1/register

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, email, password, role } = req.body;
  const user = await User.create({
    username,
    email,
    password,
    role,
  });

  sendToken(user, 200, res)
});

//get users ==> /api/v1/users

exports.getUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    reults: users.length,
    data: { users },
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
