import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import FormData from "form-data"; // ✅ FIXED: Use `form-data`
import { fetch } from "undici"; // ✅ Use `undici` for HTTP requests

dotenv.config();

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

  // 🎤 Handle Audio Input (Voice)
  socket.on("audioChunk", async (audioData) => {
    console.log("Received audio data");
    try {
      socket.emit("status", "Processing audio...");

      // ✅ Save Buffer to a temporary file
      const tempFilePath = path.join(process.cwd(), "temp_audio.wav");
      fs.writeFileSync(tempFilePath, Buffer.from(audioData));

      // ✅ Create FormData and append the file correctly
      const formData = new FormData();
      formData.append("file", fs.createReadStream(tempFilePath)); // ✅ FIXED
      formData.append("model", "whisper-1");

      // ✅ Send audio to OpenAI Whisper API for transcription
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: formData, // ✅ Automatically sets correct Content-Type
      });

      // ✅ Delete temporary file
      fs.unlinkSync(tempFilePath);

      const data = await response.json();
      if (!data.text) throw new Error(`Whisper API failed: ${JSON.stringify(data)}`);

      const transcription = data.text;
      socket.emit("transcription", transcription);
      socket.emit("status", "Processing AI response...");

      // 🎤 Get AI response from GPT-4 Turbo
      await generateAIResponse(socket, transcription, true);
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
    const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: userInput }],
      }),
    });

    const chatData = await chatResponse.json();
    const aiText = chatData.choices?.[0]?.message?.content || "No response";
    socket.emit("aiText", aiText);
    
    if (isVoice) {
      socket.emit("status", "Generating AI speech...");
      const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: aiText,
          voice: "alloy",
        }),
      });

      const ttsAudioBuffer = await ttsResponse.arrayBuffer();
      socket.emit("aiAudio", Buffer.from(ttsAudioBuffer));
    }

    socket.emit("status", "Complete!");
  } catch (error) {
    console.error("Error generating AI response:", error);
    socket.emit("error", { message: "Error generating response" });
  }
}

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
