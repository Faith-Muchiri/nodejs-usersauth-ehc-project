const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const ForgotPassword = require("../models/forgotPasswordModel");

//@desc Forgot password
//@route POST /api/password/forgotpassword
//@access public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Please provide an email address");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  const token = crypto.randomBytes(20).toString("hex");
  await ForgotPassword.create({
    email: user.email,
    token
  });
  res.json({
    message: "Please check your email for instructions on how to reset your password"
  });
});

//@desc Reset password
//@route POST /api/password/resetpassword
//@access public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400);
    throw new Error("Token and password are required");
  }
  const forgotPassword = await ForgotPassword.findOne({ token });
  if (!forgotPassword) {
    res.status(400);
    throw new Error("Invalid token");
  }
  const user = await User.findOne({ email: forgotPassword.email });
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  await ForgotPassword.deleteOne({ token });
  res.json({ message: "Password reset successfully" });
});

module.exports = { forgotPassword, resetPassword };
