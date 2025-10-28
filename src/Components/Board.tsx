import { Box, Text, Badge } from "@chakra-ui/react";
import { Node, NodeProps, NodeResizer, useStore, Handle, Position } from "@xyflow/react";
import React from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { getUnit } from "../utils";
import Placeholder from "./Placeholder";
import { zoomSelector } from "../utils";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";

type BoardNode = Node<MajorComponentsData, "string">;

export default function Board({ type,
  data: { value, processingType }, selected }: NodeProps<BoardNode>) {

  const unit = getUnit(type as MajorComponents);
  const showContent = useStore(zoomSelector);

  const { isDark } = useDarkMode();

  let color = "black";
  if (isDark) color = "white";

  return (
    <Box
      position="relative"
      border={`2px solid ${color}`}
      borderRadius="8px"
      height="100%"
      width="100%"
      bg={isDark ? "rgba(100, 150, 200, 0.15)" : "rgba(173, 216, 230, 0.3)"}
      {...(selected && { boxShadow: `${color} 0px 0px 4px` })}
    >
      {selected && <NodeResizer minWidth={200} minHeight={200} />}

      {/* Processing Type Badge */}
      {processingType && (
        <Badge
          position="absolute"
          top="5px"
          right="5px"
          colorScheme="purple"
          fontSize="xx-small"
        >
          {processingType.replace('_', ' ').toUpperCase()}
        </Badge>
      )}

      {/* Value Text */}
      {value && (
        <Text
          fontSize="xx-small"
          position="absolute"
          bottom="-22px"
          left="14px"
          color={isDark ? "white" : "black"}
        >
          {value}
        </Text>
      )}

      {/* Terminals */}
      <Terminal
        type="source"
        position={Position.Right}
        id="right"
      />
      <Terminal
        type="target"
        position={Position.Left}
        id="left"
      />
    </Box>
  );
}