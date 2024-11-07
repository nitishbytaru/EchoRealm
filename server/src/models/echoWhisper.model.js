import mongoose, { Schema, model } from "mongoose";

const echoWhisper = new Schema(
  {
    sender: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

export const EchoWhisper =
  mongoose.models.EchoWhisper || model("EchoWhisper", echoWhisper);
