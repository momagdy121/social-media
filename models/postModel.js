import mongoose from "mongoose";
import { calculateLikesAndCommentsPipeline } from "./../Pipelines/PostPipelines.js";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },

    page: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "pages",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.pre("aggregate", function (next) {
  this.pipeline().unshift(...calculateLikesAndCommentsPipeline);

  next();
});

const postModel = mongoose.model("posts", postSchema);
export default postModel;
