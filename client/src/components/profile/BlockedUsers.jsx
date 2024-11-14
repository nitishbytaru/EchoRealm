import { useEffect, useState } from "react";
import { getBlockedUsers, unBlockUser } from "../../api/userApi";
import { useSelector } from "react-redux";

function BlockedUsers() {
  const { isMobile } = useSelector((state) => state.auth);
  const [blockedUsers, setBlockedUsers] = useState();

  useEffect(() => {
    const funcGetBlockedUsers = async () => {
      const response = await getBlockedUsers();
      setBlockedUsers(response?.data?.blockedUsers);
    };
    funcGetBlockedUsers();
  }, []);

  const unBlock = async (userId) => {
    const respose = await unBlockUser(userId);
    console.log(respose);
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
                <button className="btn btn-secondary btn-sm text-xs sm:text-sm">
                  {isMobile ? (
                    <>
                      Remove <br /> Friend
                    </>
                  ) : (
                    "Remove  Friend"
                  )}
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
