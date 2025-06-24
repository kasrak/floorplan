import React from "react";
import type { Shape } from "../types";
import { DimensionInput } from "./DimensionInput";

interface ShapePanelProps {
  shape: Shape | null;
  scale: number | null;
  onUpdateSize: (
    id: string,
    widthInInches: number,
    heightInInches: number
  ) => void;
  onUpdateName: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export const ShapePanel: React.FC<ShapePanelProps> = ({
  shape,
  scale,
  onUpdateSize,
  onUpdateName,
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

  const handleWidthChange = ({
    inches,
  }: {
    originalInput: string;
    inches: number;
  }) => {
    if (inches > 0) {
      onUpdateSize(shape.id, inches, shape.sizeInInches.height);
    }
  };

  const handleHeightChange = ({
    inches,
  }: {
    originalInput: string;
    inches: number;
  }) => {
    if (inches > 0) {
      onUpdateSize(shape.id, shape.sizeInInches.width, inches);
    }
  };

  return (
    <div className="w-64 bg-gray-100 p-4 border-l border-gray-300">
      <h3 className="text-lg font-semibold mb-4">Shape Properties</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={shape.name}
            onChange={(e) => onUpdateName(shape.id, e.target.value)}
            className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <p className="capitalize">{shape.type}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width
          </label>
          <DimensionInput
            value={shape.sizeInInches.width}
            onInput={handleWidthChange}
            placeholder={"e.g., 36, 36\", 3'"}
          />
          <p className="mt-1 text-xs text-gray-600">
            {shape.sizeInInches.width >= 12
              ? `${Math.floor(shape.sizeInInches.width / 12)}'${
                  shape.sizeInInches.width % 12 > 0
                    ? (shape.sizeInInches.width % 12).toFixed(1) + '"'
                    : ""
                }`
              : `${shape.sizeInInches.width.toFixed(1)}"`}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <DimensionInput
            value={shape.sizeInInches.height}
            onInput={handleHeightChange}
            placeholder={"e.g., 24, 24\", 2'"}
          />
          <p className="mt-1 text-xs text-gray-600">
            {shape.sizeInInches.height >= 12
              ? `${Math.floor(shape.sizeInInches.height / 12)}'${
                  shape.sizeInInches.height % 12 > 0
                    ? (shape.sizeInInches.height % 12).toFixed(1) + '"'
                    : ""
                }`
              : `${shape.sizeInInches.height.toFixed(1)}"`}
          </p>
        </div>
        <button
          onClick={() => onDelete(shape.id)}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete shape
        </button>
      </div>
    </div>
  );
};
