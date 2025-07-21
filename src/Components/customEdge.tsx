import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import React from "react";

export default function customEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const [d] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        style={{
          stroke: "url(#customEdge)",
        }}
        markerEnd={markerEnd}
        path={d}
      />
      <circle
        r="4"
        fill="#5516caff"
        style={{
          filter: "drop-shadow(0px 0px 2px #5516caff)",
        }}
      >
        <animateMotion dur="6s" repeatCount={"indefinite"} path={d} />
      </circle>
      <circle fill="transparent" stroke="#5516caff" strokeWidth={2}>
        <animate
          attributeName="r"
          values="2;6"
          dur="2s"
          repeatCount={"indefinite"}
        />
        <animate
          attributeName="opacity"
          values="1;0"
          dur="2s"
          repeatCount={"indefinite"}
        />
        <animateMotion dur="6s" repeatCount={"indefinite"} path={d} />
      </circle>
    </>
  );
}
