import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { AppState, FloorPlan, Point, Shape } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { FloorPlanList } from "./components/FloorPlanList";
import { ShapesList } from "./components/ShapesList";
import { ImageUpload } from "./components/ImageUpload";
import { Canvas } from "./components/Canvas";
import { CalibrationDialog } from "./components/CalibrationDialog";
import { ShapePanel } from "./components/ShapePanel";
import { Toolbar } from "./components/Toolbar";

const initialState: AppState = {
  floorPlans: [],
  activeFloorPlanId: null,
};

function App() {
  const [appState, setAppState] = useLocalStorage<AppState>(
    "floorplan-app-state",
    initialState
  );
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState<
    "none" | "calibration" | "rectangle" | "oval"
  >("none");
  const [showCalibrationDialog, setShowCalibrationDialog] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState<{
    start: Point;
    end: Point;
  } | null>(null);

  const activeFloorPlan = appState.floorPlans.find(
    (fp) => fp.id === appState.activeFloorPlanId
  );
  const selectedShape =
    activeFloorPlan?.shapes.find((s) => s.id === selectedShapeId) || null;

  const handleAddFloorPlan = () => {
    const newFloorPlan: FloorPlan = {
      id: uuidv4(),
      name: `Floor Plan ${appState.floorPlans.length + 1}`,
      imageUrl: "",
      scale: null,
      shapes: [],
    };

    setAppState({
      ...appState,
      floorPlans: [...appState.floorPlans, newFloorPlan],
      activeFloorPlanId: newFloorPlan.id,
    });
  };

  const handleDeleteFloorPlan = (id: string) => {
    const newFloorPlans = appState.floorPlans.filter((fp) => fp.id !== id);
    let newActiveId = appState.activeFloorPlanId;

    if (newActiveId === id) {
      newActiveId = newFloorPlans.length > 0 ? newFloorPlans[0].id : null;
    }

    setAppState({
      ...appState,
      floorPlans: newFloorPlans,
      activeFloorPlanId: newActiveId,
    });
  };

  const handleDuplicateFloorPlan = (id: string) => {
    const floorPlanToDuplicate = appState.floorPlans.find((fp) => fp.id === id);
    if (!floorPlanToDuplicate) return;

    // Find the base name and number for the duplicate
    const nameMatch = floorPlanToDuplicate.name.match(/^(.+?)(\s+\(copy\s*(\d*)\))?$/);
    const baseName = nameMatch ? nameMatch[1] : floorPlanToDuplicate.name;
    
    // Find the highest copy number for this base name
    let maxCopyNumber = 0;
    appState.floorPlans.forEach((fp) => {
      const match = fp.name.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(copy\\s*(\\d*)\\)$`));
      if (match) {
        const copyNum = match[1] ? parseInt(match[1]) : 1;
        maxCopyNumber = Math.max(maxCopyNumber, copyNum);
      }
    });

    const newName = maxCopyNumber === 0 
      ? `${baseName} (copy)` 
      : `${baseName} (copy ${maxCopyNumber + 1})`;

    const duplicatedFloorPlan: FloorPlan = {
      ...floorPlanToDuplicate,
      id: uuidv4(),
      name: newName,
      shapes: floorPlanToDuplicate.shapes.map((shape) => ({
        ...shape,
        id: uuidv4(),
      })),
    };

    setAppState({
      ...appState,
      floorPlans: [...appState.floorPlans, duplicatedFloorPlan],
      activeFloorPlanId: duplicatedFloorPlan.id,
    });
    setSelectedShapeId(null);
  };

  const handleSelectFloorPlan = (id: string) => {
    setAppState({ ...appState, activeFloorPlanId: id });
    setSelectedShapeId(null);
  };

  const handleRenameFloorPlan = (id: string, newName: string) => {
    const updatedFloorPlans = appState.floorPlans.map((fp) =>
      fp.id === id ? { ...fp, name: newName } : fp
    );

    setAppState({ ...appState, floorPlans: updatedFloorPlans });
  };

  const handleImageUpload = (imageUrl: string) => {
    if (!activeFloorPlan) return;

    const updatedFloorPlans = appState.floorPlans.map((fp) =>
      fp.id === activeFloorPlan.id
        ? {
            ...fp,
            imageUrl,
            originalImageDimensions: undefined,
            scale: null,
            calibrationLine: undefined,
            shapes: [],
          }
        : fp
    );

    setAppState({ ...appState, floorPlans: updatedFloorPlans });
    setDrawingMode("calibration");
  };

  const handleCalibrationComplete = (start: Point, end: Point) => {
    setCalibrationPoints({ start, end });
    setShowCalibrationDialog(true);
    setDrawingMode("none");
  };

  const handleCalibrationConfirm = (lengthInInches: number) => {
    if (
      !activeFloorPlan ||
      !calibrationPoints ||
      !activeFloorPlan.originalImageDimensions
    )
      return;

    // Calculate pixel distance based on original image dimensions
    const pixelDistance = Math.sqrt(
      Math.pow(calibrationPoints.end.x - calibrationPoints.start.x, 2) +
        Math.pow(calibrationPoints.end.y - calibrationPoints.start.y, 2)
    );

    const scale = pixelDistance / lengthInInches;

    const updatedFloorPlans = appState.floorPlans.map((fp) =>
      fp.id === activeFloorPlan.id
        ? {
            ...fp,
            scale,
            calibrationLine: {
              start: calibrationPoints.start,
              end: calibrationPoints.end,
              lengthInInches,
            },
          }
        : fp
    );

    setAppState({ ...appState, floorPlans: updatedFloorPlans });
    setShowCalibrationDialog(false);
    setCalibrationPoints(null);
  };

  const handleShapeAdd = (shapeData: Omit<Shape, "id" | "name" | "sizeInInches">) => {
    if (!activeFloorPlan || !activeFloorPlan.originalImageDimensions) return;

    const scale = activeFloorPlan.scale;
    if (!scale) return;

    const shapeNumber = activeFloorPlan.shapes.length + 1;
    const shape: Shape = {
      ...shapeData,
      id: uuidv4(),
      name: `Shape ${shapeNumber}`,
      sizeInInches: {
        width: Math.round(shapeData.size.width / scale),
        height: Math.round(shapeData.size.height / scale),
      },
    };

    const updatedFloorPlans = appState.floorPlans.map((fp) =>
      fp.id === activeFloorPlan.id
        ? { ...fp, shapes: [...fp.shapes, shape] }
        : fp
    );

    setAppState({ ...appState, floorPlans: updatedFloorPlans });
    setSelectedShapeId(shape.id);
    setDrawingMode("none");
  };

  const handleShapeUpdate = (id: string, position: Point) => {
    if (!activeFloorPlan) return;

    const updatedFloorPlans = appState.floorPlans.map((fp) =>
      fp.id === activeFloorPlan.id
        ? {
            ...fp,
            shapes: fp.shapes.map((shape) =>
              shape.id === id ? { ...shape, position } : shape
            ),
          }
        : fp
    );

    setAppState({ ...appState, floorPlans: updatedFloorPlans });
  };

  const handleShapeUpdateSize = (
    id: string,
    widthInInches: number,
    heightInInches: number
  ) => {
    if (!activeFloorPlan || !activeFloorPlan.originalImageDimensions) return;

    const scale = activeFloorPlan.scale;
    if (!scale) return;

    const updatedFloorPlans = appState.floorPlans.map((fp) =>
      fp.id === activeFloorPlan.id
        ? {
            ...fp,
            shapes: fp.shapes.map((shape) =>
              shape.id === id
                ? {
                    ...shape,
                    size: {
                      width: widthInInches * scale,
                      height: heightInInches * scale,
                    },
                    sizeInInches: {
                      width: widthInInches,
                      height: heightInInches,
                    },
                  }
                : shape
            ),
          }
        : fp
    );

    setAppState({ ...appState, floorPlans: updatedFloorPlans });
  };

  const handleShapeUpdateName = (id: string, name: string) => {
    if (!activeFloorPlan) return;

    const updatedFloorPlans = appState.floorPlans.map((fp) =>
      fp.id === activeFloorPlan.id
        ? {
            ...fp,
            shapes: fp.shapes.map((shape) =>
              shape.id === id ? { ...shape, name } : shape
            ),
          }
        : fp
    );

    setAppState({ ...appState, floorPlans: updatedFloorPlans });
  };

  const handleShapeDelete = (id: string) => {
    if (!activeFloorPlan) return;

    const updatedFloorPlans = appState.floorPlans.map((fp) =>
      fp.id === activeFloorPlan.id
        ? { ...fp, shapes: fp.shapes.filter((shape) => shape.id !== id) }
        : fp
    );

    setAppState({ ...appState, floorPlans: updatedFloorPlans });
    setSelectedShapeId(null);
  };

  const handleImageDimensionsLoaded = (dimensions: {
    width: number;
    height: number;
  }) => {
    if (!activeFloorPlan) return;

    const updatedFloorPlans = appState.floorPlans.map((fp) =>
      fp.id === activeFloorPlan.id
        ? { ...fp, originalImageDimensions: dimensions }
        : fp
    );

    setAppState({ ...appState, floorPlans: updatedFloorPlans });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col">
          <FloorPlanList
            floorPlans={appState.floorPlans}
            activeFloorPlanId={appState.activeFloorPlanId}
            onSelectFloorPlan={handleSelectFloorPlan}
            onAddFloorPlan={handleAddFloorPlan}
            onDeleteFloorPlan={handleDeleteFloorPlan}
            onDuplicateFloorPlan={handleDuplicateFloorPlan}
            onRenameFloorPlan={handleRenameFloorPlan}
          />
          {activeFloorPlan && (
            <ShapesList
              shapes={activeFloorPlan.shapes}
              selectedShapeId={selectedShapeId}
              onSelectShape={setSelectedShapeId}
            />
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {activeFloorPlan && (
            <>
              {activeFloorPlan.imageUrl && (
                <Toolbar
                  drawingMode={drawingMode}
                  hasScale={!!activeFloorPlan.scale}
                  onModeChange={setDrawingMode}
                />
              )}

              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
                  {!activeFloorPlan.imageUrl ? (
                    <ImageUpload onImageUpload={handleImageUpload} />
                  ) : (
                    <Canvas
                      floorPlan={activeFloorPlan}
                      selectedShapeId={selectedShapeId}
                      drawingMode={drawingMode}
                      onCalibrationComplete={handleCalibrationComplete}
                      onShapeAdd={handleShapeAdd}
                      onShapeSelect={setSelectedShapeId}
                      onShapeUpdate={handleShapeUpdate}
                      onImageDimensionsLoaded={handleImageDimensionsLoaded}
                    />
                  )}
                </div>

                {activeFloorPlan.imageUrl && (
                  <ShapePanel
                    key={selectedShape?.id}
                    shape={selectedShape}
                    scale={activeFloorPlan.scale}
                    onUpdateSize={handleShapeUpdateSize}
                    onUpdateName={handleShapeUpdateName}
                    onDelete={handleShapeDelete}
                  />
                )}
              </div>
            </>
          )}

          {!activeFloorPlan && (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select or create a floor plan to get started</p>
            </div>
          )}
        </div>
      </div>

      {showCalibrationDialog && (
        <CalibrationDialog
          onConfirm={handleCalibrationConfirm}
          onCancel={() => {
            setShowCalibrationDialog(false);
            setCalibrationPoints(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
