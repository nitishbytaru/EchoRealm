import { useEffect, useTransition } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import Loading from "../../../utils/ui/Loading.jsx";
import {
  getMumblesApi,
  pinMumbleApi,
} from "../../echoMumble/api/echo_mumble.api.js";
import {
  FavoriteBorderIcon,
  FavoriteIcon,
  MoreVertSharpIcon,
} from "../../../utils/heplers/icons/export_icons.js";
import {
  setPinnedMumbles,
  updateMumbles,
  removePinnedMumble,
} from "../../echoMumble/slices/echo_mumble.slice.js";

function MyMumbles() {
  const dispatch = useDispatch();

  const { pinnedMumblesInMyProfile } = useSelector((state) => state.echoMumble);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const func = async () => {
      try {
        const response = await getMumblesApi();
        const pinnedMumbles = response?.data?.mumbles?.filter(
          (mumble) => mumble?.pinned === true
        );
        dispatch(setPinnedMumbles(pinnedMumbles));
      } catch (error) {
        console.error("Error fetching pinned mumbles:", error);
        toast.error("Failed to fetch pinned mumbles.");
      }
    };
    startTransition(() => {
      func();
    });
  }, [dispatch]);

  const pinMumble = (mumbleId) => {
    try {
      startTransition(async () => {
        const response = await pinMumbleApi(mumbleId);
        if (response?.data) {
          const { updatedMumble, message } = response.data;

          dispatch(updateMumbles(updatedMumble));
          dispatch(removePinnedMumble(updatedMumble?._id));

          toast.success(message);
        }
      });
    } catch (error) {
      console.error("Error pinning mumble:", error);
      toast.error("Failed to pin the mumble.");
    }
  };

  if (isPending) return <Loading />;

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
                          pinMumble(Mumble?._id);
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
