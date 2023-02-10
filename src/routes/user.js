const express = require("express");
const router = express.Router();

const { getUserProfile } = require("../controllers/userController");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../../middlewares/auth");

router.route("/profile").get(isAuthenticatedUser, getUserProfile);

module.exports = router;
