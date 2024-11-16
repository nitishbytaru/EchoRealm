import mongoose, { Schema, model } from "mongoose";

const echoWhisper = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    showOthers: {
      type: Boolean,
      default: false,
    },
    senderUsername: {
      type: String,
      default: "anonymous",
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

export const EchoWhisper =
  mongoose.models.EchoWhisper || model("EchoWhisper", echoWhisper);
