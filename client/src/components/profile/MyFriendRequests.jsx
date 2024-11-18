import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  fetchMyFriendRequestsApi,
  handleFriendRequestApi,
} from "../../api/userApi";
import { useNavigate } from "react-router-dom";
import { setSelectedViewProfileId } from "../../app/slices/echoWhisperSlice";
import { toast } from "react-hot-toast";

function MyFriendRequests() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [myFriendRequests, setMyFriendRequests] = useState([]);

  useEffect(() => {
    const fetchMyFriendRequestsFunc = async () => {
      try {
        const response = await fetchMyFriendRequestsApi();
        setMyFriendRequests(response?.data?.myFriendRequests);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMyFriendRequestsFunc();
  }, []);

  const viewProfileFunc = async (viewProfileUserId) => {
    dispatch(setSelectedViewProfileId(viewProfileUserId));
    navigate(`/about/view-profile/${viewProfileUserId}`);
  };

  const handleFriendRequest = async (requestedUserId, willAccepct) => {
    const response = await handleFriendRequestApi({
      requestedUserId,
      willAccepct,
    });

    toast.success(response?.data?.message);
  };

  return (
    <div className="bg-base-200 h-full rounded-xl">
      <div className="flex flex-col bg-base-300 h-full w-full mx-auto rounded-xl">
        <div className="flex-none h-full px-4 py-2">
          <h1 className="sm:text-2xl text-lg mb-4 text-center">
            Your Friend requests
          </h1>

          <div className="overflow-y-auto max-h-[calc(100vh-150px)] px-2">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {myFriendRequests?.map((currUser, index) => (
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
                        className="btn btn-secondary mb-1 btn-sm text-xs sm:text-sm"
                        onClick={() => viewProfileFunc(currUser._id)}
                      >
                        View Profile
                      </button>

                      <button
                        className="btn btn-primary mb-1 btn-sm text-xs sm:text-sm mr-2 sm:mr-0"
                        onClick={() => handleFriendRequest(currUser._id, true)}
                      >
                        Accepct
                      </button>

                      <button
                        className="btn btn-error btn-sm text-xs sm:text-sm"
                        onClick={() => handleFriendRequest(currUser._id, false)}
                      >
                        Reject
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

export default MyFriendRequests;