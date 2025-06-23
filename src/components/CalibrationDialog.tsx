import React, { useState } from 'react';

interface CalibrationDialogProps {
  onConfirm: (lengthInInches: number) => void;
  onCancel: () => void;
}

export const CalibrationDialog: React.FC<CalibrationDialogProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [length, setLength] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lengthValue = parseFloat(length);
    if (!isNaN(lengthValue) && lengthValue > 0) {
      onConfirm(lengthValue);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Enter Line Length</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What is the actual length of the line you drew (in inches)?
            </label>
            <input
              type="number"
              step="0.1"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter length in inches"
              autoFocus
            />
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
              disabled={!length || parseFloat(length) <= 0}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};