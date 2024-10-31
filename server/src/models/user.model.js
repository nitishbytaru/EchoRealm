import mongoose, { Schema, model } from "mongoose";
import { hash } from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      publicId: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    isAcceptingWhispers: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await hash(this.password, 10);
// });

export const User = mongoose.models.User || model("User", userSchema);
