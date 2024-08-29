import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import rule from "../Utils/rules.js";
import generateOTP from "../services/mailService/generateOTP.js";
import sendVC from "../services/mailService/verificationMail.js";

const { isEmail } = validator;
const { hash, compare } = bcryptjs;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      trim: true,
      type: String,
      unique: [true, "this email is used"],
      required: true,
      lowercase: true,
      validate: [isEmail, "not valid email"],
    },
    username: {
      type: String,
      unique: [true, "this username is already used"],
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    avatar: {
      type: String,
      required: false,
      default: null,
    },
    cover: {
      type: String,
      required: false,
      default: null,
    },
    city: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    website: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    bio: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },

    followingPages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pages",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],

    pendingRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],

    rule: {
      type: String,
      enum: {
        values: [rule.ADMIN, rule.USER, rule.OWNER],
      },
      default: rule.USER, // Default value for rule
    },

    verified: {
      type: Boolean,
      default: false,
    },
    changePassAt: { type: Date, default: undefined },
    accessTokenCreatedAt: { type: Number, default: undefined },
    refreshTokenCreatedAt: { type: Number, default: undefined },
    hashedCode: String,
    codeExpired: Date,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

userSchema.statics.findByName = function (query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
    ],
  });
};

userSchema.query.selectBasicInfo = function () {
  return this.select("name username avatar _id");
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 12);
    this.changePassAt = Math.floor(Date.now() / 1000);
  }
  if (this.isNew) {
    this.rule = rule.USER;
    this.verified = false;
    const OTP = await this.createOTP();
    await sendVC(this.email, OTP);
  }

  next();
});

userSchema.methods.comparePassword = async function (inputPass, dbPassword) {
  return await compare(inputPass, dbPassword);
};

userSchema.methods.createOTP = async function () {
  const OTP = generateOTP();

  this.hashedCode = await hash(OTP, 12);

  this.codeExpired = Date.now() + 10 * 60 * 1000; // expire after 10 minutes

  return OTP;
};

userSchema.methods.compareOTPs = async function (inputCode, DBcode) {
  return await compare(inputCode, DBcode);
};
const userModel = mongoose.model("users", userSchema);
export default userModel;
