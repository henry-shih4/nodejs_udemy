const User = require("../models/users");
const Job = require("../models/jobs");
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
path = require("path");
const fs = require("fs");
const APIFilters = require("../utils/apiFilters");

//get current user profile => /api/v1/profile

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "jobsPublished",
    select: "title postingDate",
  });

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

//get all users (only super user)==> /api/v1/users
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(User.find(), req.query);
  apiFilters.filter();
  apiFilters.sort();
  apiFilters.limitFields();
  apiFilters.searchByQuery();
  apiFilters.pagination();

  const users = await apiFilters.query;

  res.status(200).json({
    success: true,
    reults: users.length,
    data: { users },
  });
});

//delete current user. ==> /api/v1/profile/delete
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  deleteUserData(req.user.id, req.user.role);

  const user = await User.findByIdAndDelete(req.user.id);

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: `User ${req.user.username} has been deleted. bye!`,
  });
});

//show all jobs published by an employer => /api/v1/jobs/published
exports.getPublishedJobs = catchAsyncErrors(async (req, res, next) => {
  let jobs = await Job.find({ postingUser: req.user.id });
  res.status(200).json({ success: true, results: jobs.length, data: jobs });
});

//show all applied jobs by a user => /api/v1/jobs/applied
exports.getAppliedJobs = catchAsyncErrors(async (req, res, next) => {
  let jobs = await Job.find({ "applicantsApplied.id": req.user.id }).select(
    "+applicantsApplied"
  );
  res.status(200).json({ success: true, results: jobs.length, data: jobs });
});

//delete a single user only by super user => /api/v1/users/:id/delete

exports.deleteSingleUser = catchAsyncErrors(async (req, res, next) => {
  let userId = req.params.id;
  let user = await User.findById(userId);
  // console.log(user);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  deleteUserData(user.id, user.role);

  user = await User.findByIdAndDelete({ _id: userId });
  res.status(200).json({
    success: true,
    message: `User ${user.username}: ${user.id} has been deleted by a super user.`,
  });
});

//delete current user data function

async function deleteUserData(user, role) {
  //delete jobs as admin
  if (role === "admin") {
    await Job.deleteMany({ postingUser: user });
  }

  //delete files related to user
  if (role === "user") {
    const appliedJobs = await Job.find({ "applicantsApplied.id": user }).select(
      "+applicantsApplied"
    );

    for (let i = 0; i < appliedJobs.length; i++) {
      let obj = appliedJobs[i].applicantsApplied.find((o) => o.id === user);

      let filepath = path.join(
        __dirname,
        "../../",
        "public",
        "uploads",
        `${obj.resume}`
      );

      // let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace(
      //   "\\controllers",
      //   ""
      // );

      fs.unlink(filepath, (err) => {
        if (err) return console.log(err);
      });

      appliedJobs[i].applicantsApplied.splice(
        appliedJobs[i].applicantsApplied.indexOf(obj),
        1
      );

      await appliedJobs[i].save();
    }
  }
}
