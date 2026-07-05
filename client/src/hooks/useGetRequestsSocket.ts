import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Socket } from "socket.io-client";
import { setMyFriendRequests } from "@/store/slices/user.slice";
import { addToMumbles } from "@/store/slices/echo_mumble.slice";

export function useGetRequestsSocket(socket: Socket) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming friend requests
    socket.on("friendRequestReceived", (newRequest: any) => {
      dispatch(setMyFriendRequests(newRequest));
    });

    //Listen for incoming new mumbles
    socket.on("New_mumble_sent", (newMumble: any) => {
      dispatch(addToMumbles(newMumble));
    });

    // Cleanup listener on component unmount
    return () => {
      socket.off("friendRequestReceived");
      socket.off("New_mumble_sent");
    };
  }, [dispatch, socket]);
}
