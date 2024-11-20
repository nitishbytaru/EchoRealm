import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  deleteMumbleApi,
  getMumblesApi,
  pinMumbleApi,
} from "../../../api/echoMumbleApi";
import { blockSenderApi, getSelectedUserByIdApi } from "../../../api/userApi";
import {
  increaseNumberOfPinnedMumbles,
  removeMumble,
  setMumbles,
  setNumberOfPinnedMumbles,
  updateMumbles,
} from "../../../app/slices/echoMumbleSlice";
import {
  MoreVertSharpIcon,
  PushPinIcon,
} from "../../../heplerFunc/exportIcons";
import { setSelectedUser } from "../../../app/slices/echoLinkSlice";
import { useNavigate } from "react-router-dom";
import { setLoading } from "../../../app/slices/authSlice";
import { handleRoomSelect } from "../../../heplerFunc/microFuncs";

function ListenMumble() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { Mumbles, numberOfPinnedMumbles } = useSelector(
    (state) => state.echoMumble
  );

  useEffect(() => {
    const func = async () => {
      const response = await getMumblesApi();
      const responseMumbles = response?.data?.Mumbles.filter(
        (mumble) => !user?.blockedUsers.includes(mumble?.sender)
      );
      const numberOfPinnedMumblesInResponse = response?.data?.Mumbles.filter(
        (mumble) => mumble?.pinned
      );
      dispatch(
        setNumberOfPinnedMumbles(numberOfPinnedMumblesInResponse.length)
      );
      dispatch(setMumbles(responseMumbles || []));
    };
    dispatch(setLoading(true));
    func();
    dispatch(setLoading(false));
  }, [dispatch, user?.blockedUsers]);

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

  const confirmDeleteMumbleApiFunc = async (MumbleId) => {
    console.log(MumbleId);
    dispatch(setLoading(true));
    const response = await deleteMumbleApi(MumbleId);
    dispatch(setLoading(false));
    if (response?.data) {
      dispatch(removeMumble(MumbleId));
      toast.success(response.data?.message);
    }
  };

  const pinMumbleApiFunc = async (Mumble) => {
    if (!Mumble?.pinned && numberOfPinnedMumbles >= 4) {
      return toast.error("Only 5 mumbles can be Pinned");
    }
    dispatch(setLoading(true));
    const response = await pinMumbleApi(Mumble._id);
    dispatch(setLoading(false));
    dispatch(updateMumbles(response?.data?.updatedMumble));
    dispatch(increaseNumberOfPinnedMumbles());
    if (response?.data) {
      toast.success(response?.data?.message);
    }
  };

  const blockSenderApiFunc = async (MumbleId, senderId) => {
    dispatch(removeMumble(MumbleId));
    dispatch(setLoading(true));
    const response = await blockSenderApi(senderId);
    dispatch(setLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const goToEchoLinkApiFunc = async (selectedUserId) => {
    dispatch(setLoading(true));
    const response = await getSelectedUserByIdApi(selectedUserId);
    dispatch(setLoading(false));
    dispatch(setSelectedUser(response?.data?.selectedUserDetails));
    handleRoomSelect(dispatch, response?.data?.selectedUserDetails, user);
    navigate("/echo-link");
  };

  return (
    <div className="flex flex-col bg-base-200 h-full p-4 rounded-xl">
      <div className="overflow-y-auto">
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Mumbles.map((Mumble, index) => (
            <div
              key={index}
              className="card bg-base-100 w-full sm:w-92 shadow-xl"
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
                                goToEchoLinkApiFunc(Mumble?.sender?.senderId)
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