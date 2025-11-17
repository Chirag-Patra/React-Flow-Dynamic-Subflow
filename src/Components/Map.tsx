import { Box, Text, Badge } from "@chakra-ui/react";
import { Node, NodeProps, useStore, Handle, Position } from "@xyflow/react";
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
  selected,
  id
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
      height="100px"
      width="200px"
      bg={dropAreaBg}
      {...(selected && { boxShadow: `${borderColor} 0px 0px 4px` })}
      transition="border-color 0.2s ease"
      display="flex"
      flexDirection="column"
    >

      {/* Header Section - Not droppable */}
      <Box
        bg={headerBg}
        borderTopRadius="6px"
        p={2}
        borderBottom={`2px solid ${borderColor}`}
        height="30px"
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
        {/* {processingType && typeof processingType === 'string' && (
          <Badge
            position="absolute"
            top="5px"
            right="5px"
            colorScheme="red"
            fontSize="xx-small"
          >
            {processingType.replace('_', ' ').toUpperCase()}
          </Badge>
        )} */}
      </Box>

      {/* Droppable Area - Rectangular drop zone for components */}
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="2px dashed"
        borderColor={isDragOver ? (isDark ? "#4299e1" : "#3182ce") : (isDark ? "gray.500" : "gray.400")}
        borderRadius="6px"
        backgroundColor={
          isDragOver 
            ? (isDark ? "rgba(66, 153, 225, 0.1)" : "rgba(49, 130, 206, 0.1)")
            : (isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.3)")
        }
        m={1.5}
        position="relative"
        className="map-drop-zone"
        data-droppable="true"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Drag over Map drop zone:", id);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Drag enter Map drop zone:", id);
        }}
        onDrop={(e) => {
          e.preventDefault();
          console.log("Dropped in Map drop zone:", id);
        }}
        transition="all 0.2s ease"
        _hover={{
          borderColor: isDark ? "blue.300" : "blue.400",
          backgroundColor: isDark ? "rgba(66, 153, 225, 0.05)" : "rgba(49, 130, 206, 0.05)"
        }}
      >
        {!value && (
          <Box textAlign="center">
            <Text 
              fontSize="sm" 
              color={isDark ? "gray.300" : "gray.600"}
              fontWeight="medium"
              mb={1}
            >
              Drop State Here
            </Text>
            <Text 
              fontSize="xs" 
              color={isDark ? "gray.500" : "gray.500"}
              fontStyle="italic"
            >
              Components will auto-center
            </Text>
          </Box>
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