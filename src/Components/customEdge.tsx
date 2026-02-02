import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";

export default function customEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps) {
  const [d] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  // Generate unique gradient ID for this edge
  const gradientId = `edge-gradient-${sourceX}-${sourceY}`;

  return (
    <>
      {/* Define gradient for this edge - horizontal flow (left to right) - Blue/Purple theme */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#667EEA" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#9F7AEA" />
        </linearGradient>
      </defs>

      {/* Background glow effect */}
      <path
        d={d}
        fill="none"
        stroke="#7C3AED30"
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* Main edge path */}
      <BaseEdge
        style={{
          stroke: `url(#${gradientId})`,
          strokeWidth: 2.5,
          strokeLinecap: "round",
          ...style,
        }}
        markerEnd={markerEnd}
        path={d}
      />

      {/* Animated flowing dot */}
      <circle
        r="4"
        fill="#A78BFA"
        style={{
          filter: "drop-shadow(0px 0px 4px #A78BFA)",
        }}
      >
        <animateMotion dur="2s" repeatCount="indefinite" path={d} />
      </circle>

      {/* Pulse ring effect */}
      <circle fill="transparent" stroke="#A78BFA" strokeWidth={1.5}>
        <animate
          attributeName="r"
          values="3;8"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animateMotion dur="2s" repeatCount="indefinite" path={d} />
      </circle>
    </>
  );
}
