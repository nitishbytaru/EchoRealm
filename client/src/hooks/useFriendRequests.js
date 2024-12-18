import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchMyFriendRequestsApi } from "../features/profile/api/friends.api.js";
import { setUnReadMumbles } from "../features/echoMumble/slices/echo_mumble.slice.js";
import {
  setBadgeOfPendingRequests,
  setMyFriendRequests,
} from "../features/profile/slices/user.slice.js";

export function useFriendRequests(user) {
  const dispatch = useDispatch();
  const { myFriendRequests } = useSelector((state) => state.user);
  const { Mumbles } = useSelector((state) => state.echoMumble);

  //useEffect for fetching all of my friendRequests
  useEffect(() => {
    const fetchMyFriendRequests = async () => {
      try {
        const response = await fetchMyFriendRequestsApi();
        dispatch(setMyFriendRequests(response?.data?.myFriendRequests));
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
      (mumble) => mumble.mumbleStatus !== "read"
    );

    dispatch(setUnReadMumbles(calculateUnReadMumbles.length));
  }, [Mumbles, dispatch]);
}
