import React from "react";
import { Link } from "react-router-dom";
import CampaignIcon from "@mui/icons-material/Campaign";
import ChatIcon from "@mui/icons-material/Chat";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import WhisperIcon from "../components/EchoWhisper/WhisperIcon";

// Reusable button component
const CardButton = ({ text, to, icon }) => {
  return (
    <Link
      to={to}
      className="btn bg-base-300 rounded-lg w-1/2 h-20 text-2xl font-bold font-sans"
    >
      <div className="flex items-center">
        <div>{icon}</div>
        <div>{text}</div>
      </div>
    </Link>
  );
};

function LandingPage() {
  return (
    <div className="flex flex-col bg-base-200 h-full">
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-4">
        {/* Reusing the CardButton component */}
        <CardButton
          text="EchoLink"
          to="/echo-link"
          icon={<ChatIcon sx={{ fontSize: 35 }} />}
        />
        <CardButton
          text="EchoShout"
          to="/echo-shout"
          icon={<CampaignIcon sx={{ fontSize: 50 }} />}
        />
        {/* <CardButton
          text="EchoWhisper"
          to=""
          icon={<ForumOutlinedIcon sx={{ fontSize: 40 }} />}
        /> */}
        <div className="btn bg-base-300 rounded-lg w-1/2 h-20 text-2xl font-bold font-sans">
          <div className="flex items-center">
            <WhisperIcon position={"left"} size={50} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
