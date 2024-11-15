import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  deleteWhisper,
  getWhispers,
  pinWhisperApi,
} from "../../../api/echoWhisperApi";
import { blockSenderApi } from "../../../api/userApi";
import {
  removeWhisper,
  setWhispers,
  updateWhispers,
} from "../../../app/slices/echoWhisperSlice";
import {
  MoreVertSharpIcon,
  PushPinIcon,
} from "../../../heplerFunc/exportIcons";

function ListenWhisper() {
  const dispatch = useDispatch();

  const { whispers } = useSelector((state) => state.echoWhisper);

  useEffect(() => {
    const func = async () => {
      const response = await getWhispers();
      const whispers = response?.data?.whispers.filter(
        (whisper) => whisper?.blocked === false
      );
      dispatch(setWhispers(whispers || []));
    };
    func();
  }, [dispatch]);

  const callDeleteWhisper = (e, whisper) => {
    e.preventDefault();

    toast((t) => (
      <div className="p-4 space-y-4">
        {/* Message content at the top */}
        <p className="text-sm text-gray-700">
          Delete whisper by <b>@{whisper?.sender || "anonymous"}</b>
        </p>

        {/* Button container for Delete and Dismiss */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              confirmDelete(whisper._id);
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

  const confirmDelete = async (whisperId) => {
    const response = await deleteWhisper(whisperId);
    if (response?.data) {
      dispatch(removeWhisper(whisperId));
      toast.success(response.data?.message);
    }
  };

  const pinWhisper = async (whisperId) => {
    const response = await pinWhisperApi(whisperId);
    dispatch(updateWhispers(response?.data?.updatedWhisper));
    if (response?.data) {
      toast.success(response?.data?.message);
    }
  };

  const blockSender = async (whisperId, senderId) => {
    dispatch(removeWhisper(whisperId));
    const response = await blockSenderApi(whisperId, senderId);
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  return (
    <div className="flex flex-col bg-base-200 h-full p-4 rounded-xl">
      <div className="overflow-y-auto">
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {whispers.map((whisper, index) => (
            <div
              key={index}
              className="card bg-base-100 w-full sm:w-92 shadow-xl"
            >
              {whisper?.showOthers && (
                <div className="absolute m-2">
                  <PushPinIcon />
                </div>
              )}
              <div className="card-body">
                <div className="card-actions justify-between">
                  <h2 className="card-title">@{whisper?.senderUsername}</h2>
                  {/* Open the modal using document.getElementById('ID').showModal() method */}
                  <button
                    onClick={() =>
                      document.getElementById(whisper?._id).showModal()
                    }
                  >
                    <MoreVertSharpIcon />
                  </button>
                  <dialog
                    id={whisper?._id}
                    className="modal modal-bottom sm:modal-middle"
                  >
                    <div className="modal-box">
                      <div className="grid grid-cols-2">
                        <button
                          className="btn m-2"
                          onClick={() => {
                            pinWhisper(whisper);
                            document.getElementById(whisper?._id).close();
                          }}
                        >
                          {`${
                            whisper?.showOthers
                              ? "unpin this whisper"
                              : "pin this whisper"
                          }`}
                        </button>
                        <button
                          className="btn m-2"
                          onClick={(e) => {
                            callDeleteWhisper(e, whisper);
                            document.getElementById(whisper?._id).close();
                          }}
                        >
                          delete whisper
                        </button>
                        <button
                          className="btn m-2"
                          onClick={() => console.log()}
                        >
                          send Friend request
                        </button>
                        <button
                          className="btn bg-red-700  m-2"
                          onClick={() => {
                            blockSender(whisper?._id, whisper?.sender);
                            document.getElementById(whisper?._id).close();
                          }}
                        >
                          block @{`${whisper?.senderUsername}`}
                        </button>
                      </div>
                      <div className="modal-action">
                        <form method="dialog">
                          {/* if there is a button in form, it will close the modal */}
                          <button className="btn">Close</button>
                        </form>
                      </div>
                    </div>
                  </dialog>
                </div>
                <p>{whisper?.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ListenWhisper;
