import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMumblesApi, pinMumbleApi } from "../../api/echoMumbleApi";
import {
  FavoriteBorderIcon,
  FavoriteIcon,
  MoreVertSharpIcon,
} from "../../heplerFunc/exportIcons";
import {
  setPinnedMumbles,
  updateMumbles,
  removePinnedMumble,
} from "../../app/slices/echoMumbleSlice";
import toast from "react-hot-toast";
import { setLoading } from "../../app/slices/authSlice";

function MyMumbles() {
  const dispatch = useDispatch();

  const { pinnedMumblesInMyProfile } = useSelector((state) => state.echoMumble);

  useEffect(() => {
    const func = async () => {
      const response = await getMumblesApi();
      const finalResponse = response?.data?.Mumbles.filter(
        (Mumble) => Mumble?.pinned == true
      );
      dispatch(setPinnedMumbles(finalResponse));
    };
    dispatch(setLoading(true));
    func();
    dispatch(setLoading(false));
  }, [dispatch]);

  const pinMumble = async (MumbleId) => {
    dispatch(setLoading(true));
    const response = await pinMumbleApi(MumbleId);
    dispatch(setLoading(false));
    dispatch(updateMumbles(response?.data?.updatedMumble));
    dispatch(removePinnedMumble(response?.data?.updatedMumble?._id));
    if (response?.data) {
      toast.success(response?.data?.message);
    }
  };

  return (
    <div className="px-4 overflow-y-auto">
      <h1 className="sm:text-2xl text-lg mb-4 text-center">My Mumbles</h1>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pinnedMumblesInMyProfile?.map((Mumble, index) => (
          <div
            key={index}
            className="card bg-base-100 w-full sm:w-92 shadow-xl"
          >
            <div className="card-body">
              <div className="card-actions justify-between">
                <h2 className="card-title">@{Mumble?.sender?.username}</h2>
                {/* Open the modal using document.getElementById('ID').showModal() method */}
                <button
                  onClick={() =>
                    document.getElementById(Mumble?._id).showModal()
                  }
                  className="absolute top-4 right-4"
                >
                  <MoreVertSharpIcon />
                </button>

                <dialog
                  id={Mumble?._id}
                  className="modal modal-bottom sm:modal-middle"
                >
                  <div className="modal-box">
                    <div className="flex items-center justify-center">
                      <button
                        className="btn m-2"
                        onClick={() => {
                          pinMumble(Mumble);
                          document.getElementById(Mumble?._id).close();
                        }}
                      >
                        unpin this mumble
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

              <p>{Mumble?.message}</p>
              <div className="flex absolute bottom-4 right-4">
                <span className="ml-2">{Mumble?.likes?.length}</span>
                <div className="ml-2">
                  {Mumble?.likes?.length > 0 ? (
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

export default MyMumbles;
