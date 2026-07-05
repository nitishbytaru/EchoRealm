import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyFriendRequestsApi } from "@/api/friends.api";
import { setUnReadMumbles } from "@/store/slices/echo_mumble.slice";
import { setBadgeOfPendingRequests, setMyFriendRequests } from "@/store/slices/user.slice";
import { RootState } from "@/store/store";

export function useFriendRequests(user: any) {
  const dispatch = useDispatch();
  const { myFriendRequests } = useSelector((state: RootState) => state.user);
  const { Mumbles } = useSelector((state: RootState) => state.echoMumble);

  //useEffect for fetching all of my friendRequests
  useEffect(() => {
    const fetchMyFriendRequests = async () => {
      try {
        const response = await fetchMyFriendRequestsApi();
        dispatch(setMyFriendRequests(response?.data?.myFriendRequests || []));
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
      }
    };

    if (user) fetchMyFriendRequests();
  }, [dispatch, user]);

  //useEffect for adding a badge for new friend requests
  useEffect(() => {
    if (myFriendRequests) {
      dispatch(setBadgeOfPendingRequests(myFriendRequests.length));
    }
  }, [dispatch, myFriendRequests]);

  //useEffect for updating the badge of unread Mumbles
  useEffect(() => {
    const calculateUnReadMumbles = Mumbles.filter(
      (mumble: any) => mumble.mumbleStatus !== "read"
    );

    dispatch(setUnReadMumbles(calculateUnReadMumbles.length));
  }, [Mumbles, dispatch]);
}
