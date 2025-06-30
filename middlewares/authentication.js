const { validateToken } = require("../services/authentication");
const User = require("../models/user");

function checkForAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) return next();

    try {
      const userPayload = validateToken(tokenCookieValue);
      const user = await User.findById(userPayload._id); // ✅ full user
      req.user = user; // ✅ not just payload
    } catch (error) {
      console.error("Token validation failed:", error.message);
    }

    return next();
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
