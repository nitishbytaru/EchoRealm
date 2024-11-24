import { useEffect } from "react";

export function useJoinRoomSocket(socket, user) {
  useEffect(() => {
    if (user) {
      socket.emit("joinMyPersonalRoom", user?._id);
    }
  }, [socket, user]);
}
