require("dotenv").config();

const express = require("express");
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
const userdb = require("./models/userModel");
const path = require("path");
const { createTokenForUser } = require("./auth");
const cookieParser = require("cookie-parser");
const { restrictToLoggedInUserOnly } = require("./middleware/auth");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");

// ================== APP SETUP ==================

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(methodOverride("_method"));

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
  return res.render("login");
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
      error: "No user found",
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
  return res.render("signup");
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
  res.send("This is main page");
  //   return res.render("profile");
});

app.get("/profile", restrictToLoggedInUserOnly, (req, res) => {
  // console.log(req.user.videos[0].about);
  return res.render("profile", { user: req.user });
});

app.get("/addnew", restrictToLoggedInUserOnly, (req, res) => {
  return res.render("addnew");
});

app.post(
  "/addnew",
  restrictToLoggedInUserOnly,
  upload.single("video"),
  async (req, res) => {
    // console.log(req.file);
    req.user.videos.push({
      about: req.body.about,
      description: req.body.description,
      remindAt: new Date(req.body.remindAt),
      video: req.file.filename,
      userId: req.user._id,
    });

    console.log(req.user.videos);
    console.log(req.user);

    await req.user.save();
    return res.redirect("profile");
  },
);

app.delete("/delete/:id", restrictToLoggedInUserOnly, async (req, res) => {
  await userdb.updateOne(
    { _id: req.user._id },
    { $pull: { videos: { _id: req.params.id } } },
  );
  // console.log(deletedVideo);
  return res.redirect("/profile");
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server is running on http://localhost:5000`);
});
