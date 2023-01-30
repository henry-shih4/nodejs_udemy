const jobs = require("../models/jobs");
const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");

//Get all jobs => /api/v1/jobs
exports.getJobs = async (req, res, next) => {
  const jobs = await Job.find();

  res.status(200).json({
    success: true,
    reults: jobs.length,
    data: { jobs },
  });
};

//get a single job by ID ==> /api/v1/jobs/:id/:slug

exports.getSingleJob = async (req, res, next) => {
  let jobId = req.params.id;
  let job = await Job.find({
    $and: [{ _id: jobId }, { slug: req.params.slug }],
  });

  if (!job || job.length === 0) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  res.status(200).json({ succes: true, data: job });
};

//create a new job ==> /api/v1/jobs/new

exports.newJob = async (req, res, next) => {
  const job = await Job.create(req.body);
  res.status(200).json({
    success: true,
    message: "New job created",
    data: job,
  });
};

//search jobs within radius => /api/v1/jobs/location/:zipcode/:distance

exports.getJobsInRadius = async (req, res, next) => {
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
};

//update a job /api/v1/job/:id

exports.updateJob = async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404).json({
      success: false,
      message: "Job was not found",
    });
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
};

//Delete a job

exports.deleteJob = async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404).json({
      success: false,
      message: "Job was not found",
    });
  }

  job = await Job.findByIdAndDelete({ _id: req.params.id });
  res.status(200).json({
    success: true,
    message: "Job has been deleted",
    data: job,
  });
};

//get stats

exports.jobStats = async (req, res, next) => {
  console.log(req.params.topic);
  const stats = await Job.aggregate([
    {
      $match: { $text: { $search: '"' + req.params.topic + '"' } },
    },
    {
      $group: {
        _id: { $toUpper: "$experience" },
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: "$positions" },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" },
      },
    },
  ]);

  if (stats.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No stats found for ${req.params.topic}`,
    });
  }

  res.status(200).json({
    success: true,
    data: stats,
  });
};
