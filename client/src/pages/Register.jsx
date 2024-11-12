import { useState, lazy, Suspense, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useFileHandler, useInputValidation } from "6pp";
import { login, register } from "../api/userApi";
import { setIsLoggedIn, setLoading, setUser } from "../app/slices/authSlice";
import toast from "react-hot-toast";

// Lazy loading icons
const GoogleIcon = lazy(() => import("@mui/icons-material/Google"));

const Register = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const dispatch = useDispatch();

  // Using 6pp package for input data handling
  const avatar = useFileHandler("single");
  const email = useInputValidation("");
  const username = useInputValidation("");
  const password = useInputValidation("");

  const toggleSignUp = useCallback(() => setIsSignUp((prev) => !prev), []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    //------------------------------------------//
    if (isSignUp) {
      if (!email.value || !username.value || !password.value || !avatar.file) {
        toast.error("All fields are required for registration.");
        return;
      }
      formData.append("email", email.value);
      formData.append("avatar", avatar.file);
    } else {
      if (!username.value || !password.value) {
        toast.error("Username and Password are required for login.");
        return;
      }
    }
    formData.append("username", username.value);
    formData.append("password", password.value);

    //need major changes here removing the redudent code
    if (isSignUp) {
      dispatch(setLoading(true));
      const response = await register(formData); //register api
      if (response.data) {
        dispatch(setLoading(false));
        dispatch(setIsLoggedIn(true));
        dispatch(setUser(response?.data?.user));
        localStorage.setItem("allowFetch", true);
        toast.success("Registration successful");
      }
    } else {
      const response = await login(formData); //login api
      toast(response?.response?.data?.message);
      if (response.data) {
        dispatch(setIsLoggedIn(true));
        localStorage.setItem("allowFetch", true);
        dispatch(setUser(response?.data?.user));
      }
    }
    //-------------------------------------------//

    email.clear();
    username.clear();
    password.clear();
    avatar.clear();
  };

  return (
    <div className="flex items-center justify-center h-full bg-base-200 rounded-xl px-3">
      <div className="text-center">
        <h2 className="sm:text-2xl font-bold sm:mb-8 mb-2">
          Welcome to EchoRealm
        </h2>

        {/* Centered Container */}
        <div className="container bg-base-100 shadow-2xl rounded-lg flex justify-center items-center p-8">
          <div className="flex flex-col items-center w-full max-w-md">
            <h1 className="text-xl font-bold mb-4">
              {isSignUp ? "Create Account" : "Log In"}
            </h1>

            {isSignUp && (
              <label className="input input-bordered flex items-center gap-2 w-full mb-4">
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

            <label className="input input-bordered flex items-center gap-2 w-full mb-4">
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

            <label className="input input-bordered flex items-center gap-2 w-full mb-4">
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
              <label className="w-full mb-4">
                <div className="label">
                  <span className="label-text">Choose Profile Picture</span>
                </div>
                <input
                  name="avatar"
                  type="file"
                  onChange={avatar.changeHandler}
                  className="file-input file-input-bordered file-input-md w-full max-w-xs"
                />
              </label>
            )}

            {!isSignUp && (
              <button className="mb-4 text-sm">Forgot your password?</button>
            )}

            <button
              className="btn-ghost bg-base-300 py-2 px-6 rounded-full mb-4"
              onClick={handleSubmit}
            >
              {isSignUp ? "Register" : "Login"}
            </button>

            <button
              onClick={toggleSignUp}
              className="border border-white btn-ghost py-2 px-6 rounded-full mb-4"
            >
              {isSignUp ? "Login" : "Register"}
            </button>

            <hr className="w-full h-1 my-4 bg-gray-100 border-0 rounded dark:bg-gray-700"></hr>

            <Suspense fallback={<div>Loading icons...</div>}>
              <div className="btn-ghost bg-base-300 py-2 px-6 rounded-full text-center flex items-center justify-center">
                <GoogleIcon />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
