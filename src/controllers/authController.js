const User = require("../models/users");
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");

//create a new user ==> /api/v1/register

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, email, password, role } = req.body;
  const user = await User.create({
    username,
    email,
    password,
    role,
  });
  res.status(200).json({
    success: true,
    message: "New user registered",
    data: user,
  });
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
