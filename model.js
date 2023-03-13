const mongoose = require("mongoose");
const workerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    wages: {
      type: Number,
      // required: true,
    },
  },
  {
    versionKey: false,
    strict: false,
  }
);

module.exports = mongoose.model("Worker", workerSchema);
