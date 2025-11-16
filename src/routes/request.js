// routes/requestRouter.js
const express = require("express");
const requestRouter = express.Router();

const { UserAuth } = require("../middlewares/userAuth.js"); // middleware that attaches req.user
const { User } = require("../models/user.js");
const ConnectionRequest = require("../models/connectionRequest.js"); // ✅ Correct import

// @route   POST /request/send/:status/:toUserId
// @desc    Send a connection request (ignored/interested)
// @access  Private (requires login)
requestRouter.post(
  "/request/send/:status/:toUserId",
  UserAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id; // sender
      const toUserId = req.params.toUserId; // receiver
      const status = req.params.status.toLowerCase();

      // ✅ Only these 2 are allowed when sending (accept/reject handled separately)
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid status");
      }

      // ✅ Ensure target user exists
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).send("User not found");
      }

      // ✅ Prevent duplicate requests (both directions)
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        return res
          .status(400)
          .send({ message: "Connection request already exists" });
      }

      // ✅ Create and save new request
      const newRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await newRequest.save();

      res.json({
        message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  UserAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ messaage: "Status not allowed!" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

module.exports = { requestRouter };
