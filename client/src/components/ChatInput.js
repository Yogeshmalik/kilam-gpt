// src/components/ChatInput.js
import React from "react";
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

  return (
    <div className="p-4 sticky bottom-0 left-0 right-0 bg-gray-800 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          className="bg-blue-500 flex text-white hover:bg-blue-600 px-4 py-2 rounded-lg font-bold"
          //   onClick={() => window.location.reload()}
          onClick={() => {
            window.location.reload();
          }}
        >
          Refresh
        </button>
      <form onSubmit={handleSubmit} className="w-full flex space-x-2">
        <textarea
          className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none resize-none"
          rows="2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-lg font-bold"
        >
          Send
        </button>
      </form>

      {/* Include AudioControls Component */}
      <AudioControls setError={setError} />
    </div>
  );
};

export default ChatInput;
