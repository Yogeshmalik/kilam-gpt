// src/components/AudioControls.js
import React, { useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://kilam-gpt.onrender.com");

const AudioControls = ({ setError }) => {
  const [recording, setRecording] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      let audioChunks = [];

      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const reader = new FileReader();
        reader.readAsArrayBuffer(audioBlob);
        reader.onloadend = () => {
          socket.emit("audioChunk", reader.result, (ack) => {
            if (ack?.error) {
              setError(ack.error);
            }
          });
        };
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      setError("Microphone access denied!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <button
      disabled={isDisabled} // Make button non-clickable
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      className={`px-4 py-2 rounded-lg font-bold w-full sm:w-auto 
    ${
      recording
        ? "bg-red-500"
        : isDisabled
        ? "hidden bg-gray-400 cursor-not-allowed opacity-50"
        : "bg-yellow-500 hover:bg-yellow-600"
    }`}
    >
      {recording ? "Recording..." : "Hold to Speak"}
    </button>
  );
};

export default AudioControls;
