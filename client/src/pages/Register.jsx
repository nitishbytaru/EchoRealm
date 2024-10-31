import { useState, lazy, Suspense, memo, useCallback } from "react";
import { useInputValidation } from "6pp";
import appname from "../temp/appname";
import toast from "react-hot-toast";

// Lazy loading icons
const FacebookIcon = lazy(() => import("@mui/icons-material/Facebook"));
const GoogleIcon = lazy(() => import("@mui/icons-material/Google"));
const LinkedInIcon = lazy(() => import("@mui/icons-material/LinkedIn"));

const Register = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  //using 6pp package for the input data handling
  const email = useInputValidation("");
  const username = useInputValidation("");
  const password = useInputValidation("");

  const toggleSignUp = useCallback(() => setIsSignUp((prev) => !prev), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("userId", "1");

    const formData = new FormData();
    if (isSignUp) {
      if (!email.value || !username.value || !password.value) {
        toast.error("All fields are required for registration.");
        return;
      }
      formData.append("email", email.value);
    } else {
      if (!username.value || !password.value) {
        toast.error("Username and Password are required for login.");
        return;
      }
    }
    formData.append("username", username.value);
    formData.append("password", password.value);

    console.log("Form submitted:", Object.fromEntries(formData));

    email.clear();
    username.clear();
    password.clear();
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
            <input
              type="email"
              placeholder="Email"
              value={email.value}
              onChange={email.changeHandler}
              name="email"
              className="bg-base-200 w-full mb-3 p-2 rounded"
              required={isSignUp}
            />
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
        <>
          {/* Visible on larger screens */}
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

          {/* Toggle Button for mobile view (320px or smaller) */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full md:hidden flex justify-center">
            <button
              onClick={toggleSignUp}
              className="border border-base-300 text-base-300 bg-white py-2 px-6 rounded-full"
            >
              {isSignUp
                ? "Already have an account? Log In"
                : "Create an account"}
            </button>
          </div>
        </>
      </div>
    </div>
  );
};

export default Register;
