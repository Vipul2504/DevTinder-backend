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
    // Check if the request body contains valid data
    if (!validateEditProfileData(req.body)) {
      return res.status(400).send("Invalid Edit Request");
    }

    const loggedInUserId = req.user._id; // ⚠️ FIX: Use Mongoose's findByIdAndUpdate method

    const updatedUser = await User.findByIdAndUpdate(
      loggedInUserId,
      { $set: req.body }, // Use $set to update only the fields in req.body
      { new: true } // This option returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.json({
      message: `${updatedUser.firstName}, your profile was updated successfully.`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile update failed:", error);
    res.status(500).send("ERROR: " + error.message);
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
