import toast from "react-hot-toast";
import { useEffect, useRef, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Loading from "../../../utils/ui/Loading.jsx";
import {
  deleteMumbleApi,
  getMumblesApi,
  pinMumbleApi,
  setMumblesAsReadApi,
} from "../../echoMumble/api/echo_mumble.api.js";
import {
  getBlockedUsersApi,
  handleRemoveOrBlockMyFriendApi,
} from "../../profile/api/friends.api.js";
import {
  increaseNumberOfPinnedMumbles,
  removeMumble,
  setMumbles,
  setNumberOfPinnedMumbles,
  updateMumbles,
  setUnReadMumbles,
} from "../slices/echo_mumble.slice.js";
import {
  MoreVertSharpIcon,
  PushPinIcon,
} from "../../../utils/heplers/icons/export_icons.js";

function ListenMumble() {
  const isFirstRender = useRef(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { Mumbles, numberOfPinnedMumbles } = useSelector(
    (state) => state.echoMumble
  );

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const func = async () => {
      try {
        const response = await getMumblesApi();
        const blockedUsersApiResponse = await getBlockedUsersApi();

        const myMumbles = response?.data?.mumbles.filter((mumble) => {
          return mumble.receiver.toString() === user._id.toString();
        });

        const responseMumbles = myMumbles?.filter(
          (mumble) =>
            !blockedUsersApiResponse?.data?.blockedUsers.includes(
              mumble?.sender
            )
        );

        const pinnedMumbles = response?.data?.Mumbles?.filter(
          (mumble) => mumble?.pinned
        );

        dispatch(setNumberOfPinnedMumbles(pinnedMumbles?.length));
        dispatch(
          setUnReadMumbles(
            responseMumbles?.filter((mumble) => mumble.mumbleStatus !== "read")
              .length
          )
        );
        dispatch(setMumbles(responseMumbles || []));
      } catch (error) {
        console.error("Error fetching mumbles or blocked users:", error);
        toast.error("Failed to load mumbles or blocked users.");
      }
    };
    startTransition(() => func());
  }, [dispatch, user._id, user.blockedUsers]);

  //useEffect for marking the unread mumbles as read
  useEffect(() => {
    const setAllMumblesAsReadApiFunc = async () => {
      await setMumblesAsReadApi();
      dispatch(setUnReadMumbles(0));
    };

    return () => {
      // Ensure cleanup runs only once when the component unmounts
      if (isFirstRender.current) {
        isFirstRender.current = false; // Flip after the first render
      } else {
        if (Mumbles.length > 0) {
          setAllMumblesAsReadApiFunc();
        }
      }
    };
  }, [Mumbles, Mumbles.length, dispatch]);

  const callDeleteMumbleFunc = (e, Mumble) => {
    e.preventDefault();

    toast((t) => (
      <div className="p-4 space-y-4">
        {/* Message content at the top */}
        <p className="text-sm text-gray-700">
          Delete Mumble by <b>@{Mumble?.sender?.username || "anonymous"}</b>
        </p>

        {/* Button container for Delete and Dismiss */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              confirmDeleteMumbleApiFunc(Mumble._id);
              toast.dismiss(t.id);
            }}
            className="btn btn-sm bg-red-500 hover:bg-red-600"
          >
            Delete
          </button>

          <button onClick={() => toast.dismiss(t.id)} className="btn btn-sm">
            Dismiss
          </button>
        </div>
      </div>
    ));
  };

  const confirmDeleteMumbleApiFunc = (MumbleId) => {
    startTransition(async () => {
      try {
        const response = await deleteMumbleApi(MumbleId);

        if (response?.data) {
          dispatch(removeMumble(MumbleId)); // Remove mumble from state
          toast.success(response.data?.message); // Show success message
        }
      } catch (error) {
        console.error("Error deleting mumble:", error);
        toast.error("Failed to delete mumble.");
      }
    });
  };

  const pinMumbleApiFunc = (mumble) => {
    if (!mumble?.pinned && numberOfPinnedMumbles >= 4) {
      return toast.error("Only 5 mumbles can be Pinned");
    }
    startTransition(async () => {
      try {
        const response = await pinMumbleApi(mumble._id);

        if (response?.data) {
          dispatch(updateMumbles(response.data.updatedMumble));
          dispatch(increaseNumberOfPinnedMumbles());
          toast.success(response.data.message);
        }
      } catch (error) {
        console.error("Error pinning mumble:", error);
        toast.error("Failed to pin mumble.");
      }
    });
  };

  const blockSenderApiFunc = (MumbleId, senderId) => {
    startTransition(async () => {
      try {
        dispatch(removeMumble(MumbleId));
        const response = await handleRemoveOrBlockMyFriendApi({
          senderId,
          block: true,
        });
        if (response?.data) {
          toast.success(response.data?.message);
        }
      } catch (error) {
        console.error("Error blocking sender:", error);
        toast.error("Failed to block sender.");
      }
    });
  };

  if (isPending) return <Loading />;

  return (
    <div className="flex flex-col bg-base-200 h-full p-4 rounded-xl">
      <div className="overflow-y-auto">
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Mumbles.map((Mumble, index) => (
            <div
              key={index}
              className={`card ${
                Mumble.mumbleStatus === "sent" ? "bg-slate-800" : "bg-base-100"
              } w-full sm:w-92 shadow-xl`}
            >
              {Mumble?.pinned && (
                <div className="absolute m-2">
                  <PushPinIcon />
                </div>
              )}
              <div className="card-body">
                <div className="card-actions justify-between">
                  {/* Safely display the username */}
                  <h2 className="card-title">
                    @{Mumble?.sender?.username || "anonymous"}
                  </h2>
                  <button
                    onClick={() =>
                      document.getElementById(Mumble?._id).showModal()
                    }
                  >
                    <MoreVertSharpIcon />
                  </button>
                  <dialog
                    id={Mumble?._id}
                    className="modal modal-bottom sm:modal-middle"
                  >
                    <div className="modal-box">
                      <div className="grid grid-cols-2">
                        <button
                          className="btn m-2"
                          onClick={() => {
                            pinMumbleApiFunc(Mumble);
                            document.getElementById(Mumble?._id).close();
                          }}
                        >
                          {Mumble?.pinned
                            ? "Unpin this Mumble"
                            : "Pin this Mumble"}
                        </button>
                        <button
                          className="btn m-2"
                          onClick={(e) => {
                            callDeleteMumbleFunc(e, Mumble);
                            document.getElementById(Mumble?._id).close();
                          }}
                        >
                          Delete Mumble
                        </button>
                        {Mumble?.sender?.senderId && (
                          <>
                            <button
                              className="btn m-2"
                              onClick={() =>
                                navigate(
                                  `/echo-link/${Mumble?.sender?.senderId}`
                                )
                              }
                            >
                              Direct Message @
                              {Mumble?.sender?.username || "anonymous"}
                            </button>
                            <button
                              className="btn bg-red-700  m-2"
                              onClick={() => {
                                blockSenderApiFunc(
                                  Mumble?._id,
                                  Mumble?.sender?.senderId
                                );
                                document.getElementById(Mumble?._id).close();
                              }}
                            >
                              Block @{Mumble?.sender?.username || "anonymous"}
                            </button>
                          </>
                        )}
                      </div>
                      <div className="modal-action">
                        <form method="dialog">
                          <button className="btn">Close</button>
                        </form>
                      </div>
                    </div>
                  </dialog>
                </div>
                <p>{Mumble?.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ListenMumble;
