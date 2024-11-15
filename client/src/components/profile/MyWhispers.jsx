import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getWhispers, pinWhisperApi } from "../../api/echoWhisperApi";
import { MoreVertSharpIcon, PushPinIcon } from "../../heplerFunc/exportIcons";
import {
  setPinnedWhispers,
  updateWhispers,
  removePinnedWhisper,
} from "../../app/slices/echoWhisperSlice";
import toast from "react-hot-toast";

function MyWhispers() {
  const dispatch = useDispatch();

  const { pinnedWhispers } = useSelector((state) => state.echoWhisper);

  useEffect(() => {
    const func = async () => {
      const response = await getWhispers();
      const finalResponse = response?.data?.whispers.filter(
        (whisper) => whisper?.showOthers == true && whisper?.blocked === false
      );
      dispatch(setPinnedWhispers(finalResponse));
    };
    func();
  }, [dispatch]);

  const pinWhisper = async (whisperId) => {
    const response = await pinWhisperApi(whisperId);
    dispatch(updateWhispers(response?.data?.updatedWhisper));
    dispatch(removePinnedWhisper(response?.data?.updatedWhisper?._id));
    if (response?.data) {
      toast.success(response?.data?.message);
    }
  };

  return (
    <div className="px-4 overflow-y-auto">
      <h1 className="sm:text-2xl text-lg mb-4 text-center">My Whispers</h1>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pinnedWhispers?.map((whisper, index) => (
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
                    <div className="flex items-center justify-center">
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
  );
}

export default MyWhispers;
