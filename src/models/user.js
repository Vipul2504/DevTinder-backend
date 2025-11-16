const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// -------------------- USER SCHEMA -------------------- //
/**
 * User Schema
 * -----------
 * Fields:
 *  - firstName, lastName: Min/Max length enforced for clean data
 *  - email: Unique, required, lowercase, validated using validator.js
 *  - password: Hashed before storing (never save plain text)
 *  - age, gender: Optional profile details
 *
 * Options:
 *  - timestamps: true → adds createdAt & updatedAt automatically
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: 4,
      maxLength: 30,
    },
    lastName: {
      type: String,
      minLength: 4,
      maxLength: 30,
    },
    email: {
      type: String,
      index: true, // improves lookup performance
      required: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Id address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      // ⚠️ Do NOT set minLength here since bcrypt hash is longer
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"], // helps avoid typos in DB
    },
    photoUrl: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL: " + value);
        }
      },
    },
    about: {
      type: String,
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

// -------------------- METHODS -------------------- //

/**
 * Generate JWT for authentication
 * Payload: user._id
 * Expiry: 7 days
 * NOTE: In production, replace hardcoded secret with process.env.JWT_SECRET
 */
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "DevTinder@25", {
    expiresIn: "7d",
  });
  return token;
};

/**
 * Validate password
 * Compares raw user input password with hashed DB password
 */
userSchema.methods.validatePassword = async function (userInputPassword) {
  return await bcrypt.compare(userInputPassword, this.password);
};

// -------------------- MODEL -------------------- //
const User = mongoose.model("User", userSchema);

module.exports = { User };
