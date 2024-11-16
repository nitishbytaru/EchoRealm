import mongoose, { Schema, model } from "mongoose";

const echoWhisper = new Schema(
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
    showOthers: {
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

export const EchoWhisper =
  mongoose.models.EchoWhisper || model("EchoWhisper", echoWhisper);
