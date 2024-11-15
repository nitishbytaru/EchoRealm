import { useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFileHandler, useInputValidation } from "6pp";
import { login, register } from "../api/userApi";
import { setIsLoggedIn, setLoading, setUser } from "../app/slices/authSlice";
import toast from "react-hot-toast";

// Lazy loading icons
const GoogleIcon = lazy(() => import("@mui/icons-material/Google"));

const Register = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const dispatch = useDispatch();

  const { isMobile } = useSelector((state) => state.auth);

  // Using 6pp package for input data handling
  const avatar = useFileHandler("single");
  const email = useInputValidation("");
  const username = useInputValidation("");
  const password = useInputValidation("");

  const Register = async (e) => {
    e.preventDefault();
    if (!email.value || !username.value || !password.value || !avatar.file) {
      toast.error("All fields are required for registration.");
      return;
    }

    const formData = new FormData();

    formData.append("username", username.value);
    formData.append("password", password.value);
    formData.append("email", email.value);
    formData.append("avatar", avatar.file);

    dispatch(setLoading(true));
    const response = await register(formData); //register api
    if (response.data) {
      dispatch(setLoading(false));
      dispatch(setIsLoggedIn(true));
      dispatch(setUser(response?.data?.user));
      localStorage.setItem("allowFetch", true);
      toast.success("Registration successful");
    }

    email.clear();
    username.clear();
    password.clear();
    avatar.clear();
  };

  const Login = async (e) => {
    e.preventDefault();
    if (!username.value || !password.value) {
      toast.error("All fields are required for registration.");
      return;
    }

    const formData = new FormData();

    formData.append("username", username.value);
    formData.append("password", password.value);

    const response = await login(formData); //login api
    toast(response?.response?.data?.message);
    if (response.data) {
      dispatch(setIsLoggedIn(true));
      localStorage.setItem("allowFetch", true);
      dispatch(setUser(response?.data?.user));
    }

    username.clear();
    password.clear();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-base-200 rounded-xl p-4 sm:p-6 md:p-8 text-center">
      <h2 className="text-lg sm:text-2xl font-bold mb-4">
        Welcome to EchoRealm
      </h2>

      {/* Centered Container */}
      <div className="bg-base-100 shadow-2xl rounded-lg flex justify-center items-center p-4 sm:p-6 md:p-8 w-full max-w-md">
        <div className="flex flex-col items-center w-full">
          <h1 className="text-lg sm:text-xl font-bold mb-4">
            <div className="flex relative">
              {/* Toggle Options */}
              <div
                className="cursor-pointer m-1 p-2"
                onClick={() => setIsSignUp(true)}
              >
                Register
              </div>
              <div
                className="cursor-pointer m-1 p-2"
                onClick={() => setIsSignUp(false)}
              >
                Log In
              </div>

              {/* Animated Toggle Indicator */}
              <div
                className={`absolute bottom-0 h-1 bg-black transition-all duration-300 ease-in-out`}
                style={{
                  width: "50%",
                  transform: `translateX(${isSignUp ? "0%" : "100%"})`,
                }}
              ></div>
            </div>
          </h1>

          {isSignUp && (
            <label
              className={`${
                isMobile ? "input-sm" : ""
              } input input-bordered flex items-center gap-2 w-full mb-4`}
            >
              Email:
              <input
                type="text"
                className="grow"
                placeholder="daisy@site.com"
                value={email.value}
                onChange={email.changeHandler}
                name="email"
                required={isSignUp}
              />
            </label>
          )}

          <label
            className={`${
              isMobile ? "input-sm" : ""
            } input input-bordered flex items-center gap-2 w-full mb-4`}
          >
            Username:
            <input
              type="text"
              className="grow"
              placeholder="user24"
              name="username"
              value={username.value}
              onChange={username.changeHandler}
            />
          </label>

          <label
            className={`${
              isMobile ? "input-sm" : ""
            } input input-bordered flex items-center gap-2 w-full mb-4`}
          >
            Password:
            <input
              type="password"
              className="grow"
              placeholder="......"
              value={password.value}
              onChange={password.changeHandler}
              name="password"
              required
            />
          </label>

          {isSignUp && (
            <>
              <div>Profile picture</div>
              <label
                className={`${
                  isMobile ? "input-sm" : ""
                } input input-bordered flex items-center p-0 gap-2 w-full mb-4`}
              >
                <input
                  name="avatar"
                  type="file"
                  onChange={avatar.changeHandler}
                  className={`file-input ${
                    isMobile ? "file-input-sm" : "file-input-md"
                  } w-full max-w-xs`}
                />
              </label>
            </>
          )}

          {isSignUp ? (
            <button
              className="btn-ghost bg-base-300 py-2 px-6 rounded-full mb-1"
              onClick={Register}
            >
              Register
            </button>
          ) : (
            <button
              className="btn-ghost bg-base-300 py-2 px-6 rounded-full mb-1"
              onClick={Login}
            >
              Login
            </button>
          )}

          <hr className="w-full h-1 my-4 bg-gray-100 border-0 rounded dark:bg-gray-700"></hr>

          <Suspense fallback={<div>Loading icons...</div>}>
            <label className="w-full">
              <div className="label">
                <span className="label-text">Login with Google</span>
              </div>
              <div
                name="google-icon"
                className="w-full btn-ghost bg-base-300 py-2 px-6 rounded-full text-center flex items-center justify-center"
              >
                <GoogleIcon />
              </div>
            </label>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Register;
