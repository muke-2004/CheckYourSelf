const { validateTokenForUser } = require("../auth");
const jwt = require("jsonwebtoken");
const userdb = require("../models/userModel");

async function restrictToLoggedInUserOnly(req, res, next) {
  const userUid = req.cookies?.uid;

  if (!userUid) {
    return res.redirect("/login");
  }

  const jwtUser = validateTokenForUser(userUid);

  try {
    const user = await userdb.findById(jwtUser._id);

    if (!user) {
      return res.redirect("/login");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.redirect("/login");
  }
}

module.exports = { restrictToLoggedInUserOnly };
