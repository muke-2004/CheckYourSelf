require("dotenv").config();

const express = require("express");
const app = express();
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
    return res.redirect("profile");
  },
);

app.delete("/delete/:id", restrictToLoggedInUserOnly, async (req, res) => {
  await videosdb.findByIdAndDelete({ _id: req.params.id });
  // console.log(deletedVideo);
  return res.redirect("/profile");
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
app.listen(port, () => {
  console.log(`server is running on http://localhost:5000`);
});

// let dates = new Date();
// let date = new Date("2026-02-15T07:14:00.000Z");

// console.log(dates > date);
// console.log(dates < date);
// console.log(dates == date);
