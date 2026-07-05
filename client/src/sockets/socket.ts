import { io, Socket } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

const socket: Socket = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: false, // In Next.js, it's better to manually connect in a provider/hook or only on client-side
});

export default socket;
