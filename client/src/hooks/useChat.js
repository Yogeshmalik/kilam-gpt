// src/hooks/useChat.js
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useClerk } from "@clerk/clerk-react";

const socket = io("https://kilam-gpt.onrender.com");

// ✅ Define allowed premium email addresses
const ALLOWED_EMAILS = ["timelytranscribe@gmail.com", "smworking@gmail.com"];

const useChat = (userEmail) => {
  const { signOut } = useClerk();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [queryCount, setQueryCount] = useState(0);
  // const [queryCount, setQueryCount] = useState(
  //   parseInt(localStorage.getItem("queryCount")) || 0
  // );

  // ✅ Check if the user has unlimited queries
  const hasUnlimitedQueries = userEmail && ALLOWED_EMAILS.includes(userEmail);
  const isLoggedIn = !!userEmail;

  // ✅ Define query limits
  const QUERY_LIMIT = hasUnlimitedQueries ? Infinity : isLoggedIn ? 2 : 1;

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

    // ✅ Check if the user is signed in
    if (!isLoggedIn && queryCount >= QUERY_LIMIT) {
      setError(
        "⚠️ You have reached your free query limit. Please sign in to continue."
      );
      return;
    }

    // ✅ Restrict non-whitelisted users to free queries
    if (isLoggedIn && !hasUnlimitedQueries && queryCount >= QUERY_LIMIT) {
      setError(
        // `🚨 You have exhausted your free queries. (${QUERY_LIMIT}).`
        "🚨 You have exhausted your free queries."
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

    // ✅ Increase and save query count for non-whitelisted users
    if (!hasUnlimitedQueries) {
      const newCount = queryCount + 1;
      setQueryCount(newCount);
      // localStorage.setItem("queryCount", newCount);
    }
  };

  // ✅ Logout function when limit is reached
  const handleLogout = () => {
    signOut(); // Clerk logout
    // localStorage.removeItem("queryCount"); // Reset query count
    // window.location.reload(); // Refresh the page after logout
  };

  return { messages, error, sendTextQuery, setError, handleLogout };
};

export default useChat;
