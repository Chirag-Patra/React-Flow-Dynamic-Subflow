import { memo, useCallback, useMemo } from "react";
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
    borderRadius="xl"
    p={5}
    cursor="pointer"
    transition="all 0.2s ease"
    _hover={{
      borderColor: colors.accentColor,
      bg: colors.cardHoverBg,
      transform: "translateY(-3px)",
      boxShadow: `0 8px 20px ${colors.accentColor}25`,
    }}
    _active={{
      transform: "translateY(0)",
    }}
    onClick={onClick}
  >
    <VStack spacing={3}>
      <Flex
        fontSize="32px"
        color={colors.accentColor}
        alignItems="center"
        justifyContent="center"
        w="60px"
        h="60px"
        borderRadius="lg"
        bg={isDark ? "rgba(167, 139, 250, 0.1)" : "rgba(124, 58, 237, 0.1)"}
      >
        {component.icon}
      </Flex>
      <Text
        fontWeight="semibold"
        fontSize="sm"
        textAlign="center"
        color={isDark ? "#E2E8F0" : "#2D3748"}
      >
        {component.label}
      </Text>
    </VStack>
  </Box>
));

ComponentCard.displayName = "ComponentCard";

const PlaceholderNode = memo(({ id }: PlaceholderNodeProps) => {
  const { isDark } = useDarkMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();

  // Memoize color values - Blue/Purple accent theme
  const colors = useMemo(() => ({
    bgColor: isDark ? "#1A202C" : "#FFFFFF",
    borderColor: isDark ? "#4A5568" : "#CBD5E0",
    accentColor: isDark ? "#A78BFA" : "#7C3AED",  // Blue/Purple accent
    textColor: isDark ? "#E2E8F0" : "#2D3748",
    cardBg: isDark ? "#2D3748" : "#FFFFFF",
    cardHoverBg: isDark ? "#3D4A5C" : "#F7FAFC",
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
          style: { height: 50, width: 50 },
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
      style: { height: 50, width: 50 },
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

  // Handle styles for vertical flow
  const handleStyle = useMemo(() => ({
    border: `2px solid ${colors.accentColor}`,
    width: "12px",
    height: "12px",
    background: isDark ? "#1A202C" : "#FFFFFF",
    borderRadius: "50%",
  }), [colors.accentColor, isDark]);

  return (
    <>
      {/* Target handle - Left for horizontal flow */}
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
      />

      {/* Main placeholder - Clean circular green button */}
      <Box
        bg={colors.accentColor}
        borderRadius="full"
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        transition="all 0.25s ease"
        boxShadow={`0 2px 8px ${colors.accentColor}40`}
        _hover={{
          transform: "scale(1.1)",
          boxShadow: `0 4px 16px ${colors.accentColor}60`,
        }}
        onClick={onOpen}
      >
        <Text
          color="white"
          fontSize="24px"
          fontWeight="bold"
          lineHeight="1"
          userSelect="none"
        >
          +
        </Text>
      </Box>

      {/* Source handle - Right for horizontal flow */}
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size="lg"
        motionPreset="slideInBottom"
        blockScrollOnMount={false}
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg={colors.cardBg}
          color={colors.textColor}
          borderRadius="2xl"
          boxShadow="xl"
          maxW="500px"
        >
          <ModalHeader
            fontSize="xl"
            fontWeight="semibold"
            borderBottom={`1px solid ${colors.borderColor}`}
            pb={4}
          >
            Add Component
          </ModalHeader>
          <ModalCloseButton
            _hover={{
              bg: isDark ? "#4A5568" : "#E2E8F0",
            }}
          />
          <ModalBody py={5}>
            <VStack spacing={4} align="stretch">
              <Text
                fontSize="sm"
                color={isDark ? "#A0AEC0" : "#718096"}
              >
                {availableParents.length > 0
                  ? "Select a component to add to your workflow"
                  : "No compatible components available"}
              </Text>
              {availableParents.length > 0 ? (
                <SimpleGrid columns={2} spacing={3}>
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
                  p={6}
                  textAlign="center"
                  color={isDark ? "#718096" : "#A0AEC0"}
                  borderRadius="lg"
                  bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"}
                >
                  <Text fontSize="md">No available components</Text>
                  <Text fontSize="xs" mt={1}>
                    The source doesn't support any connections
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