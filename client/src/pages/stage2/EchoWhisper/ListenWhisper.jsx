import React, { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { deleteWhisper, getWhispers } from "../../../api/echoWhisperApi";
import {
  removeWhisper,
  setWhispers,
} from "../../../app/slices/echoWhisperSlice";

const ListenWhisper = memo(() => {
  const dispatch = useDispatch();

  const { whispers } = useSelector((state) => state.echoWhisper);

  useEffect(() => {
    const func = async () => {
      const response = await getWhispers();
      dispatch(setWhispers(response?.data?.whispers || []));
    };
    func();
  }, []);

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
              <div className="card-body">
                <div className="card-actions justify-between">
                  <h2 className="card-title">
                    @{whisper?.sender ? whisper?.sender : "anonymous"}
                  </h2>
                  <button
                    className="btn btn-sm"
                    onClick={(e) => callDeleteWhisper(e, whisper)}
                  >
                    X
                  </button>
                </div>
                <p>{whisper?.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ListenWhisper;
