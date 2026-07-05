import { useState, ChangeEvent } from "react";

export const useFileHandler = (type: "single" | "multiple" = "single") => {
  const [file, setFile] = useState<File | null>(null);

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const clear = () => {
    setFile(null);
  };

  return {
    file,
    changeHandler,
    clear,
  };
};
