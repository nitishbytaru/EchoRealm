import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getSelectedUserProfileDetails } from "../../api/userApi";
import { FavoriteBorderIcon, FavoriteIcon } from "../../heplerFunc/exportIcons";
import { likeThisWhisperApi } from "../../api/echoWhisperApi";
import {
  updateCurrUserDetails,
  setCurrUserDetails,
} from "../../app/slices/echoWhisperSlice.js";
import { setLoading } from "../../app/slices/authSlice.js";

function ViewProfile() {
  const { user } = useSelector((state) => state.auth);
  const { viewProfileUserId } = useParams();

  const dispatch = useDispatch();
  const { currUserDetails } = useSelector((state) => state.echoWhisper);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSelectedUserProfileDetails(viewProfileUserId);
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

  const likeThisWhisperFunc = async (whisperId) => {
    dispatch(setLoading(true));
    const response = await likeThisWhisperApi(whisperId);
    dispatch(setLoading(false));
    dispatch(updateCurrUserDetails(response?.data?.updatedWhisper));
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
            <p>@{currUserDetails?.username}</p>
          </div>

          <div className="divider w-full my-1"></div>

          <div className="h-4/6 sm:h-auto overflow-y-auto">
            <div className="px-4">
              <h1 className="sm:text-2xl text-lg mb-4 text-center">
                My Whispers
              </h1>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {currUserDetails?.selectedUserProfileWhispers?.map(
                  (whisper, index) => (
                    <div
                      key={index}
                      className="bg-base-100 w-full shadow-xl rounded-lg"
                    >
                      <div className="p-4 sm:p-8 flex items-center justify-center">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h2>@{whisper?.sender?.username}</h2>
                            <div className="flex items-center">
                              <button
                                onClick={() =>
                                  likeThisWhisperFunc(whisper?._id)
                                }
                              >
                                {whisper?.likes?.includes(user?._id) ? (
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
                                {whisper?.likes?.length || 0}
                              </span>
                            </div>
                          </div>
                          <p className="text-lg font-bold">
                            {whisper?.message}
                          </p>
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
