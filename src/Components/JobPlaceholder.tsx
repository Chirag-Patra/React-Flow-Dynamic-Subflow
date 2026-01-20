import React, { memo, useCallback, useMemo } from "react";
import {
  Box,
  VStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useDarkMode } from "../store";
import { MajorComponents } from "../types";
import { v4 as uuid } from "uuid";
import { COMPONENTS } from "../constants";

interface ComponentPlaceholderProps {
  id: string;
  data: any;
}

const ComponentCard = memo(({
  component,
  colors,
  isDark,
  onClick
}: {
  component: any;
  colors: any;
  isDark: boolean;
  onClick: () => void;
}) => (
  <Box
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
    onClick={onClick}
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
      <Text
        fontWeight="semibold"
        fontSize="xs"
        textAlign="center"
      >
        {component.label}
      </Text>
    </VStack>
  </Box>
));

ComponentCard.displayName = "ComponentCard";

const ComponentPlaceholder = memo(({ id, data }: ComponentPlaceholderProps) => {
  const { isDark } = useDarkMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();

  const colors = useMemo(() => ({
    bgColor: isDark ? "#2D3748" : "#F7FAFC",
    borderColor: isDark ? "#4A5568" : "#E2E8F0",
    accentColor: isDark ? "#63B3ED" : "#3182CE",
    textColor: isDark ? "#E2E8F0" : "#2D3748",
    cardBg: isDark ? "#1A202C" : "#FFFFFF",
    cardHoverBg: isDark ? "#2D3748" : "#F7FAFC",
  }), [isDark]);

  // Available components for the placeholder
  const availableComponents = useMemo(() => COMPONENTS, []);

  const handleComponentSelect = useCallback((componentType: MajorComponents) => {
    const currentNode = getNode(id);
    if (!currentNode) return;

    const componentNodeId = uuid();
    const newPlaceholderNodeId = uuid();

    // Get current edges to find the source
    const currentEdges = getEdges();
    const incomingEdge = currentEdges.find(edge => edge.target === id);

    const componentNode = {
      id: componentNodeId,
      type: "MajorComponent",
      position: { ...currentNode.position },
      data: { 
        type: componentType,
        componentType,
        visible: true,
        connectable: true
      },
      parentId: currentNode.parentId,
      extent: "parent" as const,
      expandParent: true,
      style: { height: 55, width: 180 },
    };

    // Create new placeholder to the right
    const newPlaceholderNode = {
      id: newPlaceholderNodeId,
      type: "ComponentPlaceholder",
      position: { 
        x: currentNode.position.x + 140, 
        y: currentNode.position.y 
      },
      data: {},
      parentId: currentNode.parentId,
      extent: "parent" as const,
      expandParent: true,
      style: { height: 60, width: 100 },
    };

    const newEdge = {
      id: `${componentNodeId}-${newPlaceholderNodeId}`,
      source: componentNodeId,
      target: newPlaceholderNodeId,
      type: "smoothstep",
    };

    // Update current placeholder node to be the new component
    setNodes(nodes => 
      nodes.map(node => 
        node.id === id 
          ? componentNode
          : node
      ).concat(newPlaceholderNode)
    );

    // Update edges
    setEdges(edges => {
      const updatedEdges = edges.map(edge => 
        edge.target === id 
          ? { ...edge, target: componentNodeId }
          : edge
      );
      return [...updatedEdges, newEdge];
    });

    onClose();
  }, [id, getNode, getEdges, setNodes, setEdges, onClose]);

  return (
    <>
      {/* Target handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          border: "none",
          width: "10px",
          height: "10px",
          background: colors.accentColor,
        }}
      />

      {/* Main placeholder box */}
      <Box
        bg={colors.bgColor}
        border={`2px dashed ${colors.borderColor}`}
        borderRadius="md"
        height="100%"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: colors.accentColor,
          bg: colors.cardHoverBg,
        }}
        onClick={onOpen}
      >
        <VStack spacing={1}>
          <Text fontSize="24px" color={colors.accentColor}>
            +
          </Text>
          <Text fontSize="xs" color={colors.textColor} fontWeight="medium">
            Add Component
          </Text>
        </VStack>
      </Box>

      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          border: "none",
          width: "10px",
          height: "10px",
          background: colors.accentColor,
        }}
      />

      {/* Component selection modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={colors.bgColor} color={colors.textColor}>
          <ModalHeader>Select Component</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SimpleGrid columns={3} spacing={4}>
              {availableComponents.map((component) => (
                <ComponentCard
                  key={component.type}
                  component={component}
                  colors={colors}
                  isDark={isDark}
                  onClick={() => handleComponentSelect(component.type)}
                />
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

ComponentPlaceholder.displayName = "ComponentPlaceholder";

export default ComponentPlaceholder;