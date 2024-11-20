import { useDispatch, useSelector } from "react-redux";
import { useDebouncedSearchResults } from "../../hooks/useDebouncedSearchResults";
import { useInputValidation } from "6pp";
import { useNavigate } from "react-router-dom";
import {
  setResultOfSearchedUsers,
  setSelectedViewProfileId,
  updateResultOfSearchedUsers,
} from "../../app/slices/userSlice";
import { toast } from "react-hot-toast";
import { sendFriendRequestApi } from "../../api/userApi";
import { useEffect } from "react";

function FindUsers() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { resultOfSearchedUsers } = useSelector((state) => state.user);

  const search = useInputValidation("");
  const searchResults = useDebouncedSearchResults(search.value);

  useEffect(() => {
    dispatch(setResultOfSearchedUsers(searchResults));
  }, [dispatch, searchResults, user._id]);

  const viewProfileFunc = async (viewProfileUserId) => {
    dispatch(setSelectedViewProfileId(viewProfileUserId));
    navigate(`/about/view-profile/${viewProfileUserId}`);
  };

  const addFriendFunc = async (selectedUser) => {
    try {
      const response = await sendFriendRequestApi(selectedUser?._id);
      dispatch(
        updateResultOfSearchedUsers(response?.data?.friendRequestSentToUser)
      );
      toast.success(response?.data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-base-200 h-full rounded-xl">
      <div className="flex flex-col bg-base-300 h-full w-full rounded-xl">
        <div className="flex-none h-full py-2">
          <label className="input input-bordered sm:input-md input-sm flex items-center mb-2 mx-1">
            <input
              type="text"
              className="grow"
              placeholder="Search Users"
              value={search.value}
              onChange={search.changeHandler}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>

          {search.value &&
            (resultOfSearchedUsers?.length > 0 ? (
              <div className="menu bg-base-300 w-full rounded-box mt-2">
                {resultOfSearchedUsers?.length > 0 && (
                  <div className="overflow-y-auto max-h-[calc(100vh-150px)] px-2">
                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {resultOfSearchedUsers.map((currUser, index) => (
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
                                className="btn btn-primary mb-1 btn-sm text-xs sm:text-sm"
                                onClick={() => viewProfileFunc(currUser._id)}
                              >
                                View Profile
                              </button>

                              {currUser?.pendingFriendRequests.includes(
                                user?._id
                              ) ? (
                                <button className="btn btn-disabled btn-sm text-xs sm:text-sm">
                                  Request Sent
                                </button>
                              ) : (
                                <button
                                  className="btn btn-secondary btn-sm text-xs sm:text-sm"
                                  onClick={() => addFriendFunc(currUser)}
                                >
                                  Add Friend
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="menu bg-base-300 w-full rounded-box mt-2">
                <div className="flex justify-between items-center">
                  <p>No user with this username</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default FindUsers;
