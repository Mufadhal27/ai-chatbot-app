import fetch from "node-fetch";
if (!globalThis.fetch) globalThis.fetch = fetch;


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ API Key Gemini tidak ditemukan. Cek environment variable.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt tidak ditemukan" });
  }

  try {
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;

    res.json({ reply: response.text() });
  } catch (error) {
    console.error("❌ Error Gemini:", error);
    res.status(500).json({ error: "Gagal mendapatkan respon dari Gemini" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
