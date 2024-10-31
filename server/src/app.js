import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    //origin: "https://expense-nd-trackers.netlify.app",
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//importing routes
import userRoute from "./routes/user.route.js";

//routes
app.use("/api/user", userRoute);

export { app };
