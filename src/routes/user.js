const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updatePassword,
  updateUser,
  getUsers,
  deleteUser,
  getAppliedJobs,
  getPublishedJobs,
  deleteSingleUser,
} = require("../controllers/userController");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../../middlewares/auth");

router.route("/profile").get(isAuthenticatedUser, getUserProfile);

router.route("/password/change").put(isAuthenticatedUser, updatePassword);

router.route("/profile/update").put(isAuthenticatedUser, updateUser);

router.route("/profile/delete").delete(isAuthenticatedUser, deleteUser);

router
  .route("/jobs/applied")
  .get(isAuthenticatedUser, authorizeRoles("user"), getAppliedJobs);

router
  .route("/jobs/published")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getPublishedJobs);

router
  .route("/users/:id/delete")
  .delete(isAuthenticatedUser, authorizeRoles("super"), deleteSingleUser);

router
  .route("/users")
  .get(isAuthenticatedUser, authorizeRoles("super"), getUsers);

module.exports = router;
