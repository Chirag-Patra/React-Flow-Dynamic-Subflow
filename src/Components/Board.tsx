import { Box, Text, Badge, VStack, IconButton, Tooltip, Image } from "@chakra-ui/react";
import { Node, NodeProps, NodeResizer, useStore, Position, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { useState, useCallback, useEffect, useRef, memo } from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { getUnit } from "../utils";
import { zoomSelector } from "../utils";
import Terminal from "./Terminal";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import jobIcon from "../logo/jobicon.png";
import { useThemeColors, useBoardOperations, useOptimizedResizeObserver, storeBoardSize, getStoredBoardSize } from "../hooks";

type BoardNode = Node<MajorComponentsData, "string">;

function Board({ id, type,
  data: { value, processingType, isDragOver }, selected }: NodeProps<BoardNode>) {

  const unit = getUnit(type as MajorComponents);
  const showContent = useStore(zoomSelector);
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode, setNodes } = useReactFlow();
  
  // Check if the board should be initially expanded
  // Use a data property or default to collapsed state
  const [isExpanded, setIsExpanded] = useState(() => {
    const node = getNode(id);
    // Check if there's an explicit expanded state in data, otherwise check size
    if (node?.data?.isExpanded !== undefined) {
      return node.data.isExpanded;
    }
    // If the node is larger than default collapsed size (150), it's likely expanded
    const nodeHeight = node?.style?.height || node?.height || 150;
    return typeof nodeHeight === 'number' ? nodeHeight > 160 : false;
  });
  
  
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Track expanded size in state - initialize from localStorage, node data, or default
  const [expandedSize, setExpandedSize] = useState(() => {
    // First try localStorage
    const stored = getStoredBoardSize(id);
    if (stored) return stored;
    // Then try node data
    const node = getNode(id);
    if (node?.data?.expandedWidth && node?.data?.expandedHeight) {
      return { width: node.data.expandedWidth, height: node.data.expandedHeight };
    }
    // Default size
    return { width: 400, height: 280 };
  });

  // Get current node dimensions based on expanded state
  // Use expandedSize state which is updated during resize
  const nodeHeight = isExpanded ? expandedSize.height : 150;
  const nodeWidth = isExpanded ? expandedSize.width : 150;

  // Use optimized hooks
  const themeColors = useThemeColors(isDragOver);
  const { toggleBoardExpansion, boardSizes } = useBoardOperations(id);
  const { setupResizeObserver } = useOptimizedResizeObserver(nodeRef, id, updateNodeInternals);

  // Optimized ResizeObserver setup
  useEffect(() => {
    return setupResizeObserver();
  }, [setupResizeObserver]);

  // Sync expandedSize from localStorage when expanding
  useEffect(() => {
    if (isExpanded) {
      const stored = getStoredBoardSize(id);
      if (stored) {
        setExpandedSize(stored);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, id]);

  // Update isExpanded state when node dimensions change (but not during manual resize)
  useEffect(() => {
    const node = getNode(id);
    if (node?.style?.height && node?.data?.isExpanded !== undefined) {
      // Only sync state if the node data has an explicit expanded state
      // This prevents interference during manual resizing
      const dataExpandedState = node.data.isExpanded;
      if (dataExpandedState !== isExpanded) {
        setIsExpanded(dataExpandedState);
      }
    }
  }, [nodeHeight, nodeWidth, id, getNode, isExpanded]);

  const toggleExpanded = useCallback(() => {
    // If collapsing, save current dimensions from the DOM element
    if (isExpanded && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      storeBoardSize(id, rect.width, rect.height);
      setExpandedSize({ width: rect.width, height: rect.height });
    }
    toggleBoardExpansion(!!isExpanded, setIsExpanded);
  }, [toggleBoardExpansion, isExpanded, id]);

  // Handle resize - update local state for live preview
  const handleResize = useCallback((_event: unknown, params: { x: number; y: number; width: number; height: number }) => {
    setExpandedSize({ width: params.width, height: params.height });
  }, []);

  // Handle resize end - save final dimensions to localStorage and node data
  const handleResizeEnd = useCallback((_event: unknown, params: { x: number; y: number; width: number; height: number }) => {
    const { width, height } = params;
    // Save to localStorage
    storeBoardSize(id, width, height);
    // Also save in node data for persistence
    setNodes(nodes => nodes.map(node =>
      node.id === id
        ? { ...node, data: { ...node.data, expandedWidth: width, expandedHeight: height } }
        : node
    ));
  }, [id, setNodes]);

  // Collapsed view (similar to ETLO)
  if (!isExpanded) {
    return (
      <Box
        ref={nodeRef}
        position="relative"
        border={`3px solid ${themeColors.borderColor}`}
        borderRadius="16px"
        height="150px"
        width="150px"
        bg={themeColors.bgColor}
        backdropFilter="blur(10px)"
        {...(selected && {
          boxShadow: `0 0 0 2px ${themeColors.borderColor}, 0 4px 12px rgba(0, 0, 0, 0.15)`
        })}
        transition="all 0.1s ease-out"
        display="flex"
        alignItems="center"
        justifyContent="center"
        _hover={{
          boxShadow: selected
            ? `0 0 0 2px ${themeColors.borderColor}, 0 4px 12px rgba(0, 0, 0, 0.15)`
            : "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Processing Type Badge */}
        {processingType && (
          <Badge
            position="absolute"
            top="5px"
            right="5px"
            colorScheme="purple"
            fontSize="xx-small"
            zIndex={10}
          >
            {processingType.replace('_', ' ').toUpperCase()}
          </Badge>
        )}

        {/* Expand Button */}
        <Tooltip label="Expand Board" placement="top" hasArrow>
          <IconButton
            icon={<ChevronDownIcon boxSize={5} />}
            aria-label="Expand board"
            size="xs"
            position="absolute"
            top="5px"
            left="5px"
            colorScheme="blue"
            onClick={toggleExpanded}
            variant="ghost"
            zIndex={10}
          />
        </Tooltip>

        {/* Board Logo */}
        <VStack spacing={2}>
          <Tooltip label="Job" placement="top" hasArrow>
            <Box
              width="70px"
              height="70px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="12px"
              bg={themeColors.modal.cardBg}
              padding={2}
              transition="all 0.2s ease"
              _hover={{
                transform: "scale(1.05)",
                bg: themeColors.modal.cardHoverBg
              }}
            >
              <Image
                src={jobIcon}
                alt="Job Icon"
                width="70px"
                height="70px"
                objectFit="contain"
              />
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
            color={themeColors.baseColor}
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

  // Expanded view (original Board component)
  return (
    <Box
      ref={nodeRef}
      position="relative"
      border={`3px solid ${themeColors.borderColor}`}
      borderRadius="12px"
      height="100%"
      width="100%"
      bg={themeColors.bgColor}
      {...(selected && { boxShadow: `${themeColors.borderColor} 0px 0px 4px` })}
      transition="all 0.1s ease-out"
      minHeight={boardSizes.expanded.minHeight}
      minWidth={boardSizes.expanded.minWidth}
    >
      {selected && (
        <NodeResizer
          minWidth={boardSizes.expanded.minWidth}
          minHeight={boardSizes.expanded.minHeight}
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
        />
      )}

      {/* Collapse Button */}
      <Tooltip label="Collapse Board" placement="top" hasArrow>
        <IconButton
          icon={<ChevronUpIcon boxSize={5} />}
          aria-label="Collapse board"
          size="xs"
          position="absolute"
          top="5px"
          left="5px"
          colorScheme="blue"
          onClick={toggleExpanded}
          variant="ghost"
          zIndex={10}
        />
      </Tooltip>

      {/* Processing Type Badge */}
      {processingType && (
        <Badge
          position="absolute"
          top="5px"
          right="5px"
          colorScheme="purple"
          fontSize="xx-small"
          zIndex={10}
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
          color={themeColors.baseColor}
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

// Export memoized component for performance
export default memo(Board);