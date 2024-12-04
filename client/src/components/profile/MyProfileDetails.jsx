import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateRequestApi } from "../../api/user.api.js";
import { useFileHandler, useInputValidation } from "6pp";
import { setIsLoading, setUser } from "../../app/slices/authSlice";

function MyProfileDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const constantCSSClasses =
    "sm:input input-bordered input-sm  flex items-center mb-4 gap-2";

  const avatar = useFileHandler("single");
  const updatedEmail = useInputValidation(user?.email);
  const updatedUsername = useInputValidation(user?.username);
  const updatedPassword = useInputValidation("");

  const [udatedIsAcceptingMumbles, setUpdatedIsAcceptingMumbles] = useState(
    user?.isAcceptingMumbles
  );
  const [updatedIsAnonymous, setUpdatedIsAnonymous] = useState(
    user?.isAnonymous
  );

  const submitUpdateRequest = async () => {
    const formData = new FormData();
    if (updatedEmail.value === "" || updatedUsername.value === "") {
      return toast.error("fill the all fields");
    }
    dispatch(setIsLoading(true));
    formData.append("updatedEmail", updatedEmail.value);
    formData.append("updatedUsername", updatedUsername.value);
    formData.append("updatedPassword", updatedPassword.value);
    formData.append("udatedIsAcceptingMumbles", udatedIsAcceptingMumbles);
    formData.append("updatedIsAnonymous", updatedIsAnonymous);
    formData.append("avatar", avatar.file);

    const response = await updateRequestApi(formData);
    dispatch(setIsLoading(false));
    dispatch(setUser(response?.data?.user));
    toast.success(response?.data?.message);
    updatedPassword.clear();
    navigate("/");
  };

  return (
    <div>
      <h1 className="sm:text-2xl text-lg sm:mb-2 text-center">My Details</h1>
      <div className="flex flex-col items-center justify-center">
        {/* Hidden File Input */}
        <input
          id="avatarUpload"
          name="avatar"
          type="file"
          accept="image/*"
          onChange={avatar.changeHandler}
          className="hidden"
        />

        {/* Profile Picture with Edit Icon */}
        <div className="relative">
          <label htmlFor="avatarUpload" className="cursor-pointer">
            <img
              src={user?.avatar?.url}
              alt="avatar"
              className="avatar rounded-full w-24 h-24 mt-3 sm:w-48 sm:h-48 sm:mt-2 object-cover"
            />
            {/* Edit Icon */}
            <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-gray-800 text-white p-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4 sm:w-6 sm:h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.06 19.653a4.5 4.5 0 01-1.697 1.04l-3.477 1.08 1.08-3.477a4.5 4.5 0 011.04-1.697L16.862 3.487z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 8.25l5.25 5.25"
                />
              </svg>
            </span>
          </label>
        </div>

        {/* Username */}
        <p>@{user?.username}</p>
      </div>

      <div className="divider w-full my-1"></div>
      <div className="w-full flex items-center justify-center">
        <div className="sm:w-2/5">
          {user?.avatar?.publicId && (
            <div>
              <label className={constantCSSClasses}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  type="text"
                  className="grow"
                  value={updatedEmail.value}
                  onChange={updatedEmail.changeHandler}
                />
              </label>
              <label className={constantCSSClasses}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input
                  type="text"
                  className="grow"
                  value={updatedUsername.value}
                  onChange={updatedUsername.changeHandler}
                />
              </label>
              <label className={constantCSSClasses}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="text"
                  className="grow"
                  placeholder="Enter new password"
                  value={updatedPassword.value}
                  onChange={updatedPassword.changeHandler}
                />
              </label>
            </div>
          )}
          <div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Become Anonymous</span>
                <input
                  type="checkbox"
                  className="toggle sm:toggle-md toggle-sm"
                  checked={updatedIsAnonymous}
                  onChange={(e) => setUpdatedIsAnonymous(e.target.checked)}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Accept Mumbles</span>
                <input
                  type="checkbox"
                  className="toggle sm:toggle-md toggle-sm"
                  checked={udatedIsAcceptingMumbles}
                  onChange={(e) =>
                    setUpdatedIsAcceptingMumbles(e.target.checked)
                  }
                />
              </label>
            </div>
          </div>

          <div className="text-center">
            <button
              className="btn btn-primary btn-sm sm:btn-md rounded-md"
              onClick={submitUpdateRequest}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfileDetails;
