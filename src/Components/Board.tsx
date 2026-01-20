import { Box, Text, Badge, VStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, SimpleGrid, Flex, Button, IconButton, Tooltip } from "@chakra-ui/react";
import { Node, NodeProps, NodeResizer, useStore, Handle, Position, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { getUnit } from "../utils";
import Placeholder from "./Placeholder";
import { zoomSelector } from "../utils";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";
import { v4 as uuid } from "uuid";
import { COMPONENTS } from "../constants";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import SvgComponent from "../logo/ETLOIcon"; // Import your SVG icon

type BoardNode = Node<MajorComponentsData, "string">;

export default function Board({ id, type,
  data: { value, processingType, isDragOver }, selected }: NodeProps<BoardNode>) {

  const unit = getUnit(type as MajorComponents);
  const showContent = useStore(zoomSelector);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const [isExpanded, setIsExpanded] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const { isDark } = useDarkMode();

  let color = "black";
  if (isDark) color = "white";

  // Change border color when dragging over
  const borderColor = isDragOver
    ? (isDark ? "#4299e1" : "#3182ce") // Blue when dragging over
    : color;

  // Background color based on drag state
  const bgColor = isDragOver
    ? (isDark ? "rgba(66, 153, 225, 0.15)" : "rgba(49, 130, 206, 0.15)")
    : (isDark ? "rgba(100, 150, 200, 0.15)" : "rgba(173, 216, 230, 0.3)");

  // Available components for this board
  const availableComponents = useMemo(() => COMPONENTS, []);

  const colors = useMemo(() => ({
    bgColor: isDark ? "#2D3748" : "#F7FAFC",
    borderColor: isDark ? "#4A5568" : "#E2E8F0",
    accentColor: isDark ? "#63B3ED" : "#3182CE",
    textColor: isDark ? "#E2E8F0" : "#2D3748",
    cardBg: isDark ? "#1A202C" : "#FFFFFF",
    cardHoverBg: isDark ? "#2D3748" : "#F7FAFC",
  }), [isDark]);

  // ResizeObserver to detect size changes and update handles
  useEffect(() => {
    if (!nodeRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Update handles whenever the node is resized
      updateNodeInternals(id);
    });

    resizeObserver.observe(nodeRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [id, updateNodeInternals]);

  const handleComponentSelect = useCallback((componentType: MajorComponents) => {
    const currentNode = getNodes().find(node => node.id === id);
    if (!currentNode) return;

    const componentNodeId = uuid();
    const placeholderNodeId = uuid();

    // Calculate position inside the board - use relative positioning
    const baseX = 50;
    const baseY = 80;

    // Find existing components to avoid overlap
    const existingComponents = getNodes().filter(node =>
      node.parentId === id && node.type !== "ComponentPlaceholder"
    );
    const yOffset = existingComponents.length * 80;

    const componentNode = {
      id: componentNodeId,
      type: "MajorComponent",
      position: { x: baseX, y: baseY + yOffset },
      data: {
        type: componentType,
        componentType,
        visible: true,
        connectable: true
      },
      parentId: id,
      extent: "parent" as const,
      expandParent: true,
      style: { height: 60, width: 180 },
    };

    const placeholderNode = {
      id: placeholderNodeId,
      type: "ComponentPlaceholder",
      position: { x: baseX + 200, y: baseY + yOffset },
      data: {},
      parentId: id,
      expandParent: true,
      extent: "parent" as const,
      style: { height: 60, width: 100 },
    };

    const newEdge = {
      id: `${componentNodeId}-${placeholderNodeId}`,
      source: componentNodeId,
      target: placeholderNodeId,
      type: "smoothstep",
    };

    setNodes(nodes => [...nodes, componentNode, placeholderNode]);
    setEdges(edges => [...edges, newEdge]);

    // Automatically expand when adding a component
    if (!isExpanded) {
      setIsExpanded(true);
    }

    onClose();
  }, [id, getNodes, setNodes, setEdges, onClose, isExpanded]);

  const toggleExpanded = useCallback(() => {
    const newExpandedState = !isExpanded;

    // Get all child node IDs upfront
    const childIds = getNodes()
      .filter(node => node.parentId === id)
      .map(node => node.id);

    // Batch all updates in a single call
    setNodes(nodes => nodes.map(node => {
      // Update the board node dimensions
      if (node.id === id) {
        if (newExpandedState) {
          // Expanding
          return {
            ...node,
            style: {
              ...node.style,
              height: 400,
              width: 500,
            }
          };
        } else {
          // Collapsing
          return {
            ...node,
            style: {
              ...node.style,
              height: 150,
              width: 150,
            }
          };
        }
      }

      // Update child node visibility
      if (node.parentId === id) {
        return {
          ...node,
          hidden: !newExpandedState,
        };
      }

      return node;
    }));

    // Batch all edge updates
    setEdges(edges => edges.map(edge => {
      // Only hide edges that are completely internal to the board
      const isInternalEdge = childIds.includes(edge.source) && childIds.includes(edge.target);

      if (isInternalEdge) {
        return {
          ...edge,
          hidden: !newExpandedState,
        };
      }
      return edge;
    }));

    // Update state immediately
    setIsExpanded(newExpandedState);

    // Quick handle update - reduced timeout
    requestAnimationFrame(() => {
      updateNodeInternals(id);
    });
  }, [id, isExpanded, setNodes, setEdges, getNodes, updateNodeInternals]);

  // Collapsed view (similar to ETLO)
  if (!isExpanded) {
    return (
      <Box
        ref={nodeRef}
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
        transition="all 0.1s ease-out"
        display="flex"
        alignItems="center"
        justifyContent="center"
        _hover={{
          boxShadow: selected
            ? `0 0 0 2px ${borderColor}, 0 4px 12px rgba(0, 0, 0, 0.15)`
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
          <Tooltip label="Board" placement="top" hasArrow>
            <Box
              width="70px"
              height="70px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="12px"
              bg={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"}
              padding={2}
              transition="all 0.2s ease"
              _hover={{
                transform: "scale(1.05)",
                bg: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"
              }}
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

  // Expanded view (original Board component)
  return (
    <Box
      ref={nodeRef}
      position="relative"
      border={`3px solid ${borderColor}`}
      borderRadius="12px"
      height="100%"
      width="100%"
      bg={bgColor}
      {...(selected && { boxShadow: `${borderColor} 0px 0px 4px` })}
      transition="all 0.1s ease-out"
      minHeight="200px"
      minWidth="200px"
    >
      {selected && <NodeResizer minWidth={300} minHeight={300} />}

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
          color={isDark ? "white" : "black"}
        >
          {value}
        </Text>
      )}

      {/* Add Component Button */}
      <Button
        size="xs"
        position="absolute"
        top="5px"
        left="50px"
        colorScheme="blue"
        onClick={onOpen}
        fontSize="xs"
        px={2}
        zIndex={10}
      >
        + Add Component
      </Button>

      {/* Component Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={colors.bgColor} color={colors.textColor}>
          <ModalHeader>Add Component to Board</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SimpleGrid columns={3} spacing={4}>
              {availableComponents.map((component) => (
                <Box
                  key={component.type}
                  as="button"
                  bg={colors.cardBg}
                  border={`2px solid ${colors.borderColor}`}
                  borderRadius="lg"
                  p={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: colors.accentColor,
                    bg: colors.cardHoverBg,
                    transform: "translateY(-2px)",
                    boxShadow: isDark
                      ? `0 4px 12px ${colors.accentColor}30`
                      : `0 4px 12px ${colors.accentColor}20`,
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  onClick={() => handleComponentSelect(component.type)}
                >
                  <VStack spacing={2}>
                    <Box
                      w="40px"
                      h="40px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {component.icon}
                    </Box>
                    <Text fontWeight="semibold" fontSize="sm" textAlign="center">
                      {component.label}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>

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