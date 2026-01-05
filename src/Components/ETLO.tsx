import { Box, Text, VStack, Tooltip } from "@chakra-ui/react";
import { Node, NodeProps, Position } from "@xyflow/react";
import React from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";
import SvgComponent from "../logo/ETLOIcon"; // Import your SVG icon

type ETLONode = Node<MajorComponentsData, "string">;

export default function ETLO({ type,
  data: { value, isDragOver }, selected }: NodeProps<ETLONode>) {

  const { isDark } = useDarkMode();

  let color = "black";
  if (isDark) color = "white";

  // Enhanced color scheme for ETLO
  const borderColor = isDragOver
    ? (isDark ? "#4299e1" : "#3182ce") // Blue when dragging over
    : color;

  // Match background color to border color with transparency
  const bgColor = isDragOver
    ? (isDark ? "rgba(66, 153, 225, 0.15)" : "rgba(49, 130, 206, 0.15)")
    : (isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)");

  return (
    <Box
      position="relative"
      border={`3px solid ${borderColor}`}
      borderRadius="16px"
      height="150px"
      width="150px"
      bg={bgColor}
      backdropFilter="blur(10px)"
      {...(selected && {
        boxShadow: `0 0 0 2px ${borderColor}, 0 4px 12px rgba(0, 0, 0, 0.15)`
      })}
      transition="all 0.2s ease"
      display="flex"
      alignItems="center"
      justifyContent="center"
      _hover={{
        boxShadow: selected
          ? `0 0 0 2px ${borderColor}, 0 4px 12px rgba(0, 0, 0, 0.15)`
          : "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}
    >
      {/* ETLO Icon */}
      <VStack spacing={2}>
        <Tooltip label="ETLO" placement="top" hasArrow>
          <Box
            width="70px"
            height="70px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="12px"
            bg={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"}
            padding={2}
            transition="all 0.3s ease"
            _hover={{
              transform: "scale(1.05)",
              bg: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"
            }}
            cursor="pointer"
          >
            <SvgComponent
              width="100%"
              height="100%"
              style={{
                filter: isDark
                  ? "drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
                  : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
              }}
            />
          </Box>
        </Tooltip>

        {/* <Text
          fontSize="xs"
          color={isDark ? "gray.400" : "gray.600"}
          fontWeight="semibold"
          letterSpacing="wider"
          textTransform="uppercase"
          fontFamily="'Arial', sans-serif"
        >
          Orchestrator
        </Text> */}
      </VStack>

      {/* Value Text */}
      {value && (
        <Text
          fontSize="xx-small"
          position="absolute"
          bottom="-22px"
          left="14px"
          color={isDark ? "white" : "black"}
          fontWeight="medium"
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