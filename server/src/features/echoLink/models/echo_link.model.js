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
        sender: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        receiver: {
          receiverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          messageStatus: {
            type: String,
            enum: ["sent", "read"],
            default: "sent",
          },
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
    latestMessage: {
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
      sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      receiver: {
        receiverId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        messageStatus: {
          type: String,
          enum: ["sent", "read"],
          default: "sent",
        },
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
  },
  {
    timestamps: true,
  }
);

export const EchoLink =
  mongoose.models.EchoLink || model("EchoLink", echoLinkSchema);
