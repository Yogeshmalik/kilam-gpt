// src/hooks/useChat.js
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://kilam-gpt.onrender.com");

// ✅ Define allowed premium email addresses
const ALLOWED_EMAILS = ["timelytranscribe@gmail.com", "ysmworking@gmail.com"];

const useChat = (userEmail) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [queryCount, setQueryCount] = useState(0);
  // ✅ Check if the user has unlimited queries
  const hasUnlimitedQueries = userEmail && ALLOWED_EMAILS.includes(userEmail);

  useEffect(() => {
    socket.on("aiText", (text) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.loading ? { ...msg, loading: false } : msg))
      );
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    });

    socket.on("aiAudio", (audioBuffer) => {
      const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const audioURL = URL.createObjectURL(audioBlob);
      new Audio(audioURL).play();
    });

    socket.on("error", (error) => {
      setError(error.message || "Something went wrong!");
    });

    return () => {
      socket.off("aiText");
      socket.off("aiAudio");
      socket.off("error");
    };
  }, []);

  const sendTextQuery = (query) => {
    if (!query.trim()) return;

    // ✅ Restrict non-whitelisted users to 4 free queries
    if (!hasUnlimitedQueries && queryCount >= 4) {
      setError(
        "⚠️ You have reached the free query limit. Sign in with an allowed email for unlimited access."
      );
      return;
    }

    setError(null);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: query, loading: true },
    ]);

    socket.emit("textQuery", query, (ack) => {
      if (ack?.error) {
        setError(ack.error);
      }
    });

    // ✅ Increase query count for non-whitelisted users
    if (!hasUnlimitedQueries) {
      setQueryCount((prev) => prev + 1);
    }
  };

  return { messages, error, sendTextQuery, setError };
};

export default useChat;
