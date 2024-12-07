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
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import echoShoutRoute from "./routes/echoShout.route.js";
import echoMumbleRoute from "./routes/echoMumble.route.js";
import echoLinkRoute from "./routes/echoLink.route.js";
import friendsRoute from "./routes/friends.route.js";

//routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/echoShout", echoShoutRoute);
app.use("/api/echoMumble", echoMumbleRoute);
app.use("/api/echoLink", echoLinkRoute);
app.use("/api/friends", friendsRoute);

export { app };
