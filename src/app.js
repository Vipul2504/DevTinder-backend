const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./config/database.js");
const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/auth.js");
const { profileRouter } = require("./routes/profile.js");
const { requestRouter } = require("./routes/request.js");
const userRouter = require("./routes/user.js");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://whoisvipul.in"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
connectDB()
  .then(() => {
    console.log("Database connected");
    app.listen(3000, () => {
      console.log("Server started on 3000");
    });
  })
  .catch((err) => {
    console.log("Failed");
  });
