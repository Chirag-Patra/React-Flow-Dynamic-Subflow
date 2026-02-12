import { Box, Text } from "@chakra-ui/react";
import { Node, NodeProps, Position } from "@xyflow/react";
import { memo } from "react";
import { MajorComponentsData } from "../types";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";

type MapNode = Node<MajorComponentsData, "string">;

function Map({
  data: { value, isDragOver },
  selected
}: NodeProps<MapNode>) {

  const { isDark } = useDarkMode();

  let color = "black";
  if (isDark) color = "white";

  const borderColor = isDragOver
    ? (isDark ? "#4299e1" : "#3182ce")
    : color;

  const headerBg = isDark ? "rgba(200, 80, 80, 0.8)" : "rgba(255, 100, 100, 0.85)";
  const bodyBg = isDark ? "rgba(200, 100, 100, 0.3)" : "rgba(255, 150, 150, 0.4)";
  const dashedBorder = isDragOver
    ? (isDark ? "#4299e1" : "#3182ce")
    : (isDark ? "gray" : "#aaa");

  return (
    <Box
      position="relative"
      height="100px"
      width="200px"
    >
      {/* Header */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="26px"
        bg={headerBg}
        borderTopLeftRadius="10px"
        borderTopRightRadius="10px"
        border={`2px solid ${borderColor}`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={1}
      >
        <Text
          fontSize="11px"
          fontWeight="bold"
          color="white"
          letterSpacing="0.5px"
        >
          Map
        </Text>
      </Box>

      {/* Body */}
      <Box
        position="absolute"
        top="24px"
        left={0}
        right={0}
        bottom={0}
        bg={bodyBg}
        borderBottomLeftRadius="10px"
        borderBottomRightRadius="10px"
        borderBottom={`2px solid ${borderColor}`}
        borderLeft={`2px solid ${borderColor}`}
        borderRight={`2px solid ${borderColor}`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="6px"
        {...(selected && {
          boxShadow: `${borderColor} 0px 0px 4px`
        })}
      >
        <Box
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="4px"
          border={`1.5px dashed ${dashedBorder}`}
          backgroundColor={
            isDragOver
              ? (isDark ? "rgba(66, 153, 225, 0.1)" : "rgba(49, 130, 206, 0.1)")
              : (isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.3)")
          }
          className="map-drop-zone"
          data-droppable="true"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
          }}
          transition="all 0.2s ease"
        >
          {!value && (
            <Text
              fontSize="10px"
              color={isDark ? "gray.300" : "gray.600"}
              fontWeight="medium"
            >
              Drop State Here
            </Text>
          )}
        </Box>
      </Box>

      {/* Value Text */}
      {value && (
        <Text
          fontSize="xx-small"
          position="absolute"
          bottom="-18px"
          left="8px"
          color={isDark ? "white" : "black"}
        >
          {value}
        </Text>
      )}

      {/* Terminals */}
      <Terminal type="source" position={Position.Bottom} id="bottom" />
      <Terminal type="target" position={Position.Top} id="top" />
    </Box>
  );
}

export default memo(Map);
