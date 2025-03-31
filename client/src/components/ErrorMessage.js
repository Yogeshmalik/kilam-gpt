// src/components/ErrorMessage.js
import React from "react";

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div className="w-full text-sm sm:text-base lg:text-lg px-4 py-2 bg-red-600/90 text-white text-center fixed top-[50px] sm:top-[64px] z-50 shadow-md">
    {/* ⚠️ */}
     {error}
  </div>
  );
};

export default ErrorMessage;
