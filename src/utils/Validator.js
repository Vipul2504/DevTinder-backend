const validator = require("validator");

/**
 * ValidateSignUpData
 * ------------------
 * Purpose: Validates signup request data.
 * Checks:
 *  1. firstName and lastName must exist.
 *  2. email must be valid.
 *  3. password must be strong.
 * Throws error if any condition fails.
 */
const ValidateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Enter a firstName and lastName");
  } else if (!validator.isEmail(email)) {
    throw new Error("Not a valid email");
  } else if (!validator.isStrongPassword(password)) {
    // Strong = min 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 symbol
    throw new Error("Create a stronger password");
  }
};

/**
 * validateEditProfileData
 * -----------------------
 * Purpose: Restricts which fields a user can edit.
 * Allowed fields: firstName, lastName, age, email.
 *
 * Steps:
 *  1. Take keys from request body (fields user wants to update).
 *  2. Check if every key is in the list of allowed fields.
 *  3. Return true if valid, false otherwise.
 */
// Accepts only the update object (not full req)
const validateEditProfileData = (data) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "age",
    "gender",
    "about",
    "skills",
  ];

  // Check that every field in data is allowed
  return Object.keys(data).every((field) => allowedEditFields.includes(field));
};

module.exports = { ValidateSignUpData, validateEditProfileData };
