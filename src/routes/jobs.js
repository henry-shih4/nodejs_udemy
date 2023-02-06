const express = require("express");
const router = express.Router();

// importing jobs controller methods

const {
  newJob,
  getJobs,
  getJobsInRadius,
  updateJob,
  deleteJob,
  getSingleJob,
  jobStats,
} = require("../controllers/jobsController");

const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../../middlewares/auth");

router.route("/jobs").get(getJobs);
router.route("/jobs/:id/:slug").get(getSingleJob);

router
  .route("/job/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newJob);

router.route("/jobs/location/:zipcode/:distance").get(getJobsInRadius);

router
  .route("/jobs/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateJob);

router
  .route("/jobs/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteJob);

router.route("/stats/:topic").get(jobStats);

module.exports = router;
