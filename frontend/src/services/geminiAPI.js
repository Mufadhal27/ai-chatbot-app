import axios from "axios";

const backendApiUrl = import.meta.env.VITE_APP_BACKEND_URL;

export const sendMessageToGemini = async (prompt) => {
  try {
    // Menggunakan URL lengkap yang diambil dari environment variable
    console.log("URL Backend yang akan dipanggil:", backendApiUrl);
    const response = await axios.post(backendApiUrl, { prompt });
    return response.data.reply;
  } catch (error) {
    console.error("❌ Error di frontend saat panggil backend:", error);
    // Penanganan error yang lebih spesifik
    if (error.response) {
      // Server merespons dengan status code selain 2xx
      console.error("Data:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      throw new Error(error.response.data.error || "Terjadi kesalahan di server.");
    } else if (error.request) {
      // Permintaan dibuat tapi tidak ada respons
      console.error("Request:", error.request);
      throw new Error("Tidak ada respons dari server. Periksa koneksi atau URL.");
    } else {
      // Terjadi kesalahan saat menyiapkan permintaan
      console.error("Message:", error.message);
      throw new Error("Terjadi kesalahan saat mengirim permintaan.");
    }
  }
};
