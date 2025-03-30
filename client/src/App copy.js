import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "tailwindcss/tailwind.css";
import "prismjs/themes/prism-tomorrow.css"; // ChatGPT-like theme
import Prism from "prismjs";

const socket = io("http://localhost:5000");

function App() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Ready");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
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

  // 🔥 Highlight Code After AI Response Appears
  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

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
            className="bg-gray-800 p-3 rounded-md overflow-x-auto text-sm shadow-md"
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
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="p-4 text-center bg-gray-800 text-xl font-semibold">
        AI Chat Assistant
      </div>

      {error && (
        <div className="p-2 bg-red-600 text-white text-center">⚠️ {error}</div>
      )}

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
                  : "bg-gray-900 text-gray-100"
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

      <div className="p-4 bg-gray-800 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendTextQuery();
          }}
          className="w-full flex space-x-2"
        >
          <textarea
            className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none resize-none w-full"
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
      </div>
    </div>
  );
}

export default App;



import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://kilam-gpt.onrender.com");

const ALLOWED_EMAILS = ["timelytranscribe@gmail.com", "premium@example.com"];

const useChat = (userEmail) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [queryCount, setQueryCount] = useState(0);
  const hasUnlimitedQueries = userEmail && ALLOWED_EMAILS.includes(userEmail);

  useEffect(() => {
    socket.on("aiTextStream", (chunk) => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];

        if (lastMessage && lastMessage.loading) {
          return prev.map((msg, index) =>
            index === prev.length - 1
              ? { ...msg, content: msg.content + chunk }
              : msg
          );
        }
        return [...prev, { role: "assistant", content: chunk, loading: true }];
      });
    });

    socket.on("aiTextEnd", () => {
      setMessages((prev) =>
        prev.map((msg) => (msg.loading ? { ...msg, loading: false } : msg))
      );
    });

    socket.on("error", (error) => {
      setError(error.message || "Something went wrong!");
    });

    return () => {
      socket.off("aiTextStream");
      socket.off("aiTextEnd");
      socket.off("error");
    };
  }, []);

  const sendTextQuery = (query) => {
    if (!query.trim()) return;

    if (!hasUnlimitedQueries && queryCount >= 4) {
      setError(
        "⚠️ You have reached the free query limit. Sign in for unlimited access."
      );
      return;
    }

    setError(null);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: query, loading: false },
      { role: "assistant", content: "", loading: true },
    ]);

    socket.emit("textQuery", query);

    if (!hasUnlimitedQueries) {
      setQueryCount((prev) => prev + 1);
    }
  };

  return { messages, error, sendTextQuery, setError };
};

export default useChat;

import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
import AgentPulse from "./AgentPulse";

const ChatMessages = ({ messages, status }) => {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  // ✅ Auto-scroll to the bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const parseMessage = (text) => {
    const regex = /(```[\s\S]*?```|`.*?`)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const language = part.match(/```(\w+)/)?.[1] || "javascript";
        const codeContent = part.replace(/```(\w+)?/, "").replace(/```$/, "").trim();
        return (
          <pre
            key={index}
            className="bg-gray-800 p-3 rounded-md overflow-x-auto text-sm text-green-400 font-mono shadow-md"
          >
            <code className={`language-${language} block break-words`}>{codeContent}</code>
          </pre>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <span key={index} className="bg-gray-700 text-green-300 px-1 rounded-sm font-mono">
            {part.replace(/`/g, "")}
          </span>
        );
      }
      return part.split("\n").map((line, i) => (
        <p key={i} className="mb-1 leading-relaxed text-gray-300 break-words">{line}</p>
      ));
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-full break-words">
      {messages.map((msg, index) => (
        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[90%] sm:max-w-2xl px-4 py-3 rounded-lg shadow-md ${
              msg.role === "user" ? "bg-teal-950 font-semibold text-white" : "bg-gray-950 text-gray-200"
            }`}
          >
            {msg.loading ? (
              <div className="flex items-center space-x-2">
                <AgentPulse size="small" color="green" />
                <span>{msg.content || "..."}</span>
              </div>
            ) : (
              parseMessage(msg.content)
            )}
          </div>
        </div>
      ))}

      {/* ✅ Show loading animation while AI is responding */}
      {messages.some((msg) => msg.loading) && (
        <div className="flex justify-start">
          <div className="max-w-[90%] sm:max-w-2xl px-4 py-3 rounded-lg shadow-md bg-gray-900 text-gray-300">
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="w-48 h-4 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="w-40 h-4 bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={chatContainerRef}></div>
      {status !== "Ready" && <p className="text-center text-yellow-400">{status}</p>}
    </div>
  );
};

export default ChatMessages;

