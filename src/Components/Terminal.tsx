import { css } from "@emotion/css";
import { Handle, HandleProps } from "@xyflow/react";
import React from "react";

export default function Terminal(props: HandleProps) {
  return (
    <Handle
      className={css({
        width: 12,
        height: 12,
        background: "white",
        border: "2px solid black",
        borderRadius: "50%",
        boxShadow: "0 0 4px rgba(0,0,0,0.4)",
        zIndex: 10,
        pointerEvents: "auto",
      })}
      {...props}
    />
  );
}
