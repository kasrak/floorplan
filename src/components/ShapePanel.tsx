import React from "react";
import type { Shape } from "../types";

interface ShapePanelProps {
  shape: Shape | null;
  scale: number | null;
  onUpdateSize: (
    id: string,
    widthInInches: number,
    heightInInches: number
  ) => void;
  onDelete: (id: string) => void;
}

export const ShapePanel: React.FC<ShapePanelProps> = ({
  shape,
  scale,
  onUpdateSize,
  onDelete,
}) => {
  if (!shape || !scale) {
    return (
      <div className="w-64 bg-gray-100 p-4 border-l border-gray-300">
        <p className="text-gray-500 text-center">
          {!scale ? "Please calibrate scale first" : "Select a shape to edit"}
        </p>
      </div>
    );
  }

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const widthInInches = parseFloat(e.target.value);
    if (!isNaN(widthInInches) && widthInInches > 0) {
      onUpdateSize(shape.id, widthInInches, shape.sizeInInches.height);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const heightInInches = parseFloat(e.target.value);
    if (!isNaN(heightInInches) && heightInInches > 0) {
      onUpdateSize(shape.id, shape.sizeInInches.width, heightInInches);
    }
  };

  return (
    <div className="w-64 bg-gray-100 p-4 border-l border-gray-300">
      <h3 className="text-lg font-semibold mb-4">Shape Properties</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <p className="capitalize">{shape.type}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width (inches)
          </label>
          <input
            type="number"
            step="0.1"
            value={shape.sizeInInches.width.toFixed(1)}
            onChange={handleWidthChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (inches)
          </label>
          <input
            type="number"
            step="0.1"
            value={shape.sizeInInches.height.toFixed(1)}
            onChange={handleHeightChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => onDelete(shape.id)}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete Shape
        </button>
      </div>
    </div>
  );
};
