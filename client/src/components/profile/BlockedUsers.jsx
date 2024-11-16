import { useEffect } from "react";
import { getBlockedUsers, unBlockUser } from "../../api/userApi";
import { useDispatch, useSelector } from "react-redux";
import {
  setBlockedUsers,
  removeFromBlockedUsers,
} from "../../app/slices/authSlice";
import toast from "react-hot-toast";

function BlockedUsers() {
  const dispatch = useDispatch();
  const { blockedUsers } = useSelector((state) => state.auth);

  useEffect(() => {
    const funcGetBlockedUsers = async () => {
      const response = await getBlockedUsers();
      dispatch(setBlockedUsers(response?.data?.blockedUsers));
    };
    funcGetBlockedUsers();
  }, [dispatch]);

  const unBlock = async (userId) => {
    const response = await unBlockUser(userId);
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
                  onClick={() => unBlock(currUser?._id)}
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