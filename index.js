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
const User = require("./models/user");

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
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "https:"],
      },
    },
  })
);
app.use(mongoSanitize()); // Sanitizes input to prevent NoSQL injection

app.use(checkForAuthenticationCookie("token"));

app.use(express.static(path.resolve("./public")));
app.use(methodOverride('_method'));

// Homepage route
app.get("/", async (req, res) => {
  try {
    const { genre, author, sort } = req.query;
    const filter = {};

    if (genre) filter.genre = genre;
    if (author) filter.createdBy = author;

    const blogQuery = Blog.find(filter).populate("createdBy");
    blogQuery.sort(sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 });

    const [allBlogs, genres, authors] = await Promise.all([
      blogQuery.exec(),
      Blog.distinct("genre"),
      User.find({}).select("fullName email").sort({ fullName: 1 }),
    ]);

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
      genres,
      authors,
      filters: {
        genre: genre || "",
        author: author || "",
        sort: sort || "newest",
      },
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

// Health check route
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started on http://0.0.0.0:${PORT}`);
});

// Optional but recommended for Render free tier
server.keepAliveTimeout = 120000;   // 120 seconds
server.headersTimeout = 130000;     // 130 seconds