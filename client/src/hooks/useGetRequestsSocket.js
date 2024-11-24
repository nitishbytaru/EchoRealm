import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMyFriendRequests } from "../app/slices/userSlice";

export function useGetRequestsSocket(socket) {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Listen for incoming friend requests
    socket.on("friendRequestReceived", (newRequest) => {
      dispatch(setMyFriendRequests(newRequest));
    });

    // Cleanup listener on component unmount
    return () => {
      socket.off("friendRequestReceived");
    };
  }, [dispatch, socket]);
}
