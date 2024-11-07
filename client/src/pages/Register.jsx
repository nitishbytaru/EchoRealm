import { useState, lazy, Suspense, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useFileHandler, useInputValidation } from "6pp";
import appname from "../temp/appname";
import toast from "react-hot-toast";
import { login, register } from "../api/userApi";
import { setIsLoggedIn, setLoading, setUser } from "../app/slices/authSlice";

// Lazy loading icons
const FacebookIcon = lazy(() => import("@mui/icons-material/Facebook"));
const GoogleIcon = lazy(() => import("@mui/icons-material/Google"));
const LinkedInIcon = lazy(() => import("@mui/icons-material/LinkedIn"));

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
      toast.success(response?.data?.message);
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
    <div className="flex flex-col items-center justify-center h-full bg-base-200 rounded-xl px-3">
      <h2 className="sm:text-2xl font-bold sm:mb-8 mb-2">
        Welcome to {appname}
      </h2>
      <div className="container relative bg-base-100 shadow-2xl rounded-lg w-full max-w-3xl min-h-[480px]">
        <div className="absolute top-0 h-full w-full sm:w-1/2 p-8 flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold mb-4">
            {isSignUp ? "Create Account" : "Log In"}
          </h1>
          <div className="flex space-x-3 mb-4">
            <Suspense fallback={<div>Loading icons...</div>}>
              <div className="bg-base-300 p-3 rounded-full">
                <FacebookIcon />
              </div>
              <div className="bg-base-300 p-3 rounded-full">
                <GoogleIcon />
              </div>
              <div className="bg-base-300 p-3 rounded-full">
                <LinkedInIcon />
              </div>
            </Suspense>
          </div>
          <span className="text-sm mb-4">
            {isSignUp
              ? "or use your email for registration"
              : "or use your account"}
          </span>
          {isSignUp && (
            <>
              <label htmlFor="avatar">Choose Profile Picture</label>
              <input
                name="avatar"
                type="file"
                accept="image/*"
                onChange={avatar.changeHandler}
                className="file-input file-input-bordered file-input-md bg-base-200 w-full mb-3 p-2 rounded border border-base-300
                           text-base-700 placeholder-base-500 hover:bg-base-300 hover:border-base-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-base-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={email.value}
                onChange={email.changeHandler}
                name="email"
                className="bg-base-200 w-full mb-3 p-2 rounded"
                required={isSignUp}
              />
            </>
          )}
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={username.value}
            onChange={username.changeHandler}
            className="bg-base-200 w-full mb-3 p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password.value}
            onChange={password.changeHandler}
            className="bg-base-200 w-full mb-3 p-2 rounded"
            required
          />
          {!isSignUp && (
            <button className="mb-4 text-sm">Forgot your password?</button>
          )}
          <button
            className="btn-ghost bg-base-300 py-2 px-6 rounded-full"
            onClick={handleSubmit} // Attach the submit handler here
          >
            {isSignUp ? "Register" : "Login"}
          </button>
        </div>

        {/* Overlay and mobile toggle elements */}
        <div className="absolute top-0 left-1/2 w-1/2 h-full bg-base-300 justify-center items-center hidden md:flex">
          <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <h1 className="text-2xl font-bold">
              {isSignUp ? "Welcome Back!" : "Hello, Friend!"}
            </h1>
            <p className="text-sm mb-4">
              {isSignUp
                ? "To keep connected with us, please login with your personal info"
                : "Enter your personal details and start your journey with us"}
            </p>
            <button
              onClick={toggleSignUp}
              className="border border-white btn-ghost py-2 px-6 rounded-full"
            >
              {isSignUp ? "Login" : "Register"}
            </button>
          </div>
        </div>

        {/* Mobile toggle button */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full md:hidden flex justify-center">
          <button
            onClick={toggleSignUp}
            className="border border-base-300 text-base-300 bg-white py-2 px-6 rounded-full"
          >
            {isSignUp ? "Already have an account? Log In" : "Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
