import fetch from "node-fetch";
if (!globalThis.fetch) globalThis.fetch = fetch;

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi Express app
const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// ====== MONGODB SETUP ======
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log("✅ Menggunakan koneksi MongoDB yang sudah ada.");
    return cachedDb;
  }

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI tidak ditemukan. Cek environment variable Vercel.");
    throw new Error("MONGO_URI tidak ditemukan.");
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    const db = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Menonaktifkan buffering perintah
      serverSelectionTimeoutMS: 5000, // Timeout untuk server selection
      socketTimeoutMS: 45000, // Timeout untuk operasi socket
    });
    cachedDb = db;
    console.log("✅ Terhubung ke MongoDB Atlas.");
    return db;
  } catch (err) {
    console.error("❌ Gagal konek MongoDB:", err);
    throw err;
  }
}

// ====== SCHEMA ======
let Chat;
try {
  Chat = mongoose.model("Chat");
} catch (error) {
  const chatSchema = new mongoose.Schema({
    prompt: String,
    reply: String,
    createdAt: { type: Date, default: Date.now },
  });
  Chat = mongoose.model("Chat", chatSchema);
}

// ====== GEMINI SETUP ======
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ API Key Gemini tidak ditemukan. Cek environment variable Vercel.");
  throw new Error("GEMINI_API_KEY tidak ditemukan.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ====== ROUTES ======
app.post("/api/chat", async (req, res) => {
  // Pastikan koneksi ke DB sebelum setiap permintaan
  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error("Gagal terhubung ke database:", dbError);
    return res.status(500).json({ error: "Terjadi kesalahan server: Gagal konek ke database." });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt tidak ditemukan" });
  }

  try {
    const chat = model.startChat({ history: [] }); 
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const reply = response.text();

    // Simpan ke MongoDB
    const newChat = new Chat({ prompt, reply });
    await newChat.save();

    res.json({ reply });
  } catch (error) {
    console.error("❌ Error Gemini atau simpan ke DB:", error);
    if (error.message.includes("API key not valid")) {
        res.status(500).json({ error: "Terjadi masalah dengan kunci API Gemini. Harap periksa kunci Anda." });
    } else {
        res.status(500).json({ error: "Gagal mendapatkan respon dari Gemini atau menyimpan chat." });
    }
  }
});

export default app; 