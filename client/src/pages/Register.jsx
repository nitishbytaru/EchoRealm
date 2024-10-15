import React from "react";
import { useState } from "react";
import appname from "../temp/appname";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formTypeLogin, setFormTypeLogin] = useState(true);
  const handleFormTypeToggle = () => setFormTypeLogin((prev) => !prev);

  // Reusable input component for form
  const InputField = ({ label, type, placeholder, required }) => (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="input input-bordered"
        required={required}
        aria-label={label}
      />
    </div>
  );

  return (
    <div className="hero bg-base-200 h-full">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">
            {formTypeLogin ? "Login now!" : "Register now!"}
          </h1>
          <p className="py-6">
            {appname} is more than just messaging — it's where the magic
            happens! Dive into our Anonymous Room, where you can send messages
            and mention others, all while staying completely anonymous. Let the
            mystery unfold!
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body">
            <InputField
              label="Username"
              type="text"
              placeholder="Username"
              required
            />
            {!formTypeLogin && (
              <InputField
                label="Email"
                type="email"
                placeholder="Email"
                required
              />
            )}
            <InputField
              label="Password"
              type="password"
              placeholder="Password"
              required
            />

            <label className="label">
              <button
                type="button"
                className="label-text-alt link link-hover"
                onClick={handleFormTypeToggle}
              >
                {formTypeLogin
                  ? "New here? Register now!"
                  : "Already have an account? Login here!"}
              </button>
            </label>

            <div className="form-control mt-6">
              <button
                onClick={() => {
                  localStorage.setItem("userId", 1);
                  navigate("home");
                }}
                className="btn btn-primary"
                type="submit"
              >
                {formTypeLogin ? "Login" : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
