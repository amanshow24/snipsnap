const { Router } = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const bcrypt = require("bcrypt");
const { sendOTPEmail } = require("../services/sendMail");
const { createTokenForUser } = require("../services/authentication");

const router = Router();

// ========== AUTH ROUTES ==========

// Sign In
router.get("/signin", (req, res) => {
  res.render("signin");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res
      .cookie("token", token)
      .cookie("welcomeMessage", "Welcome back! ❤️", { maxAge: 5000 })
      .redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect email or password",
    });
  }
});

// Sign Up Flow: Step 1 - email only
router.get("/signup", (req, res) => {
  res.render("signup-email", { errorMessage: null });
});

router.post("/signup-email", async (req, res) => {
  const { email } = req.body;

  let user = await User.findOne({ email });

  // ✅ Case 1: User exists & is fully registered → Block
  if (user && user.fullName && user.password) {
    return res.render("signup-email", {
      errorMessage: "Email already in use",
    });
  }

  // ✅ Case 2: Incomplete user exists → refresh OTP & reuse
  if (user) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpUsed = false;

    await user.save();
    await sendOTPEmail(email, otp, "signup");

    return res.redirect(`/user/verify-signup?email=${encodeURIComponent(email)}`);
  }

  // ✅ Case 3: No user exists → create new temporary user
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const tempUser = new User({
    email,
    otp: hashedOtp,
    otpExpiry: Date.now() + 5 * 60 * 1000,
    otpUsed: false,
  });

  await tempUser.save();
  await sendOTPEmail(email, otp, "signup");

  return res.redirect(`/user/verify-signup?email=${encodeURIComponent(email)}`);
});



// Sign Up Flow: Step 2 - OTP + full form
router.get("/verify-signup", (req, res) => {
  res.render("verify-signup", {
    email: req.query.email,
    errorMessage: null,
  });
});

router.post("/verify-signup", async (req, res) => {
  const { email, otp, fullName, password } = req.body;

 const user = await User.findOne({ email }).select("+otp +otpExpiry +otpUsed");

  if (
    !user ||
    !user.otp ||
    !user.otpExpiry ||
    Date.now() > user.otpExpiry ||
    user.otpUsed
  ) {
    return res.render("verify-signup", {
      email,
      errorMessage: "OTP expired or invalid.",
    });
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    return res.render("verify-signup", {
      email,
      errorMessage: "Incorrect OTP. Please try again.",
    });
  }

  try {
    user.fullName = fullName;
    user.password = password;
    user.otpUsed = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = createTokenForUser(user);
    return res
      .cookie("token", token)
      .cookie("welcomeMessage", `Welcome, ${user.fullName}!`, { maxAge: 5000 })
      .redirect("/");
  } catch (err) {

     let errorMsg = "Something went wrong. Try again.";
  if (err.name === "ValidationError") {
    errorMsg = Object.values(err.errors).map(e => e.message).join("<br>");
  }
    return res.render("verify-signup", {
    email,
    errorMessage: errorMsg

    });
  }
});

router.post("/resend-signup-otp", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select("+otp +otpExpiry +otpUsed");


  if (!user) {
    return res.render("verify-signup", {
      email,
      errorMessage: "No user found for this email.",
    });
  }

  if (user.otpExpiry && Date.now() < user.otpExpiry - 4 * 60 * 1000) {
    return res.render("verify-signup", {
      email,
      errorMessage: "⏱️ Please wait before requesting OTP again.",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  user.otp = hashedOtp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  user.otpUsed = false;
  await user.save();

  await sendOTPEmail(email, otp, "signup"); // ✅ Signup OTP Email
  return res.redirect(`/user/verify-signup?email=${encodeURIComponent(email)}`);
});

// ========== LOGOUT ==========
router.get("/logout", (req, res) => {
  res
    .clearCookie("token")
    .cookie("logoutMessage", "👋 Logged out successfully!", { maxAge: 5000 })
    .redirect("/");
});

// ========== ACCOUNT DELETE ==========
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).send("Unauthorized");
  next();
}

router.delete("/account/delete", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    await Blog.deleteMany({ createdBy: userId });
    await Comment.deleteMany({ createdBy: userId });
    await Blog.updateMany({}, { $pull: { likes: userId } });
    await Comment.updateMany({}, { $pull: { likes: userId } });
    await User.findByIdAndDelete(userId);

    return res
      .clearCookie("token")
      .cookie("accountDeleted", "🗑️ Account deleted successfully!", { maxAge: 5000 })
      .redirect("/");
  } catch (err) {
    console.error("Error deleting account:", err);
    return res.status(500).send("Failed to delete account.");
  }
});

// ========== FORGOT PASSWORD FLOW ==========
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { errorMessage: null });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.render("forgot-password", { errorMessage: "No account found with this email" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await User.updateOne(
    { email },
    {
      $set: {
        otp: hashedOtp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
        otpUsed: false,
      },
    }
  );

  try {
    await sendOTPEmail(email, otp); // ✅ Default: Password reset OTP
    return res.redirect("/user/reset-password?email=" + encodeURIComponent(email));
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.render("forgot-password", {
      errorMessage: "Failed to send OTP. Try again later.",
    });
  }
});

router.get("/reset-password", (req, res) => {
  res.render("reset-password", {
    email: req.query.email,
    errorMessage: null,
    
  });
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email }).select("+otp +otpExpiry +otpUsed");


  if (!user || !user.otp || user.otpUsed || !user.otpExpiry || Date.now() > user.otpExpiry) {
    return res.render("reset-password", {
      email,
      errorMessage: "OTP expired or invalid",
    });
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    return res.render("reset-password", {
      email,
      errorMessage: "Incorrect OTP",
    });
  }

  try {
    user.password = newPassword;
    user.otpUsed = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = createTokenForUser(user);
    res
      .cookie("token", token)
      .cookie("welcomeMessage", "🔐 Password reset successful. You're now logged in!", { maxAge: 5000 })
      .redirect("/");
  } catch (err) {
    let errorMsg = "Something went wrong. Try again.";
    if (err.name === "ValidationError") {
      errorMsg = Object.values(err.errors).map(e => e.message).join("<br>");
    }
    return res.render("reset-password", {
      email,
      errorMessage: errorMsg
    });
  }
});

router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select("+otp +otpExpiry +otpUsed");


  if (!user) {
    return res.render("reset-password", {
      email,
      errorMessage: "No account found with this email",
    });
  }

  if (user.otpExpiry && Date.now() < user.otpExpiry - 4 * 60 * 1000) {
    return res.render("reset-password", {
      email,
      errorMessage: "⏱️ Please wait before requesting OTP again.",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await User.updateOne(
    { email },
    {
      $set: {
        otp: hashedOtp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
        otpUsed: false,
      },
    }
  );

  try {
    await sendOTPEmail(email, otp); // ✅ Default: Password reset OTP
    return res.redirect("/user/reset-password?email=" + encodeURIComponent(email));
  } catch (error) {
    console.error("Resend OTP failed:", error);
    return res.render("reset-password", {
      email,
      errorMessage: "Failed to resend OTP. Try again.",
    });
  }
});

module.exports = router;
