require("dotenv").config();

const express = require("express");
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
const userdb = require("./models/userModel");
// ================== APP SETUP ==================
app.set("view engine", "ejs");

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
// app.get("/login", login);
app.get("/signup", (req, res) => {
  res.render("signup");
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
  console.log(req.file.filename);
  // console.log(req.body);
  // const user = new userdb({

  // });

  return res.render("profile");
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server is running on http://localhost:5000`);
});
