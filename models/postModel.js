import mongoose from "mongoose";

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
  this.pipeline().unshift(
    {
      $lookup: {
        from: "comments",
        let: { postId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$post", "$$postId"] } } },
          { $count: "count" },
        ],
        as: "commentsCount",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: { postId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$post", "$$postId"] } } },
          { $count: "count" },
        ],
        as: "likesCount",
      },
    },
    {
      $addFields: {
        // Ensure commentsCount and likesCount are always present
        commentsCount: {
          $ifNull: [{ $arrayElemAt: ["$commentsCount.count", 0] }, 0],
        },
        likesCount: {
          $ifNull: [{ $arrayElemAt: ["$likesCount.count", 0] }, 0],
        },
      },
    }
  );

  next();
});

const postModel = mongoose.model("posts", postSchema);
export default postModel;
