import { Box, Text, VStack, Tooltip, Image } from "@chakra-ui/react";
import { Node, NodeProps, Position } from "@xyflow/react";
import React, { memo, useMemo } from "react";
import { MajorComponentsData } from "../types";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";
import batchETLOImage from "../logo/batch-processing (1).png"; // Import your Batch ETLO image

type BatchETLONode = Node<MajorComponentsData, "string">;

// Memoized icon wrapper to prevent re-renders
const MemoizedBatchETLOImage = memo(({
  isDark
}: {
  isDark: boolean;
}) => (
  <Image
    src={batchETLOImage}
    alt="Batch ETLO"
    width="70px"
    height="60px"
    style={{
      filter: isDark
        ? "drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
        : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
    }}
  />
));

MemoizedBatchETLOImage.displayName = "MemoizedBatchETLOImage";

const BatchETLO = ({
  data: { value, isDragOver },
  selected
}: NodeProps<BatchETLONode>) => {
  const { isDark } = useDarkMode();

  // Memoize color calculations
  const colors = useMemo(() => {
    const baseColor = isDark ? "white" : "black";
    const borderColor = isDragOver
      ? (isDark ? "#48bb78" : "#38a169")
      : baseColor;
    const bgColor = isDragOver
      ? (isDark ? "rgba(72, 187, 120, 0.15)" : "rgba(56, 161, 105, 0.15)")
      : (isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)");
    const iconBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)";
    const iconBgHover = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";

    return { baseColor, borderColor, bgColor, iconBg, iconBgHover };
  }, [isDark, isDragOver]);

  // Memoize box shadow
  const boxShadow = useMemo(() =>
    selected
      ? `0 0 0 2px ${colors.borderColor}, 0 4px 12px rgba(0, 0, 0, 0.15)`
      : undefined,
    [selected, colors.borderColor]
  );

  // Memoize hover styles
  const hoverStyle = useMemo(() => ({
    boxShadow: selected
      ? `0 0 0 2px ${colors.borderColor}, 0 4px 12px rgba(0, 0, 0, 0.15)`
      : "0 2px 8px rgba(0, 0, 0, 0.1)"
  }), [selected, colors.borderColor]);

  // Memoize icon box hover style
  const iconBoxHoverStyle = useMemo(() => ({
    transform: "scale(1.05)",
    bg: colors.iconBgHover
  }), [colors.iconBgHover]);

  return (
    <Box
      position="relative"
      border={`3px solid ${colors.borderColor}`}
      borderRadius="16px"
      height="150px"
      width="150px"
      bg={colors.bgColor}
      backdropFilter="blur(10px)"
      boxShadow={boxShadow}
      transition="all 0.2s ease"
      display="flex"
      alignItems="center"
      justifyContent="center"
      _hover={hoverStyle}
    >
      <VStack spacing={2}>
        <Tooltip label="Batch ETLO" placement="top" hasArrow>
          <Box
            width="70px"
            height="70px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="12px"
            bg={colors.iconBg}
            padding={2}
            transition="all 0.3s ease"
            _hover={iconBoxHoverStyle}
            cursor="pointer"
          >
            <MemoizedBatchETLOImage isDark={isDark} />
          </Box>
        </Tooltip>
      </VStack>

      {/* Value Text */}
      {value && (
        <Text
          fontSize="xx-small"
          position="absolute"
          bottom="-22px"
          left="14px"
          color={colors.baseColor}
          fontWeight="medium"
        >
          {value}
        </Text>
      )}

      {/* Terminals */}
      <Terminal type="source" position={Position.Right} id="right" />
      <Terminal type="target" position={Position.Left} id="left" />
    </Box>
  );
};

// Memoize the entire component
export default memo(BatchETLO);