import React, { memo } from "react";
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
  Button,
  HStack,
} from "@chakra-ui/react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useDarkMode } from "../store";
import { MajorComponents } from "../types";
import { PARENT } from "../constants";
import { v4 as uuid } from "uuid";

interface PlaceholderNodeProps {
  id: string;
  data: any;
}

const PlaceholderNode = memo(({ id, data }: PlaceholderNodeProps) => {
  const { isDark } = useDarkMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();

  const handleComponentSelect = (componentType: MajorComponents) => {
    const currentNode = getNode(id);
    if (!currentNode) return;

    const componentNodeId = uuid();
    const newPlaceholderId = uuid();
    
    // Calculate position for the new placeholder (to the right of the new component)
    const placeholderPosition = {
      x: currentNode.position.x + 250, // 250px to the right
      y: currentNode.position.y,
    };

    // Replace the current placeholder with the selected component
    const componentNode = {
      id: componentNodeId,
      type: componentType === MajorComponents.Board ? "Job" : componentType,
      position: currentNode.position, // Use the current placeholder position
      data: {},
      style: { height: 200, width: 200 },
    };

    // Create a new placeholder to the right of the component
    const newPlaceholder = {
      id: newPlaceholderId,
      type: "PlaceholderNode",
      position: placeholderPosition,
      data: {},
      style: { height: 150, width: 200 },
    };

    // Create an edge from the new component to the new placeholder
    const componentToPlaceholderEdge = {
      id: `${componentNodeId}-${newPlaceholderId}`,
      source: componentNodeId,
      target: newPlaceholderId,
      type: "customEdge",
      animated: true,
    };

    // Update nodes: replace current placeholder with component, add new placeholder
    setNodes((nodes) => 
      nodes.map((node) => 
        node.id === id ? componentNode : node
      ).concat(newPlaceholder)
    );
    
    // Update edges: transfer any incoming connections from placeholder to new component, add new edge
    setEdges((edges) => {
      // Get current edges
      const currentEdges = getEdges();
      
      // Find edges that were targeting the old placeholder
      const incomingEdges = currentEdges.filter(edge => edge.target === id);
      
      // Update those edges to target the new component instead
      const updatedIncomingEdges = incomingEdges.map(edge => ({
        ...edge,
        target: componentNodeId,
        id: `${edge.source}-${componentNodeId}`, // Update edge id
      }));
      
      // Keep all other edges that don't involve the old placeholder
      const otherEdges = currentEdges.filter(edge => edge.target !== id && edge.source !== id);
      
      // Return all edges: other edges + updated incoming edges + new edge to placeholder
      return [...otherEdges, ...updatedIncomingEdges, componentToPlaceholderEdge];
    });

    onClose();
  };

  const bgColor = isDark ? "#2D3748" : "#F7FAFC";
  const borderColor = isDark ? "#4A5568" : "#E2E8F0";
  const textColor = isDark ? "#E2E8F0" : "#2D3748";

  return (
    <>
      <Box
        bg={bgColor}
        border={`2px dashed ${borderColor}`}
        borderRadius="md"
        p={4}
        width="200px"
        height="150px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: isDark ? "#63B3ED" : "#3182CE",
          bg: isDark ? "#3A4A5C" : "#EBF8FF",
        }}
        onClick={onOpen}
      >
        <VStack spacing={2}>
          <Box
            fontSize="24px"
            color={isDark ? "#63B3ED" : "#3182CE"}
            fontWeight="bold"
          >
            +
          </Box>
          <Text
            fontSize="sm"
            textAlign="center"
            color={textColor}
            fontWeight="medium"
          >
            Click to add parent component
          </Text>
        </VStack>

        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: isDark ? "#63B3ED" : "#3182CE",
            border: "none",
            width: "10px",
            height: "10px",
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: isDark ? "#63B3ED" : "#3182CE",
            border: "none",
            width: "10px",
            height: "10px",
          }}
        />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={bgColor} color={textColor}>
          <ModalHeader>Select Parent Component</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={3}>
              <Text fontSize="sm" color={isDark ? "#A0AEC0" : "#718096"}>
                Choose a parent component to add to your workflow:
              </Text>
              {PARENT.filter(component => component.type !== MajorComponents.PlaceholderNode).map((component) => (
                <Button
                  key={component.type}
                  variant="outline"
                  size="lg"
                  width="100%"
                  height="60px"
                  borderColor={borderColor}
                  _hover={{
                    borderColor: isDark ? "#63B3ED" : "#3182CE",
                    bg: isDark ? "#3A4A5C" : "#EBF8FF",
                  }}
                  onClick={() => handleComponentSelect(component.type)}
                >
                  <HStack spacing={3}>
                    <Box>{component.icon}</Box>
                    <Text fontWeight="medium">{component.label}</Text>
                  </HStack>
                </Button>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

PlaceholderNode.displayName = "PlaceholderNode";

export default PlaceholderNode;
