const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: { type: String, expireToken: Date },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.password;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
