const AgentPulse = ({ size = "medium", color = "blue" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 sm:w-7 h-6 sm:h-7",
    large: "w-16 h-16",
  };

  const colorClassess = {
    blue: "bg-blue-500 shadow-[0_0_8px_4px_rgba(59, 130, 246, 0.5)]",
    green: "bg-green-500 shadow-[0_0_8px_4px_rgba(34, 197, 94, 0.5)]",
    purple: "bg-purple-500 shadow-[0_0_8px_4px_rgba(168, 85, 247, 0.5)]",
  };
  return (
    <div
      className={`${sizeClasses[size]} ${colorClassess[color]} rounded-full animate-pulse`}
    />
  );
};

export default AgentPulse;
