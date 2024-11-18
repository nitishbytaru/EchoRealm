import mongoose, { Schema, model } from "mongoose";

const echoShout = new Schema(
  {
    sender: {
      type: String,
      default: "anonymous",
      index: true,
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
        index: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for sorting by createdAt
echoShout.index({ createdAt: 1 });

export const EchoShout =
  mongoose.models.EchoShout || model("EchoShout", echoShout);
