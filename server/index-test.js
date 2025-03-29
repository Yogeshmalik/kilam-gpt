import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import os from "os"

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log(
  "🔑 Loaded API Key:",
  OPENAI_API_KEY ? "✅ Valid Key" : "❌ Undefined"
);

if (!OPENAI_API_KEY) {
  console.error("❌ ERROR: OpenAI API key is missing. Check your .env file!");
  process.exit(1);
}

io.on("connection", (socket) => {
  console.log("Client connected");

  const tempDir = path.join(os.tmpdir(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // 🎤 Handle Audio Input (Voice)
  socket.on("audioChunk", async (audioData) => {
    console.log("Received audio data");
    try {
      socket.emit("status", "Processing audio...");

      // ✅ Save audio buffer to a temporary file
      const tempFilePath = path.join(tempDir, `audio_${Date.now()}.wav`);
      fs.writeFileSync(tempFilePath, Buffer.from(audioData));

      // ✅ Transcribe using OpenAI SDK
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "gpt-4o-transcribe", // ✅ Correct model name
      });

      fs.unlinkSync(tempFilePath); // ✅ Delete temporary file after processing

      socket.emit("transcription", transcription.text);
      socket.emit("status", "Processing AI response...");

      // 🎤 Generate AI Response
      await generateAIResponse(socket, transcription.text, true);
    } catch (error) {
      console.error("Error processing:", error);
      socket.emit("error", { message: "AI processing error" });
    }
  });

  // 📝 Handle Text Input (Typing)
  socket.on("textQuery", async (query) => {
    console.log("Received text query:", query);
    socket.emit("status", "Processing AI response...");
    await generateAIResponse(socket, query, false);
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});

// 🔥 Function to Generate AI Response (Text & Speech)
async function generateAIResponse(socket, userInput, isVoice) {
  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: userInput }],
    });

    const aiText = chatResponse.choices?.[0]?.message?.content || "No response";
    socket.emit("aiText", aiText);

    if (isVoice) {
      socket.emit("status", "Generating AI speech...");
      const mp3 = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: aiText,
      });

      const ttsAudioBuffer = Buffer.from(await mp3.arrayBuffer());
      socket.emit("aiAudio", ttsAudioBuffer);
    }

    socket.emit("status", "Complete!");
  } catch (error) {
    console.error("Error generating AI response:", error);
    socket.emit("error", { message: "Error generating response" });
  }
}

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
