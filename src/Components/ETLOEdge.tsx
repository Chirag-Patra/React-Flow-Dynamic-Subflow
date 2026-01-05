import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import React from "react";
import { useDarkMode } from "../store";

export default function ETLOEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const { isDark } = useDarkMode();

  const [d] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  // Theme-aware color scheme
  const colors = isDark ? {
    primary: "#4299e1",      // Light blue for dark mode
    secondary: "#63b3ed",
    accent: "#90cdf4",
    glow: "rgba(66, 153, 225, 0.6)"
  } : {
    primary: "#3182ce",      // Dark blue for light mode
    secondary: "#2c5aa0",
    accent: "#2b6cb0",
    glow: "rgba(49, 130, 206, 0.6)"
  };

  return (
    <>
      {/* Background glow effect */}
      <BaseEdge
        style={{
          stroke: colors.glow,
          strokeWidth: 5,
          strokeDasharray: "12,6",
          filter: "blur(3px)",
          opacity: 0.4,
        }}
        path={d}
      />

      {/* Main glass edge with gradient */}
      <BaseEdge
        style={{
          stroke: `url(#etloGradient)`,
          strokeWidth: 3,
          strokeDasharray: "8,4",
          filter: "drop-shadow(0 0 6px rgba(72, 187, 120, 0.5))",
          strokeLinecap: "round",
        }}
        markerEnd={markerEnd}
        path={d}
      />

      {/* Animated moving orb with glass effect */}
      <circle
        r="5"
        fill={`url(#etloOrbGradient)`}
        style={{
          filter: "drop-shadow(0 0 8px rgba(72, 187, 120, 0.7))",
        }}
      >
        <animateMotion dur="6s" repeatCount={"indefinite"} path={d} />
      </circle>

      {/* Pulsing glass ring effect */}
      <circle
        fill="transparent"
        stroke={colors.accent}
        strokeWidth={1.5}
        opacity={0.8}
      >
        <animate
          attributeName="r"
          values="3;8;3"
          dur="2s"
          repeatCount={"indefinite"}
        />
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="2s"
          repeatCount={"indefinite"}
        />
        <animate
          attributeName="stroke-width"
          values="1.5;0.5;1.5"
          dur="2s"
          repeatCount={"indefinite"}
        />
        <animateMotion dur="6s" repeatCount={"indefinite"} path={d} />
      </circle>

      {/* SVG Definitions for gradients and custom marker */}
      <defs>
        <linearGradient id="etloGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.9" />
          <stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0.8" />
        </linearGradient>

        <radialGradient id="etloOrbGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
          <stop offset="40%" stopColor={colors.secondary} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="1" />
        </radialGradient>

        {/* Custom glass arrow marker */}
        <marker
          id="etloArrowMarker"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
          markerUnits="strokeWidth"
        >
          {/* Glow effect for arrow */}
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={colors.glow}
            stroke="none"
            filter="blur(2px)"
            opacity="0.6"
          />
          {/* Main glass arrow */}
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={`url(#etloArrowGradient)`}
            stroke={colors.accent}
            strokeWidth="0.5"
            filter="drop-shadow(0 0 3px rgba(72, 187, 120, 0.5))"
          />
          {/* Glass highlight */}
          <path
            d="M1,1.5 L1,4.5 L6,3 z"
            fill="rgba(255, 255, 255, 0.4)"
            stroke="none"
          />
        </marker>

        {/* Arrow gradient */}
        <linearGradient id="etloArrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.accent} stopOpacity="0.8" />
          <stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </>
  );
}