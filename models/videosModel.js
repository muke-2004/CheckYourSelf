const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  about: {
    type: String,
  },
  description: {
    type: String,
    trim: true,
  },
  unlockAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["locked", "released"],
    default: "released",
  },
  video: {
    type: String,
  },
  videoAfter: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdb",
  },
  posted: {
    type: Boolean,
    default: false,
  },
});

const videosdb = mongoose.model("videosdb", videoSchema);
module.exports = videosdb;
