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

export function getUnit(type: MajorComponents) {
  let unit;
  switch (type) {
    case MajorComponents.Resistor: {
      unit = "kΩ";
      break;
    }
    case MajorComponents.Inductor: {
      unit = "H";
      break;
    }
    case MajorComponents.Capacitor: {
      unit = "μF";
      break;
    }
    case MajorComponents.Battery: {
      unit = "V";
      break;
    }
    case MajorComponents.Bulb: {
      unit = "W";
      break;
    }
  }
  return unit;
}
