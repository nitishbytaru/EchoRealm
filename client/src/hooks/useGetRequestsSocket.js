import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMyFriendRequests } from "../app/slices/userSlice";
import { addToMumbles } from "../app/slices/echoMumbleSlice";

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
