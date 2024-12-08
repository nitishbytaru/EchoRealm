import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

//middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//importing routes
import authRoute from "./features/auth/routes/auth.routes.js";
import userRoute from "./features/user/routes/user.routes.js";
import echoShoutRoute from "./features/echoShout/routes/echo_shout.routes.js";
import echoMumbleRoute from "./features/echoMumble/routes/echo_mumble.routes.js";
import echoLinkRoute from "./features/echoLink/routes/echo_link.routes.js";
import friendsRoute from "./features/user/routes/friends.routes.js";

//routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/echoShout", echoShoutRoute);
app.use("/api/echoMumble", echoMumbleRoute);
app.use("/api/echoLink", echoLinkRoute);
app.use("/api/friends", friendsRoute);

export { app };
