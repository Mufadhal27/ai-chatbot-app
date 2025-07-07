import axios from "axios";

const API_ENDPOINT = "/api/chat";

export const sendMessageToGemini = async (prompt) => {
  try {
    const response = await axios.post(API_ENDPOINT, { prompt });
    return response.data.reply;
  } catch (error) {
    console.error("❌ Error di frontend saat panggil backend:", error);
    // Tambah penanganan error yang lebih spesifik jika diperlukan
    if (error.response) {
      // Server merespons dengan status code selain 2xx
      console.error("Data:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      throw new Error(error.response.data.error || "Terjadi kesalahan di server.");
    } else if (error.request) {
      // Request dibuat tapi tidak ada respons
      console.error("Request:", error.request);
      throw new Error("Tidak ada respons dari server. Periksa koneksi atau URL.");
    } else {
      // Terjadi kesalahan saat menyiapkan permintaan
      console.error("Message:", error.message);
      throw new Error("Terjadi kesalahan saat mengirim permintaan.");
    }
  }
};