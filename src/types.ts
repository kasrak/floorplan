export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'oval';
  position: Point;
  size: { width: number; height: number };
  sizeInInches: { width: number; height: number };
}

export interface FloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  originalImageDimensions?: { width: number; height: number };
  scale: number | null; // pixels per inch
  calibrationLine?: {
    start: Point;
    end: Point;
    lengthInInches: number;
  };
  shapes: Shape[];
}

export interface AppState {
  floorPlans: FloorPlan[];
  activeFloorPlanId: string | null;
}