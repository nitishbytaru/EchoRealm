import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyFriendRequestsApi } from "../api/friendsApi";
import {
  setBadgeOfPendingRequests,
  setMyFriendRequests,
} from "../app/slices/userSlice";

export function useFriendRequests(user) {
  const dispatch = useDispatch();
  const { myFriendRequests } = useSelector((state) => state.user);

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

  useEffect(() => {
    if (myFriendRequests) {
      dispatch(setBadgeOfPendingRequests(myFriendRequests.length));
    }
  }, [dispatch, myFriendRequests]);
}
