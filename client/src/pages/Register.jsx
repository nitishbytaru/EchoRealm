import React, { useState } from "react";
import appname from "../temp/appname";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Register = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const inputClass = "bg-base-200 w-full mb-3 p-2 rounded";

  const Form = ({ isSignUp }) => (
    <div className="absolute top-0 h-full w-full sm:w-1/2 p-8 flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4">
        {isSignUp ? "Create Account" : "LogIn"}
      </h1>
      <div className="flex space-x-3 mb-4">
        <div className="social bg-base-300 p-3 rounded-full">
          <FacebookIcon />
        </div>
        <div className="social bg-base-300 p-3 rounded-full">
          <GoogleIcon />
        </div>
        <div className="social bg-base-300 p-3 rounded-full">
          <LinkedInIcon />
        </div>
      </div>
      <span className="text-sm mb-4">
        {isSignUp
          ? "or use your email for registration"
          : "or use your account"}
      </span>
      {isSignUp && (
        <input type="text" placeholder="Name" className={inputClass} />
      )}
      <input type="email" placeholder="Email" className={inputClass} />
      <input type="password" placeholder="Password" className={inputClass} />
      {!isSignUp && (
        <button className=" mb-4 text-sm">Forgot your password?</button>
      )}
      <button className="bg-base-300 py-2 px-6 rounded-full">
        {isSignUp ? "Register" : "Login"}
      </button>
    </div>
  );

  const Overlay = ({ isSignUp }) => (
    <>
      {/* Visible on larger screens */}
      <div className="absolute top-0 left-1/2 w-1/2 h-full bg-base-300 justify-center items-center hidden md:flex">
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <h1 className="text-2xl font-bold">
            {isSignUp ? "Welcome Back!" : "Hello, Friend!"}
          </h1>
          <p className="text-sm mb-4">
            {isSignUp
              ? "To keep connected with us please login with your personal info"
              : "Enter your personal details and start your journey with us"}
          </p>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="border border-white py-2 px-6 rounded-full"
          >
            {isSignUp ? "Login" : "Register"}
          </button>
        </div>
      </div>

      {/* Toggle Button for mobile view (320px or smaller) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full md:hidden flex justify-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="border border-base-300 text-base-300 bg-white py-2 px-6 rounded-full"
        >
          {isSignUp ? "Already have account? Log In" : "Create an account"}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full bg-base-200 rounded-xl px-3">
      <h2 className="sm:text-2xl font-bold sm:mb-8 mb-2">
        Welcome to {appname}
      </h2>
      <div className="container relative bg-base-100 shadow-2xl rounded-lg w-full max-w-3xl min-h-[480px]">
        <Form isSignUp={isSignUp} />
        <Form isSignUp={isSignUp} />
        <Overlay isSignUp={isSignUp} />
      </div>
    </div>
  );
};

export default Register;
