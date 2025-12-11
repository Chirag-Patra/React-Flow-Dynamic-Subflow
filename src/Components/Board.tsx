import { Box, Text, Badge, Flex } from "@chakra-ui/react";
import { Node, NodeProps, NodeResizer, useStore, Handle, Position } from "@xyflow/react";
import React from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { getUnit } from "../utils";
import { zoomSelector } from "../utils";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";

type BoardNode = Node<MajorComponentsData, "string">;

export default function Board({ type,
  data: { value, processingType, isDragOver }, selected }: NodeProps<BoardNode>) {

  const unit = getUnit(type as MajorComponents);
  const showContent = useStore(zoomSelector);
  const { isDark } = useDarkMode();

  // Enhanced color scheme for Job (blue theme)
  const colors = {
    primary: isDark ? "#4299E1" : "#3182CE",
    secondary: isDark ? "#63B3ED" : "#4299E1",
    accent: isDark ? "#90CDF4" : "#63B3ED",
    background: isDark
      ? "linear-gradient(135deg, rgba(66, 153, 225, 0.12) 0%, rgba(99, 179, 237, 0.08) 100%)"
      : "linear-gradient(135deg, rgba(49, 130, 206, 0.15) 0%, rgba(66, 153, 225, 0.1) 100%)",
    border: isDark ? "#4299E1" : "#3182CE",
    text: isDark ? "#BEE3F8" : "#2C5282",
    shadow: isDark
      ? "0 8px 32px rgba(66, 153, 225, 0.3)"
      : "0 8px 32px rgba(49, 130, 206, 0.25)"
  };

  // Enhanced border color with glow effect when dragging over or selected
  const borderColor = isDragOver
    ? colors.accent
    : selected
    ? colors.primary
    : colors.border;

  const boxShadow = selected || isDragOver
    ? `0 0 20px ${colors.primary}40, ${colors.shadow}`
    : `0 4px 12px rgba(0, 0, 0, 0.1)`;

  return (
    <Box
      position="relative"
      border={`2px solid ${borderColor}`}
      borderRadius="16px"
      height="100%"
      width="100%"
      background={colors.background}
      boxShadow={boxShadow}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: "translateY(-1px)",
        boxShadow: `0 0 25px ${colors.primary}50, ${colors.shadow}`,
      }}
      overflow="visible"
    >
      {selected && <NodeResizer minWidth={200} minHeight={200} />}

      {/* Header Section with Gradient */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="40px"
        background={isDark
          ? `linear-gradient(90deg, ${colors.primary}20, ${colors.secondary}15)`
          : `linear-gradient(90deg, ${colors.primary}25, ${colors.secondary}20)`
        }
        borderTopRadius="14px"
        borderBottom={`1px solid ${colors.border}30`}
      />

      {/* Job Title with Icon */}
      <Flex
        position="absolute"
        top="8px"
        left="12px"
        align="center"
        gap="8px"
      >
        <Box
          width="6px"
          height="6px"
          borderRadius="50%"
          bg={colors.primary}
          boxShadow={`0 0 8px ${colors.primary}80`}
          animation={`pulse 2s infinite`}
        />
        <Text
          fontSize="sm"
          fontWeight="700"
          color={colors.text}
          letterSpacing="0.5px"
          textShadow={isDark ? `0 0 4px ${colors.primary}40` : "none"}
        >
          JOB
        </Text>
      </Flex>

      {/* Processing Type Badge with Enhanced Styling */}
      {processingType && (
        <Badge
          position="absolute"
          top="6px"
          right="8px"
          colorScheme="blue"
          fontSize="xx-small"
          px="8px"
          py="2px"
          borderRadius="full"
          background={isDark
            ? `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`
            : `linear-gradient(45deg, ${colors.secondary}, ${colors.accent})`
          }
          color={isDark ? "white" : "gray.800"}
          fontWeight="600"
          textTransform="uppercase"
          letterSpacing="0.5px"
          boxShadow={`0 2px 8px ${colors.primary}40`}
        >
          {processingType.replace('_', ' ')}
        </Badge>
      )}

      {/* Central Content Area */}
      <Box
        position="absolute"
        top="45px"
        left="6px"
        right="6px"
        bottom="7px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="8px"
        background={isDark
          ? "rgba(255, 255, 255, 0.02)"
          : "rgba(255, 255, 255, 0.4)"
        }
        border={`1px solid ${colors.border}20`}
        backdropFilter="blur(10px)"
      >
      </Box>

      {/* Value Text with Enhanced Positioning */}
      {value && (
        <Text
          fontSize="xs"
          position="absolute"
          bottom="-24px"
          left="16px"
          color={isDark ? colors.text : "gray.600"}
          fontWeight="500"
          px="8px"
          py="2px"
          bg={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.9)"}
          borderRadius="4px"
          backdropFilter="blur(4px)"
          boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
        >
          {value}
        </Text>
      )}

      {/* Enhanced Terminals */}
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

      {/* Decorative Corner Elements */}
      <Box
        position="absolute"
        top="2px"
        right="2px"
        width="20px"
        height="20px"
        borderTopRightRadius="14px"
        background={`linear-gradient(135deg, ${colors.primary}30, transparent)`}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="2px"
        left="2px"
        width="20px"
        height="20px"
        borderBottomLeftRadius="14px"
        background={`linear-gradient(315deg, ${colors.primary}20, transparent)`}
        pointerEvents="none"
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
}