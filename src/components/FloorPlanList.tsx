import React from "react";
import type { FloorPlan } from "../types";

interface FloorPlanListProps {
  floorPlans: FloorPlan[];
  activeFloorPlanId: string | null;
  onSelectFloorPlan: (id: string) => void;
  onAddFloorPlan: () => void;
  onDeleteFloorPlan: (id: string) => void;
}

export const FloorPlanList: React.FC<FloorPlanListProps> = ({
  floorPlans,
  activeFloorPlanId,
  onSelectFloorPlan,
  onAddFloorPlan,
  onDeleteFloorPlan,
}) => {
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
            className={`p-3 rounded cursor-pointer flex justify-between items-center ${
              activeFloorPlanId === floorPlan.id
                ? "bg-blue-100 border border-blue-400"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => onSelectFloorPlan(floorPlan.id)}
          >
            <span className="truncate">{floorPlan.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFloorPlan(floorPlan.id);
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
        {floorPlans.length === 0 && (
          <p className="text-gray-500 text-center py-4">No floor plans yet</p>
        )}
      </div>
    </div>
  );
};
