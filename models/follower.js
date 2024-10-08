import mongoose from "mongoose";

const followerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

followerSchema.query.populateUser = function () {
  return this.populate({
    path: "user",
    select: "name avatar _id",
  });
};

const followerModel = mongoose.model("followers", followerSchema);
export default followerModel;
