import mongoose, { Schema, model } from "mongoose";

const echoLinkSchema = new Schema(
  {
    uniqueChatId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [
      {
        message: {
          type: String,
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
        messageStatus: {
          type: String,
          enum: ["sent", "received", "read"],
          default: "sent",
        },
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
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const EchoLink =
  mongoose.models.EchoLink || model("EchoLink", echoLinkSchema);
