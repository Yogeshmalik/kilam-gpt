// src/components/ChatInput.js
import React, { useEffect, useRef } from "react";
import AudioControls from "./AudioControls";

const ChatInput = ({ query, setQuery, sendTextQuery, setError }) => {
  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Ensure query is valid before sending
    if (!query || typeof query !== "string" || !query.trim()) {
      setError("⚠️ Please enter a valid query.");
      return;
    }

    sendTextQuery(query.trim());
    setQuery(""); // ✅ Clear input after sending
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const textareaRef = useRef(null);

  const adjustTextareaHeight = (textarea) => {
    textarea.style.height = "auto"; // Reset height first
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"; // Limit max height (200px)
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current); // Adjust on mount
    }
  }, [query]);

  return (
    <div className="px-3 py-3 sm:p-4 sticky bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 via-gray-900 to-black shadow-md">
      <div className="flex items-center justify-between space-x-1 sm:space-x-3 w-full">
        <button
          className="sm:p-3 rounded-full text-3xl font-bold text-white shadow-lg hover:opacity-80 transition-opacity duration-200"
          onClick={() => window.location.reload()}
          title="Refresh"
        >
          ↺
        </button>
        <form
          onSubmit={handleSubmit}
          className={`flex flex-1 items-center bg-gray-700/50 px-2 sm:px-4 py-2 border border-gray-600 shadow-inner overflow-auto transition-all duration-300 ${
            query.length > 50 ? "rounded-lg" : "rounded-full"
          }`}
        >
          <textarea
            className="flex-1 p-2 bg-transparent text-white border-none focus:ring-0 focus:outline-none resize-none placeholder-gray-400 whitespace-pre-wrap"
            rows="1"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              adjustTextareaHeight(e.target);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            ref={textareaRef}
          />
          <button
            type="submit"
            className="sm:p-3 rounded-full text-3xl g-gradient-to-r from-gray-800 to-gray-600 text-white shadow-lg hover:opacity-80 transition-opacity duration-200"
            title="Send"
          >
            ➤
          </button>
        </form>
        {/* Include AudioControls Component */}
        <AudioControls setError={setError} />
      </div>
    </div>
  );
};

export default ChatInput;
