import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full min-h-[200px]">
      <div className="loader-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
      </div>
    </div>
  );
};

export default Loading;
