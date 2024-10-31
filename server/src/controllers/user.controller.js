import { User } from "../models/user.model.js";

export const registerUser = (req, res) => {
  console.log("registered succesfully");
  res.send("hello");
};

export const loginUser = (req, res) => {
  console.log("loggedin");
};
