import { useState, ChangeEvent } from "react";

export const useInputValidation = (initialValue: string = "") => {
  const [value, setValue] = useState(initialValue);

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const clear = () => {
    setValue("");
  };

  return {
    value,
    changeHandler,
    clear,
  };
};
