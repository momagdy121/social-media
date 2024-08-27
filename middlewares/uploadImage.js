import cloudinary from "../config/cloudinary.js";
import apiError from "../Utils/apiError.js";
import { Readable } from "stream";

const uploadImage = (req, res, next) => {
  if (req.file) {
    // Create a readable stream from the file buffer
    const stream = Readable.from(req.file.buffer);

    // Upload the file to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
      },
      (error, result) => {
        if (error) return next(new apiError("Failed to upload the image", 500));

        // Get the URL of the uploaded image
        res.locals.url = result.secure_url;

        // Call next() after the upload is complete and the URL is set
        next();
      }
    );

    // Pipe the stream to the Cloudinary upload stream
    stream.pipe(uploadStream);
  } else {
    // If no file is provided, continue without doing anything
    next();
  }
};

export default uploadImage;
