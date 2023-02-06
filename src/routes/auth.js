const express = require("express");
const router = express.Router();

const {
  registerUser,
  getUsers,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.route("/register").post(registerUser);
router.route("/users").get(getUsers);
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

module.exports = router;
