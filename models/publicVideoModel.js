const mongoose = require("mongoose");

const publicVideoSchema = new mongoose.Schema(
  {
    oldVideo: {
      type: String,
    },
    newVideo: {
      type: String,
    },
  },
  { timestamps: true },
);

const publicVideodb = new mongoose.model("publicVideodb", publicVideoSchema);
module.exports = { publicVideodb };
