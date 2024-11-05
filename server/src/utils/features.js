import jwt from "jsonwebtoken";

export const cookieOptions = {
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
  path:"/",
};

export const sendToken = (res, user, code, message) => {
  try {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const userObject = user.toObject();
    delete userObject.password;

    return res.status(code).cookie("echo-token", token, cookieOptions).json({
      success: true,
      user: userObject,
      message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error generating token",
      error: error.message,
    });
  }
};
