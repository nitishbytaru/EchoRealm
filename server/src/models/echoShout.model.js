import mongoose, { Schema, model } from "mongoose";

const echoShout = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attachments: [
      {
        publicId: {
          type: String,
          default: null,
        },
        url: {
          type: String,
          default: null,
        },
      },
    ],
    message: {
      type: String,
      required: true,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messageStatus: {
      type: String,
      enum: ["sent", "received", "read"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

export const EchoShout =
  mongoose.models.EchoShout || model("EchoShout", echoShout);
