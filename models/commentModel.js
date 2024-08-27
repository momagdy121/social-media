import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },

  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "posts",
    required: true,
  },
});

const commentModel = mongoose.model("comments", commentSchema);
export default commentModel;
