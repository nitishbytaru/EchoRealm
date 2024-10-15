import React, { memo } from "react";
import messages from "../../../temp/data/sampleMessages";

const ListenWhisper = memo(() => {
  return (
    <div className="flex flex-col bg-base-200 h-full p-4 rounded-xl">
      <div className="overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {messages.map((message, index) => (
            <div key={index} className="card bg-base-100 w-96 shadow-xl">
              <div className="card-body">
                <div className="card-actions justify-between">
                  <h2 className="card-title">@Username</h2>
                  <button className="btn btn-sm">X</button>
                </div>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ListenWhisper;
