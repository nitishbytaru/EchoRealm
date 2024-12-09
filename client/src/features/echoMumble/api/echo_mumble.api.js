import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/echoMumble`;

export const getMumblesApi = async () => {
  try {
    return await axios.get(`${API_URL}/mumbles`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const pinMumbleApi = async (mumbleId) => {
  try {
    return await axios.patch(`${API_URL}/pin/${mumbleId}`);
  } catch (error) {
    console.log(error);
    return error?.response;
  }
};

export const likeThisMumbleApi = async (mumbleId) => {
  try {
    return await axios.patch(`${API_URL}/like/${mumbleId}`);
  } catch (error) {
    console.log(error);
    return error?.response;
  }
};

export const sendMumbleApi = async (mumble) => {
  try {
    return await axios.post(`${API_URL}/mumbles`, mumble, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const setMumblesAsReadApi = async () => {
  try {
    return await axios.patch(`${API_URL}/mumbles`);
  } catch (error) {
    console.log(error);
    return error?.response;
  }
};

export const deleteMumbleApi = async (mumbleId) => {
  try {
    return await axios.delete(`${API_URL}/${mumbleId}`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

// From here all the apis are used to delete the data
export const deleteAllRecievedMumblesApi = async () => {
  try {
    return await axios.delete(`${API_URL}/recieved`);
  } catch (error) {
    console.log(error);
    return error?.response;
  }
};

export const deleteAllSentMumblesApi = async () => {
  try {
    return await axios.delete(`${API_URL}/sent`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return error?.response;
  }
};
