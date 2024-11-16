import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getWhispers, pinWhisperApi } from "../../api/echoWhisperApi";
import {
  FavoriteBorderIcon,
  FavoriteIcon,
  MoreVertSharpIcon,
  PushPinIcon,
} from "../../heplerFunc/exportIcons";
import {
  setPinnedWhispers,
  updateWhispers,
  removePinnedWhisper,
} from "../../app/slices/echoWhisperSlice";
import toast from "react-hot-toast";
import { setLoading } from "../../app/slices/authSlice";

function MyWhispers() {
  const dispatch = useDispatch();

  const { pinnedWhispers } = useSelector((state) => state.echoWhisper);

  useEffect(() => {
    const func = async () => {
      const response = await getWhispers();
      const finalResponse = response?.data?.whispers.filter(
        (whisper) => whisper?.showOthers == true
      );
      dispatch(setPinnedWhispers(finalResponse));
    };
    dispatch(setLoading(true));
    func();
    dispatch(setLoading(false));
  }, [dispatch]);

  const pinWhisper = async (whisperId) => {
    dispatch(setLoading(true));
    const response = await pinWhisperApi(whisperId);
    dispatch(setLoading(false));
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
              <div className="absolute m-2 top-0 left-0">
                <PushPinIcon />
              </div>
            )}
            <div className="card-body">
              <div className="card-actions justify-between">
                <h2 className="card-title">@{whisper?.sender?.username}</h2>
                {/* Open the modal using document.getElementById('ID').showModal() method */}
                <button
                  onClick={() =>
                    document.getElementById(whisper?._id).showModal()
                  }
                  className="absolute top-4 right-4"
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
              <div className="flex absolute bottom-4 right-4">
                <span className="ml-2">{whisper?.likes?.length}</span>
                <div className="ml-2">
                  {whisper?.likes?.length > 0 ? (
                    <FavoriteIcon sx={{ fontSize: "28px", color: "red" }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: "28px" }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyWhispers;
