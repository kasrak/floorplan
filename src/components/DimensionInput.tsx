import React, { useState, useEffect } from "react";

interface DimensionInputProps {
  value: number; // value in inches
  onInput: (data: { originalInput: string; inches: number }) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const DimensionInput: React.FC<DimensionInputProps> = ({
  value,
  onInput,
  placeholder = "e.g., 12, 12\", 1', 1'6\"",
  className = "",
  autoFocus = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Format the initial value as a string
  useEffect(() => {
    // Only set initial value if input is empty
    if (!inputValue && value > 0) {
      setInputValue(value.toString());
    }
  }, [value, inputValue]);

  const parseDimension = (input: string): number | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Pattern for feet and inches: 5'6", 5' 6", 5'6, etc.
    const feetInchesPattern = /^(\d+(?:\.\d+)?)'(?:\s*(\d+(?:\.\d+)?)"?)?$/;
    const feetInchesMatch = trimmed.match(feetInchesPattern);
    if (feetInchesMatch) {
      const feet = parseFloat(feetInchesMatch[1]);
      const inches = feetInchesMatch[2] ? parseFloat(feetInchesMatch[2]) : 0;
      if (!isNaN(feet) && !isNaN(inches)) {
        return feet * 12 + inches;
      }
    }

    // Pattern for just feet: 5'
    const feetPattern = /^(\d+(?:\.\d+)?)'$/;
    const feetMatch = trimmed.match(feetPattern);
    if (feetMatch) {
      const feet = parseFloat(feetMatch[1]);
      if (!isNaN(feet)) {
        return feet * 12;
      }
    }

    // Pattern for inches with quote: 12"
    const inchesPattern = /^(\d+(?:\.\d+)?)"$/;
    const inchesMatch = trimmed.match(inchesPattern);
    if (inchesMatch) {
      const inches = parseFloat(inchesMatch[1]);
      if (!isNaN(inches)) {
        return inches;
      }
    }

    // Plain number (assume inches)
    const plainNumber = parseFloat(trimmed);
    if (!isNaN(plainNumber)) {
      return plainNumber;
    }

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsedValue = parseDimension(newValue);
    if (parsedValue !== null && parsedValue > 0) {
      setIsValid(true);
      onInput({ originalInput: newValue, inches: parsedValue });
    } else {
      setIsValid(newValue === "" || parsedValue === 0);
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isValid ? "border-gray-300" : "border-red-500 bg-red-50"
      } ${className}`}
    />
  );
};