const mongoose = require("mongoose");

const forgotPasswordSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please add the email"],
    lowercase: true
  },
  token: {
    type: String,
    required: true
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: "1h" }
  }
});

module.exports = mongoose.model("ForgotPassword", forgotPasswordSchema);
