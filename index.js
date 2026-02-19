require("dotenv").config();

const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const multer = require("multer");
const mongoose = require("mongoose");
const userdb = require("./models/userModel");
const videosdb = require("./models/videosModel");
const path = require("path");
const { createTokenForUser } = require("./auth");
const cookieParser = require("cookie-parser");
const { restrictToLoggedInUserOnly } = require("./middleware/auth");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");
const cron = require("node-cron");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const { publicVideodb } = require("./models/publicVideoModel");
const fs = require("fs");

// ================== APP SETUP ==================

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(checkForAuthenticationCookie("uid"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ================== DATABASE ==================
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Mongodb is connected");
  })
  .catch((error) => {
    console.log(`${error}`);
  });

// ================== SOCKET.IO ==================
io.on("connection", (socket) => {
  console.log("new User");
  // socket.on("videoSent", (video) => {
  //   console.log("A new video", video);
  //   io.emit("videoFromServer", video);
  // });
});

// ================== ROUTES ==================
app.get("/login", async (req, res) => {
  return res.render("login", {
    user: req.user,
  });
});

app.post("/login", async (req, res) => {
  // console.log(req.body);
  let user = await userdb
    .findOne({
      email: req.body.email,
    })
    .select("+password");

  if (!user) {
    return res.render("login", {
      error: "No user found ! Try creating an account",
    });
  }

  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password,
  );

  if (!isValidPassword) {
    return res.render("login", {
      error: "Password is incorrect",
    });
  }

  const tokenFromAuthentication = createTokenForUser(user);

  res.cookie("uid", tokenFromAuthentication);

  return res.redirect("profile");
});

app.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.send("One of your inputs are missing Try again");
    }

    let user = new userdb({
      name,
      email,
      password,
    });

    await user.save();

    return res.redirect("/login");
  } catch (err) {
    console.log(`${err} has occured`);
    return res.status(500).send("Error saving user");
  }
});

app.get("/", (req, res) => {
  console.log("This is main page /");
  return res.send("This is main page");
  //   return res.render("profile");
});

app.get("/profile", restrictToLoggedInUserOnly, async (req, res) => {
  // console.log(req.user.videos[0].about);
  // cron.schedule("* * * * * *",
  // // });
  const date = new Date();
  const video = await videosdb.find({ userId: req.user._id });
  // console.log(video);
  // console.log(req.user.videos[0].remindAt);
  return res.render("profile", { videos: video, date: date, user: req.user });
});

app.get("/addnew", restrictToLoggedInUserOnly, (req, res) => {
  return res.render("addnew");
});

app.post(
  "/addnew",
  restrictToLoggedInUserOnly,
  upload.single("video"),
  async (req, res) => {
    const now = new Date();
    const unlockAt = new Date(req.body.unlockAt);

    // console.log(req.file);
    // req.user.videos.push({
    //   about: req.body.about,
    //   description: req.body.description,
    //   unlockAt: unlockAt,
    //   status: unlockAt > now ? "locked" : "released",
    //   video: req.file.filename,
    //   userId: req.user._id,
    // });

    let video = new videosdb({
      about: req.body.about,
      description: req.body.description,
      unlockAt: unlockAt,
      status: "released",
      video: req.file.filename,
      userId: req.user._id,
    });

    // console.log(req.user.videos);
    // console.log(req.user);

    await video.save();
    return res.redirect("/profile");
  },
);

app.delete("/delete/:id", restrictToLoggedInUserOnly, async (req, res) => {
  try {
    // 1️⃣ Find the video first
    // const video = await videosdb.findById(req.params.id);

    // if (!video) {
    //   return res.redirect("/profile");
    // }

    // // 2️⃣ Delete the file if it exists
    // const filePath = path.join(__dirname, "uploads", video.video);

    // fs.unlink(filePath, (err) => {
    //   if (err && err.code !== "ENOENT") {
    //     console.log("Error deleting file:", err);
    //   }
    // });

    // 3️⃣ Delete from database
    await videosdb.findByIdAndDelete(req.params.id);

    res.redirect("/profile");
  } catch (err) {
    console.log("Error deleting video:", err);
    res.redirect("/profile");
  }
});

app.patch("/lock/:id", restrictToLoggedInUserOnly, async (req, res) => {
  // console.log("request accepted");

  await videosdb.updateOne(
    { _id: req.params.id },
    {
      $set: {
        status: "locked",
      },
    },
  );

  return res.redirect("/profile");
});

app.get("/logout", (req, res) => {
  res.clearCookie("uid");
  res.redirect("/login");
});

app.get("/public/:id", (req, res) => {
  return res.render("public", { id: req.params.id });
});

app.post("/public/:id", upload.single("video"), async (req, res) => {
  const updatedVideo = await videosdb.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { videoAfter: req.file.filename } },
    { new: true },
  );
  // console.log(updatedVideo);

  const video = new publicVideodb({
    oldVideo: updatedVideo.video,
    newVideo: updatedVideo.videoAfter,
  });

  await video.save();

  const updated = await videosdb.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { posted: true } },
    { returnDocument: "after" },
  );

  // console.log(updated.posted);

  io.emit("videoFromServer", video);

  // console.log(video.oldVideo);
  // console.log(video.newVideo);

  return res.redirect("/profile");
});

app.get("/publicchat", async (req, res) => {
  // const posts = await publicVideodb.find().sort({ createdAt: -1 });
  // res.json(posts);
  return res.render("publicchat");
});

app.get("/api/public-feed", async (req, res) => {
  const posts = await publicVideodb.find().sort({ createdAt: -1 });
  res.json(posts);
});

cron.schedule("*/30 * * * * * ", async () => {
  const date = new Date();

  await videosdb.updateMany(
    {
      status: "locked",
      unlockAt: { $lte: date },
    },
    {
      $set: { status: "released" },
    },
  );
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`server is running on http://localhost:5000`);
});
