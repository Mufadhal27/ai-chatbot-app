import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const sendMessageToGemini = async (prompt) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/chat`, { prompt });
    return response.data.reply;
  } catch (error) {
    console.error("❌ Error di frontend saat panggil backend:", error);
    throw error;
  }
};
