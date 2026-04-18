const {Schema, model} = require("mongoose");

const blogSchema = new Schema ({

    title: {
       type: String ,
       required : true,
       maxlength: 60,
    },
    body: {
       type: String ,
       required : true,
        maxlength: 25000,
    },
    genre: {
       type: String,
       required: [true, "Genre is required"],
       trim: true,
       maxlength: 50,
    },
    coverImageURL: {
       type: String ,
       required : false,
    },
    createdBy: {
       type: Schema.Types.ObjectId,
       ref: "user",
    },
likes: [{ type: Schema.Types.ObjectId, ref: "user" }],


}, { timestamps : true });


const Blog = model("blog", blogSchema);
module.exports = Blog;