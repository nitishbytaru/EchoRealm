import { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import { setIsLoading } from "../../../app/slices/auth.slice.js";
import { getBlockedUsersApi, unBlockUserApi } from "../api/friends.api.js";
import {
  setBlockedUsers,
  removeFromBlockedUsers,
} from "../../profile/slices/user.slice.js";

function BlockedUsers() {
  const dispatch = useDispatch();
  const { blockedUsers } = useSelector((state) => state.user);

  useEffect(() => {
    const funcGetBlockedUsers = async () => {
      const response = await getBlockedUsersApi();
      dispatch(setBlockedUsers(response?.data?.blockedUsers));
    };

    dispatch(setIsLoading(true));
    funcGetBlockedUsers();
    dispatch(setIsLoading(false));
  }, [dispatch]);

  const unBlockApiFunc = async (userId) => {
    dispatch(setIsLoading(true));
    const response = await unBlockUserApi(userId);
    dispatch(setIsLoading(false));
    toast.success(response?.data?.message);
    dispatch(removeFromBlockedUsers(userId));
  };

  return (
    <div className="px-4 overflow-y-auto">
      <h1 className="sm:text-2xl text-lg mb-4 text-center">Blocked Users</h1>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {blockedUsers?.map((currUser, index) => (
          <div key={index} className="card bg-base-100 shadow-lg rounded-xl">
            <figure className="flex justify-center mt-6">
              <img
                src={currUser?.avatar?.url}
                alt="Blocked User"
                className="rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover"
              />
            </figure>
            <div className="card-body p-4 items-center text-center">
              <h2 className="text-lg font-medium">{currUser?.username}</h2>
              <div className="flex gap-3 mt-3">
                <button
                  className="btn btn-primary btn-sm text-xs sm:text-sm"
                  onClick={() => unBlockApiFunc(currUser?._id)}
                >
                  Unblock
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlockedUsers;
