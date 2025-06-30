const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve("./public/uploads/"));
    },
    filename: function (req, file, cb) {
     const fileName = `${Date.now()}-${file.originalname}`;
     cb(null, fileName);
    }
  })
  
  const upload = multer({ storage: storage })

  

router.get("/add-new", (req,res) => {
    return res.render("addBlog",{
        user:req.user,
    })
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


router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    if (!req.user) return res.status(401).send("Unauthorized");

    const { title, body } = req.body;

   await Blog.create({
  title,
  body,
  createdBy: req.user._id,
  coverImageURL: req.file ? `/uploads/${req.file.filename}` : null,
});

res
  .cookie("blogCreated", "Your blog has been posted successfully!", { maxAge: 5000 })
  .redirect("/");

  } catch (error) {
    console.error("Blog Creation Error:", error.message);
    return res.status(500).send("An error occurred while creating the blog. Once check the length of the title.");
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