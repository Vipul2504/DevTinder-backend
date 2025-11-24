const dotenv = require("dotenv");
dotenv.config();
const { SESClient } = require("@aws-sdk/client-ses");

// Set the AWS Region.
const REGION = process.env.REGION;
// Create SES service object.
const sesClient = new SESClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET,
  },
});

console.log("SES LOADED WITH:", {
  accessKey: process.env.AWS_ACCESS_KEY,
  secretKey: process.env.AWS_SES_SECRET,
});

console.log("coneected REGION");

module.exports = { sesClient };
