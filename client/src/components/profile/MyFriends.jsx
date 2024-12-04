import { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoading } from "../../app/slices/authSlice";
import {
  handleRemoveOrBlockMyFriendApi,
  getMyFriendsListApi,
} from "../../api/friends.api.js";
import {
  removeFromMyFriendsList,
  setToMyFriendsList,
} from "../../app/slices/userSlice";

function MyFriends() {
  const dispatch = useDispatch();
  const { myFriendsList } = useSelector((state) => state.user);

  useEffect(() => {
    const getMyFriendsListFunc = async () => {
      const myFriendsListApiResponse = await getMyFriendsListApi();
      dispatch(
        setToMyFriendsList(
          myFriendsListApiResponse?.data?.myFriendList?.friends
        )
      );
    };

    getMyFriendsListFunc();
  }, [dispatch]);

  const blockSender = async (friendId) => {
    dispatch(setIsLoading(true));
    await handleRemoveOrBlockMyFriendApi({ friendId, block: true });

    const response = await handleRemoveOrBlockMyFriendApi({
      friendId,
      block: true,
    });

    dispatch(removeFromMyFriendsList(friendId));
    dispatch(setIsLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const removeFriend = async (friendId) => {
    setIsLoading(true);

    const response = await handleRemoveOrBlockMyFriendApi({
      friendId,
      block: false,
    });

    dispatch(removeFromMyFriendsList(friendId));
    setIsLoading(false);
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  return (
    <div className="bg-base-200 h-full rounded-xl">
      <div className="flex flex-col bg-base-300 h-full w-full mx-auto rounded-xl">
        <div className="flex-none h-full px-4 py-2">
          <h1 className="sm:text-2xl text-lg mb-4 text-center">My Friends</h1>

          <div className="overflow-y-auto max-h-[calc(100vh-150px)] px-2">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {myFriendsList?.map((currUser, index) => (
                <div
                  key={index}
                  className="card bg-base-100 shadow-lg rounded-xl"
                >
                  <figure className="flex justify-center mt-6">
                    <img
                      src={currUser?.avatar?.url}
                      alt="Blocked User"
                      className="rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover"
                    />
                  </figure>
                  <div className="card-body p-4 items-center text-center">
                    <h2 className="text-lg font-medium">
                      @{currUser?.username}
                    </h2>
                    <div className="sm:flex gap-3 mt-3">
                      <button
                        className="btn btn-primary mb-1 btn-sm text-xs sm:text-sm mr-2 sm:mr-0"
                        onClick={() => removeFriend(currUser._id)}
                      >
                        Remove Friend
                      </button>

                      <button
                        className="btn btn-error btn-sm text-xs sm:text-sm"
                        onClick={() => blockSender(currUser._id)}
                      >
                        Block @{currUser?.username}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyFriends;
