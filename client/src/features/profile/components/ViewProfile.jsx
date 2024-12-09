import { toast } from "react-hot-toast";
import { useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useParams } from "react-router-dom";

import Loading from "../../../components/Loading.jsx";
import { likeThisMumbleApi } from "../../echoMumble/api/echo_mumble.api.js";
import {
  FavoriteBorderIcon,
  FavoriteIcon,
} from "../../../utils/icons/export_icons.js";
import {
  getUsersWithMumbles,
  fetchMostLikedMumbleWithLikesAndFriendsApi,
} from "../api/user.api.js";
import {
  updateViewingProfileUserDetails,
  setViewingProfileUserDetails,
} from "../slices/user.slice.js";

function ViewProfile() {
  const dispatch = useDispatch();
  const { viewProfileUserId } = useParams();

  const { user, isMobile } = useSelector((state) => state.auth);
  const { viewingProfileUserDetails } = useSelector((state) => state.user);

  const [likes, setLikes] = useState(0);
  const [friends, setFriends] = useState(0);
  const [splMumble, setSplMumble] = useState(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUsersWithMumbles(viewProfileUserId);

        if (response?.data?.selectedUserProfileDetailsResponse) {
          dispatch(
            setViewingProfileUserDetails(
              response.data.selectedUserProfileDetailsResponse
            )
          );
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile details.");
      }
    };

    if (viewProfileUserId) {
      startTransition(() => {
        fetchData();
      });
    }
  }, [dispatch, viewProfileUserId]);

  useEffect(() => {
    const fetchMostLikedMumbleWithLikesAndFriendsApiFunc = async () => {
      try {
        const response = await fetchMostLikedMumbleWithLikesAndFriendsApi(
          viewProfileUserId
        );

        if (response?.data?.userRequestedProfileData) {
          const { mumbleWithHighestLikes, profileLikes, friends } =
            response.data.userRequestedProfileData;

          startTransition(() => {
            setSplMumble(mumbleWithHighestLikes);
            setLikes(profileLikes);
            setFriends(friends);
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data.");
      }
    };
    startTransition(() => {
      fetchMostLikedMumbleWithLikesAndFriendsApiFunc();
    });
  }, [dispatch, viewProfileUserId]);

  const likeThisMumbleFunc = (mumbleId) => {
    try {
      startTransition(async () => {
        const response = await likeThisMumbleApi(mumbleId);

        if (response?.data?.updatedMumble) {
          dispatch(
            updateViewingProfileUserDetails(response.data.updatedMumble)
          );
          toast.success(response?.data?.message);
        }
      });
    } catch (error) {
      console.error("Error liking mumble:", error);
      toast.error("An error occurred while liking the mumble.");
    }
  };

  if (isPending) return <Loading />;

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
          <div className="flex items-center justify-between mx-4">
            {/* profile pic and username section */}
            <div className="flex flex-col items-center justify-center">
              <img
                src={viewingProfileUserDetails?.avatar?.url}
                alt="avatar"
                className="avatar rounded-full w-24 h-24 mt-3 sm:w-48 sm:h-48 sm:mt-2 object-cover"
              />
              <p className="sm:text-xl">
                @{viewingProfileUserDetails?.username}
              </p>
            </div>

            {isMobile ? null : splMumble ? (
              <div>
                <div>
                  <p>Highest liked mumble:</p>
                </div>
                <div className="bg-base-100 w-64 shadow-xl rounded-lg">
                  <div className="p-4 sm:p-8 flex items-center justify-center">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h2>@{splMumble?.sender?.username}</h2>
                        <div className="flex items-center">
                          <FavoriteIcon
                            sx={{ fontSize: "28px", color: "red" }}
                          />
                          <span className="ml-2">
                            {splMumble?.likeCount || 0}
                          </span>
                        </div>
                      </div>
                      <p className="text-lg font-bold">{splMumble?.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                to={`/create-Mumble/${viewProfileUserId}`}
                className="btn btn-primary rounded-lg"
              >
                send him a mumble
              </NavLink>
            )}

            {/* likes and friends section */}
            <div className="flex flex-col gap-2 sm:mr-12 bg-base-100 p-2 rounded-xl shadow-xl">
              {/* Likes Section */}
              <div className="flex flex-col items-center sm:items-start">
                <p className="text-xs sm:text-sm uppercase tracking-wide">
                  Likes:
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold">{likes}</p>
              </div>
              {/* Divider Line */}
              <div className="w-12 h-px bg-gray-300 hidden sm:block"></div>
              {/* Friends Section */}
              <div className="flex flex-col items-center sm:items-start">
                <p className="text-xs sm:text-sm uppercase tracking-wide">
                  Friends:
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold ">
                  {friends}
                </p>
              </div>
            </div>
          </div>

          <div className="divider w-full my-1"></div>

          <div className="h-4/6 sm:h-auto overflow-y-auto">
            <div className="px-4">
              <h1 className="sm:text-2xl text-lg mb-4 text-left">
                Featured Mumbles:
              </h1>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {viewingProfileUserDetails?.selectedUserProfileMumbles?.map(
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
