const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../../middlewares/auth");

const {
  registerUser,
  getUsers,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/authController");

router.route("/register").post(registerUser);
router.route("/users").get(getUsers);
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/logout").get(isAuthenticatedUser, logout);

module.exports = router;
