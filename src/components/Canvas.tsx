import React, { useRef, useState, useEffect, useCallback } from "react";
import type { Point, Shape, FloorPlan } from "../types";

interface CanvasProps {
  floorPlan: FloorPlan;
  selectedShapeId: string | null;
  drawingMode: "none" | "calibration" | "rectangle" | "oval";
  onCalibrationComplete: (start: Point, end: Point) => void;
  onShapeAdd: (shape: Omit<Shape, "id" | "sizeInInches">) => void;
  onShapeSelect: (id: string | null) => void;
  onShapeUpdate: (id: string, position: Point) => void;
  onImageDimensionsLoaded?: (dimensions: {
    width: number;
    height: number;
  }) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  floorPlan,
  selectedShapeId,
  drawingMode,
  onCalibrationComplete,
  onShapeAdd,
  onShapeSelect,
  onShapeUpdate,
  onImageDimensionsLoaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);

  // Convert stored coordinates (relative to original image) to canvas coordinates
  const toCanvasCoords = useCallback(
    (point: Point): Point => {
      if (!floorPlan.originalImageDimensions) return point;
      return {
        x:
          (point.x / floorPlan.originalImageDimensions.width) *
          canvasSize.width,
        y:
          (point.y / floorPlan.originalImageDimensions.height) *
          canvasSize.height,
      };
    },
    [floorPlan.originalImageDimensions, canvasSize]
  );

  // Convert canvas coordinates to stored coordinates (relative to original image)
  const toStoredCoords = useCallback(
    (point: Point): Point => {
      if (!floorPlan.originalImageDimensions) return point;
      return {
        x:
          (point.x / canvasSize.width) *
          floorPlan.originalImageDimensions.width,
        y:
          (point.y / canvasSize.height) *
          floorPlan.originalImageDimensions.height,
      };
    },
    [floorPlan.originalImageDimensions, canvasSize]
  );

  // Convert size from stored to canvas
  const toCanvasSize = useCallback(
    (size: {
      width: number;
      height: number;
    }): { width: number; height: number } => {
      if (!floorPlan.originalImageDimensions) return size;
      return {
        width:
          (size.width / floorPlan.originalImageDimensions.width) *
          canvasSize.width,
        height:
          (size.height / floorPlan.originalImageDimensions.height) *
          canvasSize.height,
      };
    },
    [floorPlan.originalImageDimensions, canvasSize]
  );

  // Convert size from canvas to stored
  const toStoredSize = useCallback(
    (size: {
      width: number;
      height: number;
    }): { width: number; height: number } => {
      if (!floorPlan.originalImageDimensions) return size;
      return {
        width:
          (size.width / canvasSize.width) *
          floorPlan.originalImageDimensions.width,
        height:
          (size.height / canvasSize.height) *
          floorPlan.originalImageDimensions.height,
      };
    },
    [floorPlan.originalImageDimensions, canvasSize]
  );

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;

      // Store original image dimensions if not already stored
      if (!floorPlan.originalImageDimensions && onImageDimensionsLoaded) {
        onImageDimensionsLoaded({ width: image.width, height: image.height });
      }

      if (canvasRef.current) {
        const containerWidth =
          canvasRef.current.parentElement?.clientWidth || 800;
        const containerHeight =
          canvasRef.current.parentElement?.clientHeight || 600;

        const scale = Math.min(
          containerWidth / image.width,
          containerHeight / image.height,
          1
        );

        setCanvasSize({
          width: image.width * scale,
          height: image.height * scale,
        });
      }
    };
    image.src = floorPlan.imageUrl;
  }, [
    floorPlan.imageUrl,
    floorPlan.originalImageDimensions,
    onImageDimensionsLoaded,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    if (floorPlan.calibrationLine && floorPlan.originalImageDimensions) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const startCanvas = toCanvasCoords(floorPlan.calibrationLine.start);
      const endCanvas = toCanvasCoords(floorPlan.calibrationLine.end);
      ctx.moveTo(startCanvas.x, startCanvas.y);
      ctx.lineTo(endCanvas.x, endCanvas.y);
      ctx.stroke();
    }

    floorPlan.shapes.forEach((shape) => {
      ctx.strokeStyle = shape.id === selectedShapeId ? "blue" : "black";
      ctx.lineWidth = shape.id === selectedShapeId ? 3 : 2;
      ctx.fillStyle = "rgba(0, 0, 255, 0.1)";

      const canvasPos = toCanvasCoords(shape.position);
      const canvasSize = toCanvasSize(shape.size);

      if (shape.type === "rectangle") {
        if (shape.id === selectedShapeId) {
          ctx.fillRect(
            canvasPos.x,
            canvasPos.y,
            canvasSize.width,
            canvasSize.height
          );
        }
        ctx.strokeRect(
          canvasPos.x,
          canvasPos.y,
          canvasSize.width,
          canvasSize.height
        );
      } else if (shape.type === "oval") {
        ctx.beginPath();
        ctx.ellipse(
          canvasPos.x + canvasSize.width / 2,
          canvasPos.y + canvasSize.height / 2,
          canvasSize.width / 2,
          canvasSize.height / 2,
          0,
          0,
          2 * Math.PI
        );
        if (shape.id === selectedShapeId) {
          ctx.fill();
        }
        ctx.stroke();
      }
    });

    if (isDrawing && startPoint && currentPoint) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      if (drawingMode === "calibration") {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
      } else if (drawingMode === "rectangle" || drawingMode === "oval") {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;

        if (drawingMode === "rectangle") {
          ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        } else {
          ctx.beginPath();
          ctx.ellipse(
            startPoint.x + width / 2,
            startPoint.y + height / 2,
            Math.abs(width / 2),
            Math.abs(height / 2),
            0,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }
  }, [
    floorPlan,
    selectedShapeId,
    isDrawing,
    startPoint,
    currentPoint,
    drawingMode,
    canvasSize,
    toCanvasCoords,
    toCanvasSize,
  ]);

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getShapeAtPoint = (point: Point): Shape | null => {
    for (let i = floorPlan.shapes.length - 1; i >= 0; i--) {
      const shape = floorPlan.shapes[i];
      const canvasPos = toCanvasCoords(shape.position);
      const canvasSize = toCanvasSize(shape.size);

      if (shape.type === "rectangle") {
        if (
          point.x >= canvasPos.x &&
          point.x <= canvasPos.x + canvasSize.width &&
          point.y >= canvasPos.y &&
          point.y <= canvasPos.y + canvasSize.height
        ) {
          return shape;
        }
      } else if (shape.type === "oval") {
        const centerX = canvasPos.x + canvasSize.width / 2;
        const centerY = canvasPos.y + canvasSize.height / 2;
        const radiusX = canvasSize.width / 2;
        const radiusY = canvasSize.height / 2;

        const normalizedX = (point.x - centerX) / radiusX;
        const normalizedY = (point.y - centerY) / radiusY;

        if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
          return shape;
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePosition(e);

    if (drawingMode === "none") {
      const shape = getShapeAtPoint(point);
      if (shape) {
        onShapeSelect(shape.id);
        setIsDragging(true);
        const canvasPos = toCanvasCoords(shape.position);
        setDragOffset({
          x: point.x - canvasPos.x,
          y: point.y - canvasPos.y,
        });
      } else {
        onShapeSelect(null);
      }
    } else {
      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoint(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePosition(e);

    if (isDragging && selectedShapeId) {
      const newPosition = toStoredCoords({
        x: point.x - dragOffset.x,
        y: point.y - dragOffset.y,
      });
      onShapeUpdate(selectedShapeId, newPosition);
    } else if (isDrawing) {
      setCurrentPoint(point);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && startPoint && currentPoint) {
      if (drawingMode === "calibration") {
        onCalibrationComplete(
          toStoredCoords(startPoint),
          toStoredCoords(currentPoint)
        );
      } else if (drawingMode === "rectangle" || drawingMode === "oval") {
        const width = Math.abs(currentPoint.x - startPoint.x);
        const height = Math.abs(currentPoint.y - startPoint.y);
        const x = Math.min(startPoint.x, currentPoint.x);
        const y = Math.min(startPoint.y, currentPoint.y);

        if (width > 5 && height > 5) {
          const storedSize = toStoredSize({ width, height });
          const storedPos = toStoredCoords({ x, y });

          onShapeAdd({
            name: "",
            type: drawingMode,
            position: storedPos,
            size: storedSize,
          });
        }
      }
    }

    setIsDrawing(false);
    setIsDragging(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className="border border-gray-300 cursor-crosshair max-w-full max-h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};
