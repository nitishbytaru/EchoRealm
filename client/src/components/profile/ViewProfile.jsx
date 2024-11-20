import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getSelectedUserProfileDetailsApi } from "../../api/userApi";
import { FavoriteBorderIcon, FavoriteIcon } from "../../heplerFunc/exportIcons";
import { likeThisMumbleApi } from "../../api/echoMumbleApi";
import {
  updateCurrUserDetails,
  setCurrUserDetails,
} from "../../app/slices/userSlice.js";

import { setLoading } from "../../app/slices/authSlice.js";

function ViewProfile() {
  const { user } = useSelector((state) => state.auth);
  const { viewProfileUserId } = useParams();

  const dispatch = useDispatch();
  const { currUserDetails } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSelectedUserProfileDetailsApi(
        viewProfileUserId
      );
      dispatch(
        setCurrUserDetails(response?.data?.selectedUserProfileDetailsResponse)
      );
    };

    if (viewProfileUserId) {
      dispatch(setLoading(true));
      fetchData();
      dispatch(setLoading(false));
    }
  }, [dispatch, viewProfileUserId]);

  const likeThisMumbleFunc = async (MumbleId) => {
    dispatch(setLoading(true));
    const response = await likeThisMumbleApi(MumbleId);
    dispatch(setLoading(false));
    dispatch(updateCurrUserDetails(response?.data?.updatedMumble));
  };

  return (
    <div className="flex items-center justify-center h-full">
      {!viewProfileUserId ? (
        <div>
          <p>Select a user to view profile</p>
          <div className="text-center mt-4">
            <Link to={"/about/find-users"} className="btn">
              View Users
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
          <div className="flex flex-col items-center justify-center">
            <img
              src={currUserDetails?.avatar?.url}
              alt="avatar"
              className="avatar rounded-full w-24 h-24 mt-3 sm:w-48 sm:h-48 sm:mt-2 object-cover"
            />
            <p className="sm:text-xl">@{currUserDetails?.username}</p>
          </div>

          <div className="divider w-full my-1"></div>

          <div className="h-4/6 sm:h-auto overflow-y-auto">
            <div className="px-4">
              <h1 className="sm:text-2xl text-lg mb-4 text-center">
                My Mumbles
              </h1>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {currUserDetails?.selectedUserProfileMumbles?.map(
                  (Mumble, index) => (
                    <div
                      key={index}
                      className="bg-base-100 w-full shadow-xl rounded-lg"
                    >
                      <div className="p-4 sm:p-8 flex items-center justify-center">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h2>@{Mumble?.sender?.username}</h2>
                            <div className="flex items-center">
                              <button
                                onClick={() => likeThisMumbleFunc(Mumble?._id)}
                              >
                                {Mumble?.likes?.includes(user?._id) ? (
                                  <FavoriteIcon
                                    sx={{ fontSize: "28px", color: "red" }}
                                  />
                                ) : (
                                  <FavoriteBorderIcon
                                    sx={{ fontSize: "28px" }}
                                  />
                                )}
                              </button>
                              <span className="ml-2">
                                {Mumble?.likes?.length || 0}
                              </span>
                            </div>
                          </div>
                          <p className="text-lg font-bold">{Mumble?.message}</p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewProfile;
