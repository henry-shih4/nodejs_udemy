const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter a username"],
    unique: true,
    index:true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email address"],
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin"],
      message: "Please select a correct role",
    },
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minLength: [8, "Your password must be at least 8 characters."],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

//Encrypting password before saving
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
