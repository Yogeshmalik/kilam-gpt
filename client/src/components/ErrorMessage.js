// src/components/ErrorMessage.js
import React from "react";

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div className="p-2 bg-red-600 text-white text-center">⚠️ {error}</div>
  );
};

export default ErrorMessage;
