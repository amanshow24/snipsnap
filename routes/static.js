const { Router } = require("express");
const Message = require("../models/message");
const router = Router();

router.get("/faq", (req, res) => {
  res.render("faq", { user: req.user });
});

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.render("contact", {
      user: req.user,
      errorMessage: "Please fill in all fields before sending your message.",
      successMessage: null,
    });
  }

  try {
    await Message.create({ name, email, message });
    return res.render("contact", {
      user: req.user,
      successMessage: "Thank you! Your message has been received.",
      errorMessage: null,
    });
  } catch (err) {
    console.error("Contact message save failed:", err);
    let errorMessage = "Unable to send your message right now. Please try again later.";
    if (err.name === "ValidationError") {
      errorMessage = Object.values(err.errors)
        .map((error) => error.message)
        .join(" ");
    }
    return res.render("contact", {
      user: req.user,
      errorMessage,
      successMessage: null,
    });
  }
});


router.get("/contact", (req, res) => {
  res.render("contact", { user: req.user });
});

router.get("/about", (req, res) => {
  res.render("about", { user: req.user });
});

router.get("/team", (req, res) => {
  res.render("team", { user: req.user });
});

router.get("/privacy", (req, res) => {
  res.render("privacy", { user: req.user });
});

router.get("/terms", (req, res) => {
  res.render("terms", { user: req.user });
});


module.exports = router;
