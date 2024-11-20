import mongoose, { Schema, model } from "mongoose";

const echoMumble = new Schema(
  {
    sender: {
      senderId: { type: Schema.Types.ObjectId, ref: "User", default: null },
      username: {
        type: String,
        default: "anonymous",
      },
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const EchoMumble =
  mongoose.models.EchoMumble || model("EchoMumble", echoMumble);