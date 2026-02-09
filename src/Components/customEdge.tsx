import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { useMemo } from "react";
import { useDarkMode } from "../store";

export default function customEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps) {
  const { isDark } = useDarkMode();

  const [d] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  // Generate unique gradient ID using edge id (safe characters only)
  const gradientId = useMemo(() => `edge-gradient-${id?.replace(/[^a-zA-Z0-9]/g, '') || Math.random().toString(36).substr(2, 9)}`, [id]);

  // Darker matte grey colors
  const colors = useMemo(() => ({
    primary: isDark ? "#4B5563" : "#6B7280",
    glow: isDark ? "rgba(75, 85, 99, 0.25)" : "rgba(107, 114, 128, 0.25)",
  }), [isDark]);

  return (
    <>
      {/* Background glow effect */}
      <path
        d={d}
        fill="none"
        stroke={colors.glow}
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* Main edge path - solid line */}
      <BaseEdge
        style={{
          stroke: colors.primary,
          strokeWidth: 2.5,
          strokeLinecap: "round",
          ...style,
        }}
        markerEnd={markerEnd}
        path={d}
      />
    </>
  );
}
