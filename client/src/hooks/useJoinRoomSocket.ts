import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useJoinRoomSocket(socket: Socket, user: any) {
  useEffect(() => {
    if (user && socket) {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("joinMyPersonalRoom", user?._id);
    }
  }, [socket, user]);
}
