const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.js"); // ⚠️ ADD THIS LINE to import the User model

const { UserAuth } = require("../middlewares/userAuth.js");
const { validateEditProfileData } = require("../utils/Validator.js");

// -------------------- VIEW PROFILE -------------------- //
// ... (no changes here)
profileRouter.get("/profile/view", UserAuth, async (req, res) => {
  try {
    const user = req.user; // user is attached by UserAuth middleware
    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

// -------------------- EDIT PROFILE -------------------- //
// Corrected to use findByIdAndUpdate
profileRouter.patch("/profile/edit", UserAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req.body)) {
      throw new Error("Invalid Edit Request");
    }

    console.log("EDIT PROFILE BODY:", req.body);

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

// -------------------- CHANGE PASSWORD -------------------- //
// ... (no changes here)
profileRouter.patch("/profile/password", UserAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new Error("Both old and new passwords are required");
    }

    const user = req.user;

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashNewPassword;

    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = { profileRouter };
