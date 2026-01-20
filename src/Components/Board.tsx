import { Box, Text, Badge, VStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, SimpleGrid, Flex, Button } from "@chakra-ui/react";
import { Node, NodeProps, NodeResizer, useStore, Handle, Position, useReactFlow } from "@xyflow/react";
import React, { useState, useCallback, useMemo } from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { getUnit } from "../utils";
import Placeholder from "./Placeholder";
import { zoomSelector } from "../utils";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";
import { v4 as uuid } from "uuid";
import { COMPONENTS } from "../constants";

type BoardNode = Node<MajorComponentsData, "string">;

export default function Board({ id, type,
  data: { value, processingType, isDragOver }, selected }: NodeProps<BoardNode>) {

  const unit = getUnit(type as MajorComponents);
  const showContent = useStore(zoomSelector);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();

  const { isDark } = useDarkMode();

  let color = "black";
  if (isDark) color = "white";

  // Change border color when dragging over
  const borderColor = isDragOver
    ? (isDark ? "#4299e1" : "#3182ce") // Blue when dragging over
    : color;

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

  const handleComponentSelect = useCallback((componentType: MajorComponents) => {
    const currentNode = getNodes().find(node => node.id === id);
    if (!currentNode) return;

    const componentNodeId = uuid();
    const placeholderNodeId = uuid();

    // Calculate position inside the board
    const baseX = currentNode.position.x + 50;
    const baseY = currentNode.position.y + 80;
    
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
      position: { x: baseX + 140, y: baseY + yOffset },
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
    onClose();
  }, [id, getNodes, setNodes, setEdges, onClose]);

  return (
    <Box
      position="relative"
      border={`3px solid ${borderColor}`}
      borderRadius="12px"
      height="100%"
      width="100%"
      bg={isDark ? "rgba(100, 150, 200, 0.15)" : "rgba(173, 216, 230, 0.3)"}
      {...(selected && { boxShadow: `${borderColor} 0px 0px 4px` })}
      transition="border-color 0.2s ease"
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

      {/* Add Component Button */}
      <Button
        size="xs"
        position="absolute"
        top="25px"
        left="10px"
        colorScheme="blue"
        onClick={onOpen}
        fontSize="xs"
        px={2}
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