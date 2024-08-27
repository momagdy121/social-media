import express from "express";
import { likeAndUnlike, getLikes } from "../controllers/likeController.js";
import verifyAccessToken from "../middlewares/authValidation/verifyAccessToken.js";

const likeRouter = express.Router({ mergeParams: true });

likeRouter.use(verifyAccessToken);

likeRouter.route("/").post(likeAndUnlike).get(getLikes);

export default likeRouter;
