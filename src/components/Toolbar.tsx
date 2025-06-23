import React from "react";

interface ToolbarProps {
  drawingMode: "none" | "calibration" | "rectangle" | "oval";
  hasScale: boolean;
  onModeChange: (mode: "none" | "calibration" | "rectangle" | "oval") => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  drawingMode,
  hasScale,
  onModeChange,
}) => {
  return (
    <div className="bg-white border-b border-gray-300 p-4 flex items-center space-x-4">
      <button
        onClick={() => onModeChange("none")}
        className={`px-4 py-2 rounded ${
          drawingMode === "none"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        Select
      </button>

      {!hasScale && (
        <button
          onClick={() => onModeChange("calibration")}
          className={`px-4 py-2 rounded ${
            drawingMode === "calibration"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Calibrate scale
        </button>
      )}

      {hasScale && (
        <>
          <div className="h-8 w-px bg-gray-300" />
          <button
            onClick={() => onModeChange("rectangle")}
            className={`px-4 py-2 rounded ${
              drawingMode === "rectangle"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Rectangle
          </button>
          <button
            onClick={() => onModeChange("oval")}
            className={`px-4 py-2 rounded ${
              drawingMode === "oval"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Oval
          </button>
        </>
      )}

      {hasScale && (
        <>
          <div className="h-8 w-px bg-gray-300" />
          <button
            onClick={() => onModeChange("calibration")}
            className="px-4 py-2 text-orange-900 rounded hover:bg-gray-300"
          >
            Recalibrate
          </button>
        </>
      )}
    </div>
  );
};
