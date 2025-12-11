import { Box, Text, Badge, Flex, Icon } from "@chakra-ui/react";
import { Node, NodeProps, NodeResizer, useStore, Handle, Position } from "@xyflow/react";
import React from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { getUnit } from "../utils";
import { zoomSelector } from "../utils";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";

type ETLONode = Node<MajorComponentsData, "string">;

export default function ETLO({ type,
  data: { value, processingType, isDragOver }, selected }: NodeProps<ETLONode>) {

  const unit = getUnit(type as MajorComponents);
  const showContent = useStore(zoomSelector);
  const { isDark } = useDarkMode();

  // Enhanced color scheme for ETLO
  const colors = {
    primary: isDark ? "#48BB78" : "#38A169",
    secondary: isDark ? "#68D391" : "#4FD1C7",
    accent: isDark ? "#9AE6B4" : "#81E6D9",
    background: isDark 
      ? "linear-gradient(135deg, rgba(72, 187, 120, 0.12) 0%, rgba(104, 211, 145, 0.08) 100%)"
      : "linear-gradient(135deg, rgba(56, 161, 105, 0.15) 0%, rgba(79, 209, 199, 0.1) 100%)",
    border: isDark ? "#48BB78" : "#38A169",
    text: isDark ? "#C6F6D5" : "#22543D",
    shadow: isDark 
      ? "0 8px 32px rgba(72, 187, 120, 0.3)" 
      : "0 8px 32px rgba(56, 161, 105, 0.25)"
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

      {/* ETLO Title with Icon */}
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
          ETL ORCHESTRATOR
        </Text>
      </Flex>

      {/* Processing Type Badge with Enhanced Styling */}
      {processingType && (
        <Badge
          position="absolute"
          top="6px"
          right="8px"
          colorScheme="green"
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
        {/* {!value && (
          <Text
            fontSize="xs"
            color={colors.text}
            opacity="0.7"
            textAlign="center"
            fontStyle="italic"
          >
            Drop components here
          </Text>
        )} */}
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