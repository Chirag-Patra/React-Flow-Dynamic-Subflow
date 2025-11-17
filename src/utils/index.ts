import { ReactFlowState } from "@xyflow/react";
import { MajorComponents } from "../types";

export const zoomSelector = (s: ReactFlowState) => s.transform[2] >= 0.7;

export const isPointInBox = (
  point: { x: number; y: number },
  box: { x: number; y: number; height: number; width: number }
) => {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
};

// Legacy electrical component units (Resistor, Inductor, etc.) have been removed from MajorComponents.
// Return undefined for all current component types; keep function to avoid refactor ripple.
export function getUnit(type: MajorComponents) {
  return undefined;
}
