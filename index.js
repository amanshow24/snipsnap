require('dotenv').config();

const path = require("path");
const fs = require("fs"); // ✅ Added for file system check
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 9000;

// ✅ Ensure public/uploads folder exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ uploads/ folder created");
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected to Atlas"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ✅ Security middlewares
app.use(helmet()); // Sets secure HTTP headers
app.use(mongoSanitize()); // Sanitizes input to prevent NoSQL injection

app.use(checkForAuthenticationCookie("token"));

app.use(express.static(path.resolve("./public")));
app.use(methodOverride('_method'));

// Homepage route
app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).populate("createdBy");

    const welcomeMessage = req.cookies.welcomeMessage;
    const blogCreated = req.cookies.blogCreated;
    const blogDeleted = req.cookies.blogDeleted;
    const logoutMessage = req.cookies.logoutMessage;
    const accountDeleted = req.cookies.accountDeleted;

    // Clear after reading
    res.clearCookie("welcomeMessage");
    res.clearCookie("blogCreated");
    res.clearCookie("blogDeleted");
    res.clearCookie("logoutMessage");
    res.clearCookie("accountDeleted");

    res.render("home", {
      user: req.user,
      blogs: allBlogs,
      welcomeMessage,
      blogCreated,
      blogDeleted,
      logoutMessage,
      accountDeleted,
    });
  } catch (error) {
    console.error("Error loading homepage:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

const staticRoutes = require("./routes/static");
app.use("/", staticRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => console.log(`Server Started at PORT ${PORT}`));
