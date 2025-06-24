import React from "react";
import type { Shape } from "../types";

interface ShapesListProps {
  shapes: Shape[];
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
}

export const ShapesList: React.FC<ShapesListProps> = ({
  shapes,
  selectedShapeId,
  onSelectShape,
}) => {
  const getShapeDisplayName = (shape: Shape) => {
    return shape.name;
  };

  return (
    <div className="p-4 border-b border-gray-300 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Shapes</h2>
      <div className="space-y-2">
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={`p-3 rounded cursor-pointer transition-colors ${
              selectedShapeId === shape.id
                ? "bg-blue-100 border border-blue-400"
                : "bg-white hover:bg-gray-50 border border-white"
            }`}
            onClick={() => onSelectShape(shape.id)}
          >
            <span className="block truncate">{getShapeDisplayName(shape)}</span>
          </div>
        ))}
        {shapes.length === 0 && (
          <p className="text-gray-500 text-center py-4">No shapes yet</p>
        )}
      </div>
    </div>
  );
};
