const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const videoSchema = new mongoose.Schema({
  about: {
    type: String,
  },
  description: {
    type: String,
  },
  remindAt: {
    type: Date,
  },
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
    select: false,
  },
  videos: [videoSchema],
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

const userdb = mongoose.model("userdb", userSchema);

module.exports = userdb;
