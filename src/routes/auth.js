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
router.route("/users").get(isAuthenticatedUser, getUsers);

router.route("/login").post(loginUser);
router.route("/password/forgot").post(isAuthenticatedUser, forgotPassword);
router.route("/password/reset/:token").put(isAuthenticatedUser, resetPassword);
router.route("/logout").get(isAuthenticatedUser, logout);

module.exports = router;
