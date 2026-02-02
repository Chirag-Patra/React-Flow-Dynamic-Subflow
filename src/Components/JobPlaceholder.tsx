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

const ComponentPlaceholder = memo(({ id }: ComponentPlaceholderProps) => {
  const { isDark } = useDarkMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setNodes, setEdges, getNode } = useReactFlow();

  const colors = useMemo(() => ({
    bgColor: isDark ? "rgba(45, 55, 72, 0.6)" : "rgba(255, 255, 255, 0.8)",
    borderColor: isDark ? "#4A5568" : "#CBD5E0",
    accentColor: isDark ? "#A78BFA" : "#7C3AED",  // Blue/Purple accent
    hoverBg: isDark ? "rgba(167, 139, 250, 0.15)" : "rgba(124, 58, 237, 0.1)",
    textColor: isDark ? "#A0AEC0" : "#718096",
    cardBg: isDark ? "#1A202C" : "#FFFFFF",
    cardHoverBg: isDark ? "#2D3748" : "#F7FAFC",
    cardBorderColor: isDark ? "#4A5568" : "#E2E8F0",
    cardAccentColor: isDark ? "#A78BFA" : "#7C3AED",
  }), [isDark]);

  // Available components for the placeholder
  const availableComponents = useMemo(() => COMPONENTS, []);

  const handleComponentSelect = useCallback((componentType: MajorComponents) => {
    const currentNode = getNode(id);
    if (!currentNode) return;

    const componentNodeId = uuid();
    const newPlaceholderNodeId = uuid();

    // Component size constants
    const componentWidth = 180;
    const componentHeight = 55;
    const placeholderWidth = 44;  // Square for circular appearance
    const placeholderHeight = 44;
    const gap = 20;

    // Component replaces the placeholder, but needs to be positioned for proper alignment
    // Adjust Y position so component is centered where placeholder was (horizontal flow)
    const componentY = currentNode.position.y - (componentHeight - placeholderHeight) / 2;

    const componentNode = {
      id: componentNodeId,
      type: "MajorComponent",
      position: { x: currentNode.position.x, y: componentY },  // Same X, centered Y
      data: {
        type: componentType,
        componentType,
        visible: true,
        connectable: true
      },
      parentId: currentNode.parentId,
      extent: "parent" as const,
      expandParent: true,
      style: { height: componentHeight, width: componentWidth },
    };

    // Create new placeholder to the right on the same Y center (horizontal line)
    const newPlaceholderNode = {
      id: newPlaceholderNodeId,
      type: "ComponentPlaceholder",
      position: {
        x: currentNode.position.x + componentWidth + gap,  // Right of the component
        y: currentNode.position.y  // Same Y position (centered)
      },
      data: {},
      parentId: currentNode.parentId,
      extent: "parent" as const,
      expandParent: true,
      style: { height: placeholderHeight, width: placeholderWidth },
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
  }, [id, getNode, setNodes, setEdges, onClose]);

  return (
    <>
      {/* Target handle - Left for horizontal flow */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          border: `2px solid ${colors.accentColor}`,
          width: "12px",
          height: "12px",
          background: isDark ? "#1A202C" : "#FFFFFF",
          borderRadius: "50%",
        }}
      />

      {/* Main placeholder box - Clean circular + button */}
      <Box
        bg={colors.accentColor}
        borderRadius="full"
        height="100%"
        width="100%"
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
          fontSize="22px"
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
        style={{
          border: `2px solid ${colors.accentColor}`,
          width: "12px",
          height: "12px",
          background: isDark ? "#1A202C" : "#FFFFFF",
          borderRadius: "50%",
        }}
      />

      {/* Component selection modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={colors.cardBg} color={isDark ? "#E2E8F0" : "#2D3748"}>
          <ModalHeader>Select Component</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SimpleGrid columns={3} spacing={4}>
              {availableComponents.map((component) => (
                <ComponentCard
                  key={component.type}
                  component={component}
                  colors={{
                    ...colors,
                    borderColor: colors.cardBorderColor,
                    accentColor: colors.cardAccentColor,
                  }}
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