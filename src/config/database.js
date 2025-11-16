const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://whoisvipul25:qjZbL3EsVfsv4mHz@learningnode.op27kqd.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
