import { io } from "socket.io-client";

// Create a socket instance
const socket = io("http://localhost:3000", {
  withCredentials: true,
});

// Add connection event listeners
socket.on("connect", () => {
  console.log("Connected to socket server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from socket server");
});

export default socket;
