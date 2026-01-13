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
import { getFilteredParents, getPlaceholderConfig } from "../constants";
import { v4 as uuid } from "uuid";

interface PlaceholderNodeProps {
  id: string;
  data: any;
}

// Pre-define handle styles to avoid recreation
const handleStyleBase = {
  border: "none",
  width: "10px",
  height: "10px",
};

// Component card item memoized separately for better performance
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
    p={6}
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
    <VStack spacing={3}>
      <Flex
        fontSize="36px"
        color={colors.accentColor}
        alignItems="center"
        justifyContent="center"
        w="full"
      >
        {component.icon}
      </Flex>
      <Text
        fontWeight="semibold"
        fontSize="md"
        textAlign="center"
      >
        {component.label}
      </Text>
    </VStack>
  </Box>
));

ComponentCard.displayName = "ComponentCard";

const PlaceholderNode = memo(({ id, data }: PlaceholderNodeProps) => {
  const { isDark } = useDarkMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();

  // Memoize color values with minimal recalculation
  const colors = useMemo(() => ({
    bgColor: isDark ? "#2D3748" : "#F7FAFC",
    borderColor: isDark ? "#4A5568" : "#E2E8F0",
    accentColor: isDark ? "#63B3ED" : "#3182CE",
    textColor: isDark ? "#E2E8F0" : "#2D3748",
    cardBg: isDark ? "#1A202C" : "#FFFFFF",
    cardHoverBg: isDark ? "#2D3748" : "#F7FAFC",
  }), [isDark]);

  // Optimized to only run when edges actually change
  const sourceNodeType = useMemo(() => {
    const edges = getEdges();
    const incomingEdge = edges.find(edge => edge.target === id);
    if (!incomingEdge) return null;

    const sourceNode = getNode(incomingEdge.source);
    return (sourceNode?.type as MajorComponents) || null;
  }, [getEdges, getNode, id]);

  // Get available parents (now just a Map lookup, super fast)
  const availableParents = useMemo(() =>
    getFilteredParents(sourceNodeType || undefined),
    [sourceNodeType]
  );

  // Memoize component select handler with progressive placeholder creation
  const handleComponentSelect = useCallback((componentType: MajorComponents) => {
    const currentNode = getNode(id);
    if (!currentNode) return;

    const componentNodeId = uuid();

    const currentEdges = getEdges();
    const incomingEdge = currentEdges.find(edge => edge.target === id);

    // Find the parent/source node that this placeholder connects to
    let sourceNode = null;
    let sourceNodeType: MajorComponents | null = null;

    if (incomingEdge) {
      sourceNode = getNode(incomingEdge.source);
      if (sourceNode) {
        sourceNodeType = sourceNode.type as MajorComponents;
      }
    }

    const componentNode = {
      id: componentNodeId,
      type: componentType === MajorComponents.Board ? "Job" : componentType,
      position: { ...currentNode.position },
      data: {},
      style: { height: 200, width: 200 },
    };

    // Create placeholders array
    const newPlaceholders: typeof componentNode[] = [];
    const newEdges: Array<{
      id: string;
      source: string;
      target: string;
      type: string;
      animated: boolean;
    }> = [];

    // 1. Create placeholder for the PARENT node (if it has multiple placeholder positions)
    if (sourceNode && sourceNodeType) {
      const sourceConfig = getPlaceholderConfig(sourceNodeType);
      if (sourceConfig.count > 1) {
        // Count existing placeholders from the parent (excluding current one being replaced)
        const existingPlaceholders = currentEdges.filter(
          edge => edge.source === sourceNode.id && edge.target !== id
        ).length;

        // Determine next position index (cycling through available positions)
        const nextPositionIndex = existingPlaceholders % sourceConfig.count;
        const nextPosition = sourceConfig.positions[nextPositionIndex];

        const parentPlaceholderId = uuid();
        const parentPlaceholder = {
          id: parentPlaceholderId,
          type: "PlaceholderNode",
          position: {
            x: sourceNode.position.x + nextPosition.x,
            y: sourceNode.position.y + nextPosition.y,
          },
          data: {},
          style: { height: 80, width: 80 },
        };

        newPlaceholders.push(parentPlaceholder);

        const parentEdge = {
          id: `${sourceNode.id}-${parentPlaceholderId}`,
          source: sourceNode.id,
          target: parentPlaceholderId,
          type: "customEdge",
          animated: true,
        };

        newEdges.push(parentEdge);
      }
    }

    // 2. ALWAYS create a placeholder for the NEW component being added
    const newComponentConfig = getPlaceholderConfig(componentType);
    const newComponentPosition = newComponentConfig.positions[0]; // Always start at first position

    const componentPlaceholderId = uuid();
    const componentPlaceholder = {
      id: componentPlaceholderId,
      type: "PlaceholderNode",
      position: {
        x: componentNode.position.x + newComponentPosition.x,
        y: componentNode.position.y + newComponentPosition.y,
      },
      data: {},
      style: { height: 80, width: 80 },
    };

    newPlaceholders.push(componentPlaceholder);

    const componentEdge = {
      id: `${componentNodeId}-${componentPlaceholderId}`,
      source: componentNodeId,
      target: componentPlaceholderId,
      type: "customEdge",
      animated: true,
    };

    newEdges.push(componentEdge);

    // Single batch update for nodes
    setNodes((nodes) => {
      const updatedNodes = new Array(nodes.length + newPlaceholders.length);
      let writeIndex = 0;

      for (let i = 0; i < nodes.length; i++) {
        updatedNodes[writeIndex++] = nodes[i].id === id ? componentNode : nodes[i];
      }

      for (const placeholder of newPlaceholders) {
        updatedNodes[writeIndex++] = placeholder;
      }

      return updatedNodes;
    });

    // Optimized edge updates
    setEdges(() => {
      const currentEdges = getEdges();
      const updatedEdges: typeof currentEdges = [];
      const incomingEdges: typeof currentEdges = [];

      // Single pass through edges
      for (const edge of currentEdges) {
        if (edge.target === id) {
          incomingEdges.push({
            ...edge,
            target: componentNodeId,
            id: `${edge.source}-${componentNodeId}`,
          });
        } else if (edge.source !== id) {
          updatedEdges.push(edge);
        }
      }

      return [...updatedEdges, ...incomingEdges, ...newEdges];
    });

    onClose();
  }, [id, getNode, setNodes, setEdges, getEdges, onClose]);

  // Memoize handle styles with colors
  const sourceHandleStyle = useMemo(() => ({
    ...handleStyleBase,
    background: colors.accentColor,
  }), [colors.accentColor]);

  const targetHandleStyle = useMemo(() => ({
    ...handleStyleBase,
    background: colors.accentColor,
  }), [colors.accentColor]);

  // Memoize hover styles
  const hoverStyle = useMemo(() => ({
    borderColor: colors.accentColor,
    transform: "scale(1.05)",
    borderStyle: "solid",
    boxShadow: isDark
      ? `0 0 20px ${colors.accentColor}40`
      : `0 0 20px ${colors.accentColor}30`,
  }), [colors.accentColor, isDark]);

  return (
    <>
      <Box
        bg={colors.bgColor}
        border={`2px dashed ${colors.borderColor}`}
        borderRadius="lg"
        width="80px"
        height="80px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        transition="all 0.3s ease"
        position="relative"
        _hover={hoverStyle}
        onClick={onOpen}
      >
        <Box
          fontSize="32px"
          color={colors.accentColor}
          fontWeight="bold"
          lineHeight="1"
        >
          +
        </Box>

        <Handle
          type="source"
          position={Position.Right}
          style={sourceHandleStyle}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={targetHandleStyle}
        />
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size="xl"
        motionPreset="slideInBottom"
        blockScrollOnMount={false}
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          bg={colors.bgColor}
          color={colors.textColor}
          borderRadius="xl"
          boxShadow="2xl"
          maxW="600px"
        >
          <ModalHeader
            fontSize="2xl"
            fontWeight="bold"
            borderBottom={`1px solid ${colors.borderColor}`}
            pb={4}
          >
            Add Component
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            _hover={{
              bg: isDark ? "#4A5568" : "#E2E8F0",
            }}
          />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Text
                fontSize="sm"
                color={isDark ? "#A0AEC0" : "#718096"}
                mb={2}
              >
                {availableParents.length > 0
                  ? "Select a parent component to add to your workflow"
                  : "No compatible parent components available for this connection"}
              </Text>
              {availableParents.length > 0 ? (
                <SimpleGrid columns={2} spacing={4}>
                  {availableParents.map((component) => (
                    <ComponentCard
                      key={component.type}
                      component={component}
                      colors={colors}
                      isDark={isDark}
                      onClick={() => handleComponentSelect(component.type)}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Box
                  p={8}
                  textAlign="center"
                  color={isDark ? "#718096" : "#A0AEC0"}
                >
                  <Text fontSize="lg">No available components</Text>
                  <Text fontSize="sm" mt={2}>
                    The source node type doesn't support any parent connections
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

PlaceholderNode.displayName = "PlaceholderNode";

export default PlaceholderNode;