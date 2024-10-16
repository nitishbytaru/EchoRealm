import React from "react";
import { Link } from "react-router-dom";
import CampaignIcon from "@mui/icons-material/Campaign";
import ChatIcon from "@mui/icons-material/Chat";
import WhisperIcon from "../components/EchoWhisper/WhisperIcon";

// Reusable button component
const CardButton = ({ text, to, icon }) => {
  return (
    <Link
      to={to}
      className="btn bg-base-300 rounded-lg w-full sm:w-1/2 h-16 sm:h-20 text-xl sm:text-2xl font-bold font-sans"
    >
      <div className="flex items-center space-x-2">
        <div>{icon}</div>
        <div>{text}</div>
      </div>
    </Link>
  );
};

function LandingPage() {
  return (
    <div className="flex flex-col bg-base-200 h-full rounded-xl">
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-4">
        {/* Reusing the CardButton component */}
        <CardButton
          text="EchoLink"
          to="/echo-link"
          icon={<ChatIcon sx={{ fontSize: { xs: 28, sm: 35 } }} />}
        />
        <CardButton
          text="EchoShout"
          to="/echo-shout"
          icon={<CampaignIcon sx={{ fontSize: { xs: 40, sm: 50 } }} />}
        />
        <div className="btn bg-base-300 rounded-lg w-full sm:w-1/2 h-16 sm:h-20 text-xl sm:text-2xl font-bold font-sans">
          <div className="flex items-center space-x-2">
            <WhisperIcon position={"left"} size={40} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
