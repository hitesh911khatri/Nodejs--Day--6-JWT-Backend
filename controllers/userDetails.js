const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const generateToken = require("../generateToken");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.MAIL,
    },
  })
);

const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    console.log("please enter all the fields");
  }

  const userExists = await User.findOne({ email: req.body.email });
  if (userExists)
    return res.status(409).send({ message: "User already exists" });

  const user = await User.create({
    name,
    email,
    password,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      token: generateToken(user._id),
    });

    // transporter.sendMail({
    //   to: user.email,
    //   from: "awsuriya@gmail.com",
    //   subject: "signup success",
    //   html: "<h1>welcome to task 44</h1>",
    // });
  } else {
    res.status(400);
    console.log("failed to create");
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  try {
    if (user && (await user.matchPassword(password))) {
      // console.log(enteredPassword, this.password);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        token: generateToken(user._id),
      });
    }
  } catch (err) {
    res.status(401).send(err);
    console.log("invalid email id or password");
  }
};

const forgotPassword = async (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const tokenForget = buffer.toString("hex");
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res.status(402).json({ error: "User Doesnt exist" });
      }
      user.resetToken = tokenForget;
      user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        transporter.sendMail({
          to: user.email,
          from: "awsuriya@gmail.com",
          subject: "signup success",
          html: `<h1>welcome to task 44</h1>
    <p>click here to reset password-<a href="https://urlshortner-frontend.vercel.app/forgetPassword/${tokenForget}">Reset password</a> </p>`,
        });
        res.json({ message: "check your email" });
      });
    });
  });
};
const newpassword = async (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  await User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      return res.status(422).json({ error: "Try again session expired" });
    }
    // bcrypt.hash(newPassword, 12).then((hashedpassword) => {
    user.password = newPassword;
    user.resetToken = undefined;
    user.expireToken = undefined;
    user.save().then((saveduser) => {
      res.json({ message: "password updated success" });
    });
  });
  // })
};

module.exports = { registerUser, authUser, forgotPassword, newpassword };
