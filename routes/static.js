const { Router } = require("express");
const router = Router();

router.get("/faq", (req, res) => {
  res.render("faq", { user: req.user });
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
