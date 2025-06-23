import React, { useState } from "react";
import { DimensionInput } from "./DimensionInput";

interface CalibrationDialogProps {
  onConfirm: (lengthInInches: number) => void;
  onCancel: () => void;
}

export const CalibrationDialog: React.FC<CalibrationDialogProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [lengthInInches, setLengthInInches] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lengthInInches > 0) {
      onConfirm(lengthInInches);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Enter Line Length</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What is the actual length of the line you drew?
            </label>
            <DimensionInput
              value={lengthInInches}
              onInput={({ inches }) => setLengthInInches(inches)}
              placeholder={`e.g., 24, 24", 2', 5'6"`}
              autoFocus
            />
            {lengthInInches > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                {lengthInInches.toFixed(1)} inches
                {lengthInInches >= 12 &&
                  ` (${Math.floor(lengthInInches / 12)}'${
                    lengthInInches % 12 > 0
                      ? `${(lengthInInches % 12).toFixed(1)}"`
                      : ""
                  })`}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={lengthInInches <= 0}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
