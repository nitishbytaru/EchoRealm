import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/features/user/models/user.model.js";
import { EchoLink } from "../src/features/echoLink/models/echo_link.model.js";
import { GroupChatRoom } from "../src/features/echoLink/models/group_chat_room.model.js";

async function test() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected!");

    // Find any user
    const user = await User.findOne();
    console.log("Found user:", user ? user.username : "None");

    if (user) {
      const userId = user._id;
      console.log("Testing getMyPrivateFriends query for user:", userId);

      // GroupChatRoom query
      const groupChats = await GroupChatRoom.find({
        groupChatRoomMembers: { $in: [userId] },
      })
        .populate({
          path: "groupChatRoomMembers",
          select: "username",
        })
        .populate({
          path: "admin",
          select: "username",
        });
      console.log("Group chats count:", groupChats.length);

      // EchoLink query with regex
      const myPrivateChatRooms = await EchoLink.find({
        uniqueChatId: { $regex: user._id.toString() },
      });
      console.log("Private chat rooms count:", myPrivateChatRooms.length);
      
      // Let's test with ObjectId regex to see if it throws!
      try {
        console.log("Testing with ObjectId regex...");
        await EchoLink.find({
          uniqueChatId: { $regex: userId },
        });
        console.log("ObjectId regex succeeded (unexpected)!");
      } catch (err) {
        console.error("ObjectId regex failed (expected!):", err.message);
      }
    }

    console.log("Test finished successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  }
}

test();
