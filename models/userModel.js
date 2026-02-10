const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  video: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdb",
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    required: true,
    type: String,
    trim: true,
  },
  videos: [videoSchema],
});

const userdb = mongoose.model("userdb", userSchema);

module.exports = userdb;
