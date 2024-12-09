import toast from "react-hot-toast";
import { useEffect, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loading from "../../../components/Loading.jsx";
import { getBlockedUsersApi, unBlockUserApi } from "../api/friends.api.js";
import {
  setBlockedUsers,
  removeFromBlockedUsers,
} from "../../profile/slices/user.slice.js";

function BlockedUsers() {
  const dispatch = useDispatch();
  const { blockedUsers } = useSelector((state) => state.user);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const funcGetBlockedUsers = async () => {
      try {
        const response = await getBlockedUsersApi();
        if (response?.data?.blockedUsers) {
          dispatch(setBlockedUsers(response.data.blockedUsers));
        }
      } catch (error) {
        console.error("Error fetching blocked users:", error);
      }
    };

    startTransition(() => {
      funcGetBlockedUsers();
    });
  }, [dispatch]);

  const unBlockApiFunc = (userId) => {
    startTransition(async () => {
      try {
        const response = await unBlockUserApi(userId);
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
        dispatch(removeFromBlockedUsers(userId));
      } catch (error) {
        console.error("Error unblocking user:", error);
        toast.error("Failed to unblock the user.");
      }
    });
  };

  if (isPending) return <Loading />;

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
