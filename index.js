require("dotenv").config();

const express = require("express");
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
const userdb = require("./models/userModel");
const path = require("path");

// ================== APP SETUP ==================

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
  res.render("login");
});

app.post("/login", async (req, res) => {
  // console.log(req.body);
  let user = userdb.findById({ email: req.body.email });

  res.render("profile", { user });
});

app.get("/signup", (req, res) => {
  res.redirect("login");
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

    return res.render("profile", { user });
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

app.get("/profile", (req, res) => {
  return res.render("profile");
});

app.get("/addnew", (req, res) => {
  return res.render("addnew");
});

app.post("/addnew", upload.single("video"), (req, res) => {
  // console.log(req.file);

  return res.render("profile", { video: req.file });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server is running on http://localhost:5000`);
});
