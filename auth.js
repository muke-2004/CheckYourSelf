require("dotenv").config();

const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

function createTokenForUser(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    secret,
  );
}

// Helper Function
function validateTokenForUser(token) {
  if (!token) {
    return null;
  }
  return jwt.verify(token, secret);
}

module.exports = { createTokenForUser, validateTokenForUser };
