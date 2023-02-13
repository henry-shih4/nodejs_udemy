const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updatePassword,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../../middlewares/auth");

router.route("/profile").get(isAuthenticatedUser, getUserProfile);

router.route("/password/change").put(isAuthenticatedUser, updatePassword);

router.route("/profile/update").put(isAuthenticatedUser, updateUser);

router.route("/profile/delete").delete(isAuthenticatedUser, deleteUser);

module.exports = router;
