const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  forgotPassword,
  newpassword,
} = require("../controllers/userDetails");

router.post("/", registerUser);
router.post("/login", authUser);
router.post("/forgotPassword", forgotPassword);
router.post("/newpassword", newpassword);

module.exports = router;
