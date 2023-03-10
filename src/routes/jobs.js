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
  applyJob,
} = require("../controllers/jobsController");

const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../../middlewares/auth");


router.get("/", (req, res) => res.status(200).json({success:true, message:'Welcome to job api'}));
router.route("/jobs").get(getJobs);
router.route("/jobs/:id/:slug").get(getSingleJob);

router
  .route("/job/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newJob);

router.route("/jobs/location/:zipcode/:distance").get(getJobsInRadius);

router
  .route("/jobs/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin", "super"), updateJob);

router
  .route("/jobs/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin", "super"), deleteJob);

router.route("/stats/:topic").get(isAuthenticatedUser, jobStats);

router
  .route("/jobs/:id/apply")
  .put(isAuthenticatedUser, authorizeRoles("user"), applyJob);

module.exports = router;
