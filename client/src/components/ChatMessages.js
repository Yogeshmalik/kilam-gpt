// src/components/ChatMessages.js
import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
import AgentPulse from "./AgentPulse";

const ChatMessages = ({ messages, status }) => {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  // ✅ Auto-scroll to the bottom when messages update
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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-full break-words ">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[90%] sm:max-w-2xl px-4 py-3 rounded-lg shadow-md transition-all duration-300 ${
              msg.role === "user"
                ? " bg-teal-950 font-semibold text-white"
                : "bg-gray-950 text-gray-200"
            }`}
          >
            {msg.loading ? (
              <div className="flex items-center space-x-2">
                <span>{msg.content}</span>
                <AgentPulse size="small" color="green" />
              </div>
            ) : (
              parseMessage(msg.content)
            )}
          </div>
        </div>
      ))}
      {/* ✅ Skeleton Loader: Shows while waiting for AI response */}
      {messages.some((msg) => msg.loading) && (
        <div className="flex justify-start">
          <div className="max-w-[90%] sm:max-w-2xl px-4 py-3 rounded-lg shadow-md bg-gray-900 text-gray-300 ">
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="w-48 h-4 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="w-40 h-4 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="w-52 h-4 bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={chatContainerRef}></div>
      {status !== "Ready" && (
        <p className="text-center text-yellow-400">{status}</p>
      )}
    </div>
  );
};

export default ChatMessages;
