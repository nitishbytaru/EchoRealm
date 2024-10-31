import MessageBar from "../../../components/ui/MessageBar";

function CreateWhisper() {
  return (
    <div className="bg-base-200 h-full rounded-xl pt-2">
      <div className="flex flex-col bg-base-300 h-full w-3/4 mx-auto rounded-xl">
        <div className=" flex-none px-4 py-2">
          <label className="input input-bordered flex items-center gap-2">
            <input type="text" className="grow" placeholder="Search" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
        </div>
        <div className="flex-grow">
          <div className="avatar justify-center">
            <div className="w-2/5 rounded-full">
              <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <p className="text-3xl">@Username</p>
          </div>
        </div>
        <div className="flex-none px-2 mb-2">
          <MessageBar position={"whisper"} />
        </div>
      </div>
    </div>
  );
}

export default CreateWhisper;
