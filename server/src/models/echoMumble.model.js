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
    mumbleStatus: {
      type: String,
      enum: ["sent", "read"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

echoMumble.index({ receiver: 1 });

export const EchoMumble =
  mongoose.models.EchoMumble || model("EchoMumble", echoMumble);
