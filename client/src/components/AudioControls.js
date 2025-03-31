// src/components/AudioControls.js
import React, { useRef, useState } from "react";
import io from "socket.io-client";
import AgentPulse from "./AgentPulse";

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
      className={`sm:px-2 py-2 text-white text-3xl rounded-lg font-bold w-ful sm:w-auto 
    ${
      recording
        ? "bg-red-5"
        : isDisabled
        ? "hidden bg-gray-40 cursor-not-allowed opacity-50"
        : "bg-yellow-5 hover:bg-yellow-6 cursor-pointer"
    }`}
    >
      {recording ? (
        <AgentPulse color="green" />
      ) : (
        <span
          className="shadow-lg hover:opacity-80 transition-opacity duration-200"
          title="Hold to record"
        >
          🎤
        </span>
      )}
    </button>
  );
};

export default AudioControls;
