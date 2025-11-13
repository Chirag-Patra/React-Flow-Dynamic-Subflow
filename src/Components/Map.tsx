import { Box, Text, Badge } from "@chakra-ui/react";
import { Node, NodeProps, NodeResizer, useStore, Handle, Position } from "@xyflow/react";
import React from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { getUnit } from "../utils";
import { zoomSelector } from "../utils";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";

type MapNode = Node<MajorComponentsData, "string">;

export default function Map({
  type,
  data: { value, processingType, isDragOver },
  selected
}: NodeProps<MapNode>) {

  const unit = getUnit(type as MajorComponents);
  const showContent = useStore(zoomSelector);
  const { isDark } = useDarkMode();

  let color = "black";
  if (isDark) color = "white";

  // Change border color when dragging over
  const borderColor = isDragOver
    ? (isDark ? "#4299e1" : "#3182ce") // Blue when dragging over
    : color;

  // Header background color - darker red/salmon
  const headerBg = isDark ? "rgba(200, 80, 80, 0.8)" : "rgba(255, 100, 100, 0.85)";

  // Droppable area background - lighter red/pink
  const dropAreaBg = isDark ? "rgba(200, 100, 100, 0.3)" : "rgba(255, 150, 150, 0.4)";

  return (
    <Box
      position="relative"
      border={`2px solid ${borderColor}`}
      borderRadius="8px"
      height="100%"
      width="100%"
      bg={dropAreaBg}
      {...(selected && { boxShadow: `${borderColor} 0px 0px 4px` })}
      transition="border-color 0.2s ease"
      display="flex"
      flexDirection="column"
    >
      {selected && <NodeResizer minWidth={250} minHeight={250} />}

      {/* Header Section - Not droppable */}
      <Box
        bg={headerBg}
        borderTopRadius="6px"
        p={2}
        borderBottom={`2px solid ${borderColor}`}
        minHeight="40px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Text
          fontSize="sm"
          fontWeight="bold"
          color={isDark ? "white" : "white"}
        >
          Map
        </Text>

        {/* Processing Type Badge */}
        {processingType && (
          <Badge
            position="absolute"
            top="5px"
            right="5px"
            colorScheme="red"
            fontSize="xx-small"
          >
            {processingType.replace('_', ' ').toUpperCase()}
          </Badge>
        )}
      </Box>

      {/* Droppable Area - Where nodes can be placed */}
      <Box
        flex="1"
        position="relative"
        p={3}
        className="map-drop-area"
        data-droppable="true"
        minHeight="180px"
      >
        {/* "Overview" label in the droppable area */}
        <Text
          fontSize="xs"
          color={isDark ? "gray.300" : "gray.600"}
          position="absolute"
          top="8px"
          left="10px"
          fontStyle="italic"
        >
          Overview
        </Text>

        {/* Placeholder text when empty */}
        {!value && (
          <Text
            fontSize="xs"
            color={isDark ? "gray.400" : "gray.500"}
            textAlign="center"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            Drop nodes here
          </Text>
        )}
      </Box>

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
        position={Position.Bottom}
        id="bottom"
      />
      <Terminal
        type="target"
        position={Position.Top}
        id="top"
      />
    </Box>
  );
}