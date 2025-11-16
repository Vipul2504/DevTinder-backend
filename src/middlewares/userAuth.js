const jwt = require("jsonwebtoken");
const { User } = require("../models/user.js");

/**
 * UserAuth Middleware
 * -------------------
 * Purpose:
 *  - Protects routes by ensuring only logged-in users (valid JWT in cookies) can access.
 *
 * Flow:
 *  1. Extract token from cookies.
 *  2. Verify and decode the JWT.
 *  3. Find user in DB using decoded _id.
 *  4. If valid, attach user object to req.user for downstream usage.
 *  5. If invalid/missing, block request with 401 Unauthorized.
 */
const UserAuth = async (req, res, next) => {
  try {
    // 1. Extract token from cookies
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Unauthorized: No token provided");
    }

    // 2. Verify and decode token
    const decodedData = jwt.verify(token, "DevTinder@25");
    // ⚠️ In production, move secret to process.env.JWT_SECRET

    // 3. Extract user ID from decoded payload
    const { _id } = decodedData;

    // 4. Find user in DB
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User does not exist.");
    }

    // 5. Attach user to request object (for use in controllers/routers)
    req.user = user;

    // ✅ All good → move to next middleware/route
    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    // Send 401 Unauthorized response
    res.status(401).send("Unauthorized: " + error.message);
  }
};

module.exports = { UserAuth };
