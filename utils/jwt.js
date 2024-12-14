const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  let userId = user._id;
  let userRole = user.role;
  let firstName = user.firstName;
  return jwt.sign(
    { userId, userRole, firstName },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "60m",
      issuer: "Take Exam",
    }
  );
};

const generateRefreshToken = (user) => {
  let userId = user._id;
  let userRole = user.role;
  let firstName = user.firstName;
  return jwt.sign(
    { userId, userRole, firstName },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d", // Longer expiration for refresh tokens
      issuer: "Take Exam",
    }
  );
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
