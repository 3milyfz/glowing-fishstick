import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

interface RunCodeButtonProps {
  isRunning: boolean;
  onClick: () => void;
}

export default function RunCodeButton({
  isRunning,
  onClick,
}: RunCodeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isRunning}
      className={`p-2 rounded-lg flex items-center justify-center w-full max-w-xs font-bold transition-transform duration-150 ${
        isRunning
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 active:scale-95 text-white"
      }`}
    >
      {isRunning ? <CircularProgress size={24} color="inherit" /> : "Run Code"}
    </button>
  );
}
