import { Box, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, SimpleGrid, VStack } from "@chakra-ui/react";
import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo } from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { useDarkMode } from "../store";
import Terminal from "./Terminal";
import { COMPONENTS } from "../constants";
import { v4 as uuid } from "uuid";

type MapNode = Node<MajorComponentsData, "string">;

function Map({
  data: { value, isDragOver },
  selected,
  id
}: NodeProps<MapNode>) {

  const { isDark } = useDarkMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setNodes, getNodes } = useReactFlow();

  let color = "black";
  if (isDark) color = "white";

  const borderColor = isDragOver
    ? (isDark ? "#4299e1" : "#3182ce")
    : color;

  const headerBg = isDark ? "rgba(200, 80, 80, 0.8)" : "rgba(255, 100, 100, 0.85)";
  const bodyBg = isDark ? "rgba(200, 100, 100, 0.3)" : "rgba(255, 150, 150, 0.4)";
  const dashedBorder = isDragOver
    ? (isDark ? "#4299e1" : "#3182ce")
    : (isDark ? "gray" : "#aaa");

  // Check if Map already has a child component
  const hasChild = useMemo(() => {
    const nodes = getNodes();
    return nodes.some(node => node.parentId === id);
  }, [getNodes, id]);

  const availableComponents = useMemo(() => COMPONENTS.filter(c => c.type !== MajorComponents.Map), []);

  const colors = useMemo(() => ({
    cardBg: isDark ? "#2D3748" : "#FFFFFF",
    cardHoverBg: isDark ? "#3D4A5C" : "#F7FAFC",
    borderColor: isDark ? "#4A5568" : "#E2E8F0",
    accentColor: isDark ? "#A78BFA" : "#7C3AED",
    textColor: isDark ? "#E2E8F0" : "#2D3748",
  }), [isDark]);

  const handleComponentSelect = useCallback((componentType: MajorComponents) => {
    const componentNodeId = uuid();

    // Place the component centered inside the Map's body area
    const componentNode = {
      id: componentNodeId,
      type: "MajorComponent",
      position: { x: 10, y: 30 },
      data: {
        type: componentType,
        componentType,
        visible: true,
        connectable: true
      },
      parentId: id,
      extent: "parent" as const,
      expandParent: true,
      style: { height: 55, width: 180 },
    };

    setNodes(nodes => [...nodes, componentNode]);
    onClose();
  }, [id, setNodes, onClose]);

  return (
    <Box
      position="relative"
      height="100px"
      width="200px"
    >
      {/* Header */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="26px"
        bg={headerBg}
        borderTopLeftRadius="10px"
        borderTopRightRadius="10px"
        border={`2px solid ${borderColor}`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={1}
      >
        <Text
          fontSize="11px"
          fontWeight="bold"
          color="white"
          letterSpacing="0.5px"
        >
          Map
        </Text>
      </Box>

      {/* Body */}
      <Box
        position="absolute"
        top="24px"
        left={0}
        right={0}
        bottom={0}
        bg={bodyBg}
        borderBottomLeftRadius="10px"
        borderBottomRightRadius="10px"
        borderBottom={`2px solid ${borderColor}`}
        borderLeft={`2px solid ${borderColor}`}
        borderRight={`2px solid ${borderColor}`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="6px"
        {...(selected && {
          boxShadow: `${borderColor} 0px 0px 4px`
        })}
      >
        {!hasChild && (
          <Box
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="4px"
            border={`1.5px dashed ${dashedBorder}`}
            backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.3)"}
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              borderColor: isDark ? "#A78BFA" : "#7C3AED",
              backgroundColor: isDark ? "rgba(167, 139, 250, 0.1)" : "rgba(124, 58, 237, 0.05)"
            }}
            onClick={onOpen}
          >
            <Box
              bg={isDark ? "rgba(200, 80, 80, 0.8)" : "rgba(255, 100, 100, 0.85)"}
              borderRadius="md"
              width="30px"
              height="30px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              transition="all 0.2s ease"
              _hover={{
                transform: "scale(1.1)",
              }}
            >
              <Text
                color="white"
                fontSize="16px"
                fontWeight="bold"
                lineHeight="1"
                userSelect="none"
              >
                +
              </Text>
            </Box>
          </Box>
        )}
      </Box>

      {/* Value Text */}
      {value && (
        <Text
          fontSize="xx-small"
          position="absolute"
          bottom="-18px"
          left="8px"
          color={isDark ? "white" : "black"}
        >
          {value}
        </Text>
      )}

      {/* Terminals */}
      <Terminal type="source" position={Position.Bottom} id="bottom" />
      <Terminal type="target" position={Position.Top} id="top" />

      {/* Component selection modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg={colors.cardBg}
          color={colors.textColor}
          borderRadius="2xl"
          boxShadow="xl"
          maxW="500px"
        >
          <ModalHeader fontSize="lg" fontWeight="semibold" borderBottom={`1px solid ${colors.borderColor}`} pb={4}>
            Add Component to Map
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            <SimpleGrid columns={3} spacing={3}>
              {availableComponents.map((component) => (
                <Box
                  key={component.type}
                  as="button"
                  bg={colors.cardBg}
                  border={`2px solid ${colors.borderColor}`}
                  borderRadius="lg"
                  p={3}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: colors.accentColor,
                    bg: colors.cardHoverBg,
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${colors.accentColor}25`,
                  }}
                  _active={{ transform: "translateY(0)" }}
                  onClick={() => handleComponentSelect(component.type)}
                >
                  <VStack spacing={2}>
                    <Box w="40px" h="40px" display="flex" alignItems="center" justifyContent="center">
                      {component.icon}
                    </Box>
                    <Text fontWeight="semibold" fontSize="xs" textAlign="center">
                      {component.label}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default memo(Map);
