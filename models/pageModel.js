import mongoose from "mongoose";
import followerModel from "./follower.js";

const pageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  image: {
    type: String,
  },

  cover: {
    type: String,
  },

  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],

  pendingAdminRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
});

const pageModel = mongoose.model("pages", pageSchema);
export default pageModel;
