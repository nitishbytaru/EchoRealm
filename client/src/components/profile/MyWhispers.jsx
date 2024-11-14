import { useEffect } from "react";
import { getWhispers } from "../../api/echoWhisperApi";

function MyWhispers() {
  useEffect(() => {
    const func = async () => {
      const response = await getWhispers();
      const finalResponse = response?.data?.whispers.filter(
        (whisper) => whisper?.showOthers == true
      );
      console.log(finalResponse);
    };
    func();
  }, []);

  return <div>MyWhispers</div>;
}

export default MyWhispers;
