import React, { useState } from "react";
import type { FloorPlan } from "../types";

interface FloorPlanListProps {
  floorPlans: FloorPlan[];
  activeFloorPlanId: string | null;
  onSelectFloorPlan: (id: string) => void;
  onAddFloorPlan: () => void;
  onDeleteFloorPlan: (id: string) => void;
  onDuplicateFloorPlan: (id: string) => void;
  onRenameFloorPlan: (id: string, newName: string) => void;
}

export const FloorPlanList: React.FC<FloorPlanListProps> = ({
  floorPlans,
  activeFloorPlanId,
  onSelectFloorPlan,
  onAddFloorPlan,
  onDeleteFloorPlan,
  onDuplicateFloorPlan,
  onRenameFloorPlan,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleStartEdit = (floorPlan: FloorPlan) => {
    setEditingId(floorPlan.id);
    setEditingName(floorPlan.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onRenameFloorPlan(editingId, editingName.trim());
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };
  return (
    <div className="p-4 border-b border-gray-300 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Floor plans</h2>
        <button
          onClick={onAddFloorPlan}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + New
        </button>
      </div>
      <div className="space-y-2">
        {floorPlans.map((floorPlan) => (
          <div
            key={floorPlan.id}
            className={`p-3 rounded cursor-pointer flex flex-col ${
              activeFloorPlanId === floorPlan.id
                ? "bg-blue-100 border border-blue-400"
                : "bg-white hover:bg-gray-50 border border-white"
            }`}
            onClick={() => onSelectFloorPlan(floorPlan.id)}
          >
            {editingId === floorPlan.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <div
                className="truncate flex-1"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(floorPlan);
                }}
              >
                {floorPlan.name}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateFloorPlan(floorPlan.id);
                }}
                className="text-sm bg-gray-100 px-2 py-1 rounded"
              >
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(floorPlan);
                }}
                className="text-sm bg-gray-100 px-2 py-1 rounded"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFloorPlan(floorPlan.id);
                }}
                className="text-sm bg-gray-100 hover:bg-red-300 px-2 py-1 rounded"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        {floorPlans.length === 0 && (
          <p className="text-gray-500 text-center py-4">No floor plans yet</p>
        )}
      </div>
    </div>
  );
};
