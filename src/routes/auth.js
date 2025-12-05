const express = require("express");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

const { ValidateSignUpData } = require("../utils/Validator");
const { User } = require("../models/user.js");

// ---------------- SIGNUP ----------------
// Route: POST /signup
// Purpose: Create a new user account
// Steps:
//  1. Validate input data (name, email, password).
//  2. Hash password before saving (NEVER store raw passwords).
//  3. Save user in MongoDB.
//  4. Return success message.
authRouter.post("/signup", async (req, res) => {
  try {
    ValidateSignUpData(req);

    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      about,
      photoUrl,
      skills,
    } = req.body;

    // Hash the password with bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash, // store hashed password
      age,
      gender,
      about,
      photoUrl,
      skills,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      age: savedUser.age,
      gender: savedUser.gender,
      about: savedUser.about,
      photoUrl: savedUser.photoUrl,
      skills: savedUser.skills,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(400).send("ERROR Message : " + error.message);
  }
});

// ---------------- LOGIN ----------------
// Route: POST /login
// Purpose: Authenticate user and issue JWT token
// Steps:
//  1. Find user by email.
//  2. Compare provided password with stored hashed password.
//  3. If valid, generate JWT and set it in an HTTP-only cookie.
//  4. Return success message.
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credential (user not found)");
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid Credential (wrong password)");
    }

    // Generate JWT token (7 days validity set in model method)
    const token = await user.getJWT();

    // Store JWT inside cookie
    // httpOnly = true → cannot be accessed via JS (more secure)
    // secure = true  → cookie only sent over HTTPS (use in production)
    // sameSite = "strict" → helps prevent CSRF attacks
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // ⚠️ set to true in production (HTTPS)
      sameSite: "none",
    });

    res.send(user);
    console.log("Login successful");
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(401).send("ERROR Message : " + error.message);
  }
});

// ---------------- LOGOUT ----------------
// Route: POST /logout
// Purpose: Clear JWT cookie so user is logged out
// Steps:
//  1. Clear the "token" cookie from client.
//  2. Return success message.
authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // ⚠️ set to true in production (HTTPS)
    sameSite: "none",
  });
  res.send("Logout successful");
});

module.exports = { authRouter };
