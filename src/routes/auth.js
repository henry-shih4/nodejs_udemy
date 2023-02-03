const express = require("express");
const router = express.Router();

const { registerUser, getUsers } = require("../controllers/authController");

router.route("/register").post(registerUser);
router.route("/users").get(getUsers);

module.exports = router;
