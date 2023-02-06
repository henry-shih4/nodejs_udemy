const express = require("express");
const router = express.Router();

const {
  registerUser,
  getUsers,
  loginUser,
} = require("../controllers/authController");

router.route("/register").post(registerUser);
router.route("/users").get(getUsers);
router.route("/login").post(loginUser);

module.exports = router;
