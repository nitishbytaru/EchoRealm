import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMyFriendRequests } from "../features/profile/slices/user.slice.js";
import { addToMumbles } from "../features/echoMumble/slices/echo_mumble.slice.js";

export function useGetRequestsSocket(socket) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for incoming friend requests
    socket.on("friendRequestReceived", (newRequest) => {
      dispatch(setMyFriendRequests(newRequest));
    });

    //Listen for inoming new mumbles
    socket.on("New_mumble_sent", (newMumble) => {
      dispatch(addToMumbles(newMumble));
    });

    // Cleanup listener on component unmount
    return () => {
      socket.off("friendRequestReceived");
    };
  }, [dispatch, socket]);
}
