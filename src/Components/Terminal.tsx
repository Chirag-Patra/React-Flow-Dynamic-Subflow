import { css } from "@emotion/css";
import { Handle, HandleProps } from "@xyflow/react";
import React from "react";

export default function Terminal(props: HandleProps) {
  return (
    <Handle
      className={css({
        width: 12,
        height: 12,
        background: "#EEF2FF",
        border: "2px solid #7C3AED",
        borderRadius: "50%",
        boxShadow: "0 0 6px rgba(124, 58, 237, 0.4)",
        zIndex: 10,
        pointerEvents: "auto",
        transition: "all 0.2s ease",
        "&:hover": {
          background: "#A78BFA",
          boxShadow: "0 0 8px rgba(124, 58, 237, 0.6)",
        },
      })}
      {...props}
    />
  );
}
