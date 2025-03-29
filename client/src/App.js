import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "tailwindcss/tailwind.css";
import "prismjs/themes/prism-tomorrow.css";
import Prism from "prismjs";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import Header from "./components/Header";
import Footer from "./components/Footer";

// const socket = io("http://localhost:5000");
const socket = io("https://kilam-gpt.onrender.com");

function App() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Ready");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const chatContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);


  useEffect(() => {
    socket.on("status", (message) => setStatus(message));

    socket.on("aiText", (text) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.loading ? { ...msg, loading: false } : msg))
      );
      typeResponse(text);
      setStatus("Complete");
    });

    socket.on("aiAudio", (audioBuffer) => {
      const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const audioURL = URL.createObjectURL(audioBlob);
      new Audio(audioURL).play();
    });

    // 🚨 Error handling
    socket.on("error", (error) => {
      console.error("Server Error:", error);
      setError(error.message || "Something went wrong!");
    });

    return () => {
      socket.off("status");
      socket.off("aiText");
      socket.off("aiAudio");
      socket.off("error");
    };
  }, []);

  const typeResponse = (text) => {
    let index = 0;
    const words = text.split(" ");
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const interval = setInterval(() => {
      if (index < words.length) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = words
            .slice(0, index + 1)
            .join(" ");
          return newMessages;
        });
        index++;
      } else {
        clearInterval(interval);
      }
      scrollToBottom();
    }, 50);
  };

  const sendTextQuery = () => {
    if (query.trim() !== "") {
      setError(null);
      setStatus("Processing...");
      setMessages((prev) => [
        ...prev,
        { role: "user", content: query, loading: true },
      ]);

      socket.emit("textQuery", query, (ack) => {
        if (ack?.error) {
          setError(ack.error);
        }
      });

      setQuery("");
      scrollToBottom();
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setStatus("Recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      let audioChunks = [];

      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
      mediaRecorder.onstop = async () => {
        setStatus("Processing audio...");
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
      console.error("Recording Error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  // 📜 Format AI response (line breaks, code blocks, and inline code)
  const parseMessage = (text) => {
    const regex = /(```[\s\S]*?```|`.*?`)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part?.startsWith("```") && part?.endsWith("```")) {
        const language = part.match(/```(\w+)/)?.[1] || "javascript";
        const codeContent = part
          .replace(/```(\w+)?/, "")
          .replace(/```$/, "")
          .trim();
        return (
          <pre
            key={index}
            className="bg-gray-800 p-3 rounded-md overflow-x-auto text-sm text-green-400 font-mono shadow-md"
          >
            <code className={`language-${language} block break-words`}>
              {codeContent}
            </code>
          </pre>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <span
            key={index}
            className="bg-gray-700 text-green-300 px-1 rounded-sm font-mono"
          >
            {part.replace(/`/g, "")}
          </span>
        );
      }
      return part.split("\n").map((line, i) => (
        <p key={i} className="mb-1 leading-relaxed text-gray-300 break-words">
          {line}
        </p>
      ));
    });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <div className="bg-gray-800 h-scree flex items-center justify-center">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="border rounded-md border-1 px-6 py-3 text-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Show Chat App if User is Signed In */}
      <SignedIn>
        <div className="flex flex-col h-screen bg-gray-900 text-white">
          <Header />
          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-600 text-white text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-full break-words">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-2xl px-4 py-3 rounded-lg shadow-md ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800 text-gray-200"
                  }`}
                >
                  {msg.loading ? (
                    <div className="flex items-center space-x-2">
                      <span>{msg.content}</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    </div>
                  ) : (
                    parseMessage(msg.content)
                  )}
                </div>
              </div>
            ))}
            <div ref={chatContainerRef}></div>
          </div>

          {/* Input Section */}
          <div className="p-4 bg-gray-800 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendTextQuery();
              }}
              className="w-full flex space-x-2"
            >
            <button
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-bold"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
              <textarea
                className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none resize-none"
                rows="2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendTextQuery();
                  }
                }}
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-bold"
              >
                Send
              </button>
            </form>

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
          </div>
        </div>
        {/* <Footer /> */}
      </SignedIn>
    </>
  );
}

export default App;
