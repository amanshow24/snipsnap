const { Router } = require("express");
const multer = require("multer");
const CloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const PREDEFINED_GENRES = [
  "Technology",
  "Travel",
  "Lifestyle",
  "Education",
  "Health",
  "Business",
  "Food",
  "Entertainment",
  "Sports",
  "Science",
  "Personal",
];

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = CloudinaryStorage({
  cloudinary,
  folder: "snipsnap/blog-covers",
  allowedFormats: ["jpg", "jpeg", "png", "webp"],
});

const upload = multer({ storage });

function uploadCoverImage(req, res, next) {
  const middleware = upload.single("coverImage");
  middleware(req, res, (err) => {
    if (err) {
      console.error("Cover image upload failed:", err.message || err);
      return res.status(400).render("addBlog", {
        user: req.user,
        genres: PREDEFINED_GENRES,
        errorMessage: "Image upload failed. Please verify Cloudinary settings and image format.",
        formData: req.body || {},
      });
    }
    return next();
  });
}

  

router.get("/add-new", (req,res) => {
    return res.render("addBlog",{
        user:req.user,
        genres: PREDEFINED_GENRES,
    errorMessage: null,
    formData: {},
    });
});

router.get("/:id/edit", async (req, res) => {
  try {
    if (!req.user) return res.status(401).send("Unauthorized");

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to edit this blog");
    }

    return res.render("editBlog", {
      user: req.user,
      blog,
      genres: PREDEFINED_GENRES,
    });
  } catch (error) {
    console.error("Error loading edit blog page:", error.message);
    return res.status(500).send("Unable to load edit page");
  }
});



router.get("/:id", async (req, res) => {
  try {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send("Invalid Blog Id");
    }

    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");

    const commentAdded = req.cookies.commentAdded;
    res.clearCookie("commentAdded"); // Clear it so it doesn't repeat

   return res.render("blog", {
  user: req.user,
  blog,
  comments,
  commentAdded,
  request: req, // <-- this allows access to request.originalUrl inside EJS
});

  } catch (error) {
    return res.status(500).send("An error occurred while fetching the blog.");
  }
});




router.post("/comment/:blogId", async(req,res)=> {
    try{
        await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
    
        });
   return res
  .cookie("commentAdded", "Your comment was added!", { maxAge: 5000 })
  .redirect(`/blog/${req.params.blogId}`);



    } catch(error){
       
        return res
  .cookie("commentAdded", "Your comment was added!", { maxAge: 5000 })
  .redirect(`/blog/${req.params.blogId}`);

    }

})

/*
router.post("/", upload.single("coverImage"), async (req,res) => {
    try {
        const { title, body } = req.body ;
        await Blog.create({
            body,
            title,
            createdBy: req.user._id,
            coverImageURL:`/uploads/${req.file.filename}`,
            
        });
        return res.redirect("/");

    } catch (error) {
        
        return res.status(500).send("An error occurred while creating the blog.");

    } 

});  */


router.post("/", uploadCoverImage, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).render("addBlog", {
        user: req.user,
        genres: PREDEFINED_GENRES,
        errorMessage: "Please sign in first.",
        formData: req.body || {},
      });
    }

    const { title, body, genre, customGenre } = req.body;
    const finalGenre = genre === "other" ? (customGenre || "").trim() : genre;

    if (!finalGenre) {
      return res.status(400).render("addBlog", {
        user: req.user,
        genres: PREDEFINED_GENRES,
        errorMessage: "Genre is required.",
        formData: req.body,
      });
    }

   const uploadedImageUrl = req.file?.path || req.file?.secure_url || req.file?.url || null;

  await Blog.create({
      title,
      body,
      genre: finalGenre,
      createdBy: req.user._id,
    coverImageURL: uploadedImageUrl,
    });

    res
      .cookie("blogCreated", "Your blog has been posted successfully!", { maxAge: 5000 })
      .redirect("/");

  } catch (error) {
    console.error("Blog Creation Error:", error.message);
    return res.status(500).render("addBlog", {
      user: req.user,
      genres: PREDEFINED_GENRES,
      errorMessage: "An error occurred while creating the blog. Please check your inputs and Cloudinary setup.",
      formData: req.body,
    });
  }
});

router.put("/:id", uploadCoverImage, async (req, res) => {
  try {
    if (!req.user) return res.status(401).send("Unauthorized");

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to edit this blog");
    }

    const { title, body, genre, customGenre } = req.body;
    const finalGenre = genre === "other" ? (customGenre || "").trim() : (genre || "").trim();

    if (!finalGenre) return res.status(400).send("Genre is required.");

    blog.title = title;
    blog.body = body;
    blog.genre = finalGenre;

    if (req.file) {
      blog.coverImageURL = req.file.path || req.file.secure_url || req.file.url || blog.coverImageURL;
    }

    await blog.save();

    return res
      .cookie("blogCreated", "Your blog has been updated successfully!", { maxAge: 5000 })
      .redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Blog Update Error:", error.message);
    return res.status(500).send("An error occurred while updating the blog.");
  }
});


//delete blog
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to delete this blog");
    }

  await Blog.findByIdAndDelete(req.params.id);
await Comment.deleteMany({ blogId: req.params.id });

res
  .cookie("blogDeleted", "🗑️ Blog deleted successfully!", { maxAge: 5000 })
  .redirect("/");

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

//like and unlike in a blog
router.post("/:id/like", async (req, res) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  const blogId = req.params.id;
  const userId = req.user._id;

  const blog = await Blog.findById(blogId);

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  const liked = blog.likes.includes(userId);

  if (liked) {
    // Remove like
    blog.likes.pull(userId);
  } else {
    // Add like
    blog.likes.push(userId);
  }

  await blog.save();

  //return res.redirect(`/blog/${blogId}`);
  //return res.redirect("back");
  return res.redirect(req.body.redirectBack || "/");

  
 // return res.redirect(req.body.redirect || "/");



});


// Like and Unlike a Comment
router.post("/comment/:id/like", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized");

  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).send("Comment not found");

    const alreadyLiked = comment.likes.includes(req.user._id);

    if (alreadyLiked) {
      comment.likes.pull(req.user._id); // Unlike
    } else {
      comment.likes.push(req.user._id); // Like
    }

    await comment.save();

    return res.redirect(req.body.redirectBack || "/");

   // return res.redirect("back");
   //return res.redirect(`/blog/${comment.blogId}#comment-${comment._id}`);


  } catch (err) {
    console.error("Error liking comment:", err);
    return res.status(500).send("Something went wrong");
  }
});




module.exports = router;