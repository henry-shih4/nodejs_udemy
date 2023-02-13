const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");
const ErrorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const APIFilters = require("../utils/apiFilters");
const path = require("path");

//Get all jobs => /api/v1/jobs
exports.getJobs = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(
    Job.find().collation({ locale: "en", strength: 1 }),
    req.query
  );
  apiFilters.filter();
  apiFilters.sort();
  apiFilters.limitFields();
  apiFilters.searchByQuery();
  apiFilters.pagination();

  const jobs = await apiFilters.query;

  res.status(200).json({
    success: true,
    reults: jobs.length,
    data: { jobs },
  });
});

//get a single job by ID ==> /api/v1/jobs/:id/:slug

exports.getSingleJob = catchAsyncErrors(async (req, res, next) => {
  let jobId = req.params.id;
  let job = await Job.find({
    $and: [{ _id: jobId }, { slug: req.params.slug }],
  });

  if (!job || job.length === 0) {
    return next(new ErrorHandler("Job not found", 404));
  }
  res.status(200).json({ succes: true, data: job });
});

//create a new job ==> /api/v1/jobs/new

exports.newJob = catchAsyncErrors(async (req, res, next) => {
  //adding user to boy
  req.body.postingUser = req.user.id;
  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "New job created",
    data: job,
  });
});

//search jobs within radius => /api/v1/jobs/location/:zipcode/:distance
exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  console.log(zipcode, distance);
  //get latitude and longitude from geocoder using zipcode

  const loc = await geoCoder.geocode(zipcode);
  const longitude = loc[0].longitude;
  const latitude = loc[0].latitude;
  const radius = distance / 3963;

  const jobsInArea = await Job.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    success: true,
    results: jobsInArea.length,
    data: jobsInArea,
  });
});

//update a job /api/v1/jobs/:id

exports.updateJob = catchAsyncErrors(async (req, res, next) => {
  let jobId = req.params.id;
  // if (!mongoose.Types.ObjectId.isValid(jobId)) {
  //   return next(new ErrorHandler("Invalid job id", 404));
  // }
  let job = await Job.findById(jobId);
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }
  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Job has been updated",
    data: job,
  });
});

//Delete a job

exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
  let jobId = req.params.id;

  let job = await Job.findById(jobId);
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  job = await Job.findByIdAndDelete({ _id: jobId });
  res.status(200).json({
    success: true,
    message: "Job has been deleted",
    data: job,
  });
});

//get stats

exports.jobStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Job.aggregate([
    {
      $match: { $text: { $search: '"' + req.params.topic + '"' } },
    },
    {
      $group: {
        _id: { $toUpper: "$title" },
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: "$positions" },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" },
      },
    },
  ]);

  if (stats.length === 0) {
    return next(
      new ErrorHandler(`No stats found for - ${req.params.topic}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// apply to job using resume => /api/v1/job/:id/apply

exports.applyJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id).select("+applicantsApplied");

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  //check if job last date has been passed or not. (expiration to apply)

  if (job.lastDate < new Date(Date.now())) {
    return next(new ErrorHandler("Job posting date has passed", 400));
  }

  // check if user has applied already

  if (
    job.applicantsApplied.filter((applicant) => {
      return applicant.id === req.user.id;
    }).length > 0
  ) {
    return next(new ErrorHandler("You have already applied to this job.", 400));
  }

  //check files
  if (!req.files) {
    return next(new ErrorHandler("Please upload a file", 400));
  }

  const file = req.files.file;

  //check file type (only allow pdf or doc)

  const supportedFiles = /.docs|.pdf/;
  if (!supportedFiles.test(path.extname(file.name))) {
    return next(
      new ErrorHandler("Please upload document file in PDF or DOC format", 400)
    );
  }

  //Check document size
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorHandler(
        "File size is too big. Please upload file less than 2MB",
        400
      )
    );
  }

  //Rename file
  file.name = `${req.user.username.replace(" ", "_")}_${job._id}${
    path.parse(file.name).ext
  }`;

  file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorHandler("Resume upload failed", 500));
    }

    await Job.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          applicantsApplied: { id: req.user.id, resume: file.name },
        },
      },
      { new: true, runValidators: true, useFindAndMondify: false }
    );
  });
  res.status(200).json({
    success: true,
    message: "Applied to Job successfully",
    data: file.name,
  });
});
