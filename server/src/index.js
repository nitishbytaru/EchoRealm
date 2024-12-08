import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./config/db/index.js";
import { createServer } from "http";
import { Server } from "socket.io";

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with CORS configuration
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Socket connections
io.on("connection", (socket) => {
  //This is the soket connections for the ECHOLINK
  socket.on("joinEchoLink", (uniqueRoomId) => {
    socket.join(uniqueRoomId);
  });

  socket.on("joinGroupChat", (_id) => {
    console.log(`joined group ${_id}`);
    socket.join(_id);
  });

  socket.on("joinMyPersonalRoom", (myRoomId) => {
    socket.join(myRoomId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Database connections
connectDB()
  .then(() => {
    // Listen on httpServer instead of app
    httpServer.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
