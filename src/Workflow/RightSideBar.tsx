// RightSidebar.tsx - Compact version with color-aligned JSON
import {
  Box,
  Heading,
  IconButton,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  Checkbox,
  CheckboxGroup,
  Stack,
  VStack,
  Divider,
  Badge,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Tooltip,
  HStack,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, ViewIcon, CopyIcon } from "@chakra-ui/icons";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Node, useReactFlow, Edge, MarkerType } from "@xyflow/react";
import { useDarkMode } from "../store";
import UniversalWizard from "../Components/Configuration/Universal/UniversalWizard";
import MapFormWizard from "../Components/Configuration/MapFormWizard";
import { getConfigKeyForComponent, isConfigurableComponent } from "../Components/Configuration/Universal/configKeyMapper";
import { MajorComponentsData, MajorComponents, ComponentConfig, MapStepConfig } from "../types";

interface RightSidebarProps {
  selectedNode: Node<MajorComponentsData> | undefined;
  onDelete: () => void;
  onProcessingTypeChange: (boardId: string, processingType: string) => void;
  nodes: Node[];
  showContent: boolean;
}

export const RightSidebar = ({
  selectedNode,
  onDelete,
  onProcessingTypeChange,
  nodes,
  showContent,
}: RightSidebarProps) => {
  const { isDark } = useDarkMode();
  const {
    updateNodeData,
    deleteElements,
    getNodes,
    addEdges,
    getEdges,
    setEdges,
  } = useReactFlow();

  // State management
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentWizardType, setCurrentWizardType] = useState<string | null>(null);
  const [isMapWizardOpen, setIsMapWizardOpen] = useState(false);

  // Fixed compact width
  const width = 320;

  // Memoized computed values
  const nodeData = useMemo(() => {
    if (!selectedNode) return null;

    return {
      id: selectedNode.id,
      type: selectedNode.data?.type || selectedNode.type,
      value: selectedNode.data?.value || "",
      processingType: selectedNode.data?.processingType || "",
      etlConfig: (selectedNode.data?.etlConfig || {}) as ComponentConfig,
      jobConfig: (selectedNode.data?.jobConfig || {}) as ComponentConfig,
      componentType: selectedNode.data?.componentType || "",
      config: (selectedNode.data?.config || {}) as ComponentConfig,
    };
  }, [selectedNode]);

  // Get config key for the component type
  const configKey = useMemo(() => {
    if (!nodeData?.type) return null;
    return getConfigKeyForComponent(nodeData.type as string);
  }, [nodeData?.type]);

  // Determine if wizard button should be shown
  const shouldShowWizardButton = useMemo(() => {
    return isConfigurableComponent(nodeData?.type as string);
  }, [nodeData?.type]);

  const allNodes = useMemo(() => {
    if (!selectedNode) return [];
    return getNodes().filter((n) => n.id !== selectedNode.id);
  }, [selectedNode, nodes, getNodes]);

  // Get the current configuration
  const currentConfig = useMemo(() => {
    if (!nodeData) return null;

    const isJobNode = nodeData.type === 'Job';
    const isMapNode = nodeData.type === 'Map';

    if (isJobNode && nodeData.jobConfig && Object.keys(nodeData.jobConfig).length > 0) {
      return nodeData.jobConfig;
    } else if (isMapNode && nodeData.config?.mapSteps && nodeData.config.mapSteps.length > 0) {
      return { mapSteps: nodeData.config.mapSteps };
    } else if (nodeData.etlConfig && Object.keys(nodeData.etlConfig).length > 0) {
      return nodeData.etlConfig;
    } else if (nodeData.config && Object.keys(nodeData.config).length > 0) {
      return nodeData.config;
    }

    return null;
  }, [nodeData]);

  // Format JSON with syntax highlighting using React nodes
  const formatJSON = useCallback((obj: any) => {
    const colorize = (value: any, key?: string): string => {
      if (value === null || value === undefined) {
        return 'null';
      }
      if (typeof value === 'string') {
        return `"${value}"`;
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
      return JSON.stringify(value);
    };

    const lines: string[] = [];
    const processObject = (obj: any, indent: number = 0) => {
      const spaces = '  '.repeat(indent);

      if (Array.isArray(obj)) {
        lines.push(spaces + '[');
        obj.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            processObject(item, indent + 1);
          } else {
            lines.push(spaces + '  ' + colorize(item) + (index < obj.length - 1 ? ',' : ''));
          }
        });
        lines.push(spaces + ']' + (indent > 0 ? ',' : ''));
      } else if (typeof obj === 'object' && obj !== null) {
        lines.push(spaces + '{');
        const entries = Object.entries(obj);
        entries.forEach(([key, value], index) => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            lines.push(spaces + '  "' + key + '": {');
            processObject(value, indent + 2);
            lines.push(spaces + '  }' + (index < entries.length - 1 ? ',' : ''));
          } else if (Array.isArray(value)) {
            lines.push(spaces + '  "' + key + '": [');
            value.forEach((item, idx) => {
              if (typeof item === 'object' && item !== null) {
                processObject(item, indent + 2);
              } else {
                lines.push(spaces + '    ' + colorize(item) + (idx < value.length - 1 ? ',' : ''));
              }
            });
            lines.push(spaces + '  ]' + (index < entries.length - 1 ? ',' : ''));
          } else {
            lines.push(spaces + '  "' + key + '": ' + colorize(value, key) + (index < entries.length - 1 ? ',' : ''));
          }
        });
        lines.push(spaces + '}');
      }
    };

    processObject(obj);
    return lines.join('\n');
  }, []);

  // Sync connections
  useEffect(() => {
    if (!selectedNode) {
      setSelectedTargetIds([]);
      return;
    }

    const connectedEdges = getEdges().filter((e) => e.source === selectedNode.id);
    const initialTargets = connectedEdges.map((e) => e.target);
    setSelectedTargetIds(initialTargets);
  }, [selectedNode?.id, getEdges]);

  // Event handlers
  const handleOpenWizard = useCallback(() => {
    if (nodeData?.type) {
      setCurrentWizardType(nodeData.type as string);
      setIsWizardOpen(true);
    }
  }, [nodeData?.type]);

  const handleCloseWizard = useCallback(() => {
    setIsWizardOpen(false);
    setCurrentWizardType(null);
  }, []);

  const handleOpenMapWizard = useCallback(() => {
    setIsMapWizardOpen(true);
  }, []);

  const handleCloseMapWizard = useCallback(() => {
    setIsMapWizardOpen(false);
  }, []);

  const handleSaveMapSteps = useCallback((steps: MapStepConfig[]) => {
    if (!selectedNode) return;

    const updatedData = {
      ...selectedNode.data,
      config: {
        ...selectedNode.data?.config,
        mapSteps: steps
      }
    };

    updateNodeData(selectedNode.id, updatedData);
    handleCloseMapWizard();
  }, [selectedNode, updateNodeData, handleCloseMapWizard]);

  const handleSaveConfig = useCallback((config: any) => {
    if (!selectedNode) return;

    const configKey = nodeData?.type === 'Job' ? 'jobConfig' :
                      nodeData?.type === 'lamda' ? 'etlConfig' :
                      nodeData?.type === 'ETLO' || nodeData?.type === 'etlo' ? 'etlConfig' :
                      'etlConfig';

    const updatedData = {
      ...selectedNode.data,
      [configKey]: { ...config },
      config: { ...config },
      processingType: config.processingType || selectedNode.data?.processingType,
      componentType: config.componentType || selectedNode.data?.componentType,
    };

    updateNodeData(selectedNode.id, updatedData);

    if (nodeData?.type === 'Job' && config.processingType && onProcessingTypeChange) {
      onProcessingTypeChange(selectedNode.id, config.processingType);
    }

    handleCloseWizard();
  }, [selectedNode?.id, selectedNode?.data, nodeData?.type, updateNodeData, onProcessingTypeChange, handleCloseWizard]);

  const handleDelete = useCallback(async () => {
    if (!selectedNode) return;
    await deleteElements({ nodes: [selectedNode] });
    onDelete();
  }, [selectedNode, deleteElements, onDelete]);

  const handleCheckboxChange = useCallback((newSelectedIds: string[]) => {
    if (!selectedNode) return;

    const prevSelected = new Set(selectedTargetIds);
    const newSelected = new Set(newSelectedIds);

    const added = newSelectedIds.filter((id) => !prevSelected.has(id));
    const removed = selectedTargetIds.filter((id) => !newSelected.has(id));

    const newEdges: Edge[] = added.map((targetId) => ({
      id: `e-${selectedNode.id}-${targetId}`,
      source: selectedNode.id,
      target: targetId,
      type: "customEdge",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#11b3cfff",
      },
    }));

    if (newEdges.length) {
      addEdges(newEdges);
    }

    if (removed.length) {
      const currentEdges = getEdges();
      const edgesToKeep = currentEdges.filter(
        (e) => !(e.source === selectedNode.id && removed.includes(e.target))
      );
      setEdges(edgesToKeep);
    }

    setSelectedTargetIds(newSelectedIds);
  }, [selectedNode?.id, selectedTargetIds, addEdges, getEdges, setEdges]);

  const handleCopyId = useCallback(() => {
    if (nodeData?.id) {
      navigator.clipboard.writeText(nodeData.id);
    }
  }, [nodeData?.id]);

  // Early return if no node is selected
  if (!selectedNode || !nodeData) {
    return null;
  }

  // Get button text and color based on configuration state
  const getWizardButtonConfig = () => {
    const isJobNode = nodeData.type === 'Job';
    const isMapNode = nodeData.type === 'Map';
    const config: ComponentConfig = isJobNode ? nodeData.jobConfig : nodeData.etlConfig;

    let buttonText = 'Configure';
    let colorScheme = 'blue';
    let isConfigured = false;

    if (isJobNode) {
      if (config?.processingType) {
        buttonText = 'Configured';
        isConfigured = true;
      } else {
        buttonText = 'Configure Job';
      }
      colorScheme = 'blue';
    } else if (isMapNode) {
      const mapSteps = nodeData.config?.mapSteps;
      if (mapSteps && mapSteps.length > 0) {
        buttonText = `${mapSteps.length} Step${mapSteps.length > 1 ? 's' : ''}`;
        isConfigured = true;
      } else {
        buttonText = 'Configure Map';
      }
      colorScheme = 'purple';
    } else {
      if (config?.etl_stp_job_nm || config?.componentType) {
        buttonText = 'Configured';
        isConfigured = true;
      } else {
        buttonText = 'Configure';
      }
      colorScheme = 'green';
    }

    return { buttonText, colorScheme, isConfigured };
  };

  const wizardButtonConfig = getWizardButtonConfig();

  return (
    <Box
      position="fixed"
      right="0"
      top="60.5px"
      height="calc(100vh - 50px)"
      width={`${width}px`}
      bg="#2D3748"
      color="whiteAlpha.900"
      boxShadow="lg"
      zIndex={1000}
      borderLeft="1px solid"
      borderColor="gray.600"
      display="flex"
      flexDirection="column"
    >
      {/* Header - Fixed */}
      <Box
        p={3}
        borderBottom="1px solid"
        borderColor="gray.600"
      >
        <Flex justify="space-between" align="center" mb={2}>
          <Heading fontSize="md" fontWeight="bold" color="white">
            {nodeData.type?.toUpperCase()}
          </Heading>
          <Tooltip label="Delete node" placement="left">
            <IconButton
              icon={<DeleteIcon />}
              aria-label="Delete node"
              size="xs"
              colorScheme="red"
              variant="ghost"
              onClick={handleDelete}
              _hover={{ bg: "whiteAlpha.200" }}
            />
          </Tooltip>
        </Flex>

        {/* Node ID - Properly Aligned */}
        <Flex
          align="center"
          justify="space-between"
          bg="gray.700"
          px={2}
          py={1.5}
          borderRadius="md"
          border="1px solid"
          borderColor="gray.600"
        >
          <HStack spacing={2} flex="1" overflow="hidden">
            <Text fontSize="xx-small" color="whiteAlpha.600" fontWeight="medium" flexShrink={0}>
              ID:
            </Text>
            <Text
              fontSize="xx-small"
              color="whiteAlpha.800"
              fontFamily="monospace"
              isTruncated
              title={nodeData.id}
            >
              {nodeData.id}
            </Text>
          </HStack>
          <Tooltip label="Copy ID" placement="left">
            <IconButton
              icon={<CopyIcon />}
              aria-label="Copy ID"
              size="xs"
              variant="ghost"
              onClick={handleCopyId}
              minW="auto"
              h="auto"
              p={1}
              _hover={{ bg: "whiteAlpha.200" }}
            />
          </Tooltip>
        </Flex>
      </Box>

      {/* Scrollable Content */}
      <Box
        flex="1"
        overflowY="auto"
        overflowX="hidden"
        px={3}
        py={3}
        sx={{
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "gray.600",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "gray.500",
          },
        }}
      >
        <VStack spacing={3} align="stretch">
          {/* Connections */}
          <Box>
            <Text fontSize="xs" mb={1} color="whiteAlpha.700" fontWeight="medium">
              Connections
            </Text>
            <Popover placement="left-start">
              <PopoverTrigger>
                <Button
                  size="sm"
                  variant="outline"
                  width="100%"
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  fontSize="xs"
                  _hover={{ bg: "gray.600" }}
                  _active={{ bg: "gray.500" }}
                >
                  {selectedTargetIds.length > 0
                    ? `${selectedTargetIds.length} Connected`
                    : "No Connections"}
                </Button>
              </PopoverTrigger>
              <PopoverContent zIndex={10} bg="gray.700" borderColor="gray.600" width="250px">
                <PopoverArrow bg="gray.700" />
                <PopoverCloseButton color="whiteAlpha.900" />
                <PopoverHeader color="white" borderColor="gray.600" fontSize="sm">
                  Select Connections
                </PopoverHeader>
                <PopoverBody maxH="300px" overflowY="auto">
                  <CheckboxGroup
                    value={selectedTargetIds}
                    onChange={(values) => handleCheckboxChange(values as string[])}
                  >
                    <Stack spacing={2}>
                      {allNodes.map((n) => (
                        <Checkbox
                          key={n.id}
                          value={n.id}
                          colorScheme="blue"
                          size="sm"
                          sx={{
                            "& .chakra-checkbox__control": {
                              bg: "gray.600",
                              borderColor: "gray.500",
                            },
                            "& .chakra-checkbox__label": {
                              color: "white",
                              fontSize: "xs",
                            },
                          }}
                        >
                          {String(n.data?.type || n.type)}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>

          <Divider borderColor="gray.600" />

          {/* Configuration Section */}
          <Box>
            <Text fontSize="xs" mb={2} color="whiteAlpha.700" fontWeight="medium">
              Configuration
            </Text>

            {nodeData.type === 'Map' ? (
              <Button
                leftIcon={wizardButtonConfig.isConfigured ? <ViewIcon /> : <EditIcon />}
                colorScheme={wizardButtonConfig.colorScheme}
                variant={wizardButtonConfig.isConfigured ? "solid" : "outline"}
                size="sm"
                width="100%"
                onClick={handleOpenMapWizard}
                fontSize="xs"
              >
                {wizardButtonConfig.buttonText}
              </Button>
            ) : shouldShowWizardButton && configKey ? (
              <Button
                leftIcon={wizardButtonConfig.isConfigured ? <ViewIcon /> : <EditIcon />}
                colorScheme={wizardButtonConfig.colorScheme}
                variant={wizardButtonConfig.isConfigured ? "solid" : "outline"}
                size="sm"
                width="100%"
                onClick={handleOpenWizard}
                fontSize="xs"
              >
                {wizardButtonConfig.buttonText}
              </Button>
            ) : (
              <Text fontSize="xs" color="whiteAlpha.600" textAlign="center">
                No configuration available
              </Text>
            )}
          </Box>

          {/* Configuration Preview */}
          {currentConfig && (
            <Box>
              <Divider borderColor="gray.600" mb={2} />
              <Accordion allowToggle defaultIndex={[0]}>
                <AccordionItem border="none">
                  <AccordionButton
                    bg="gray.700"
                    _hover={{ bg: "gray.600" }}
                    borderRadius="md"
                    px={3}
                    py={2}
                  >
                    <Box flex="1" textAlign="left">
                      <Flex align="center" gap={2}>
                        <Badge colorScheme="green" fontSize="xx-small">
                          Configured
                        </Badge>
                        <Text fontSize="xs" color="whiteAlpha.700">
                          View Details
                        </Text>
                      </Flex>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel
                    pb={2}
                    px={0}
                    pt={2}
                    maxH="400px"
                    overflowY="auto"
                    sx={{
                      "&::-webkit-scrollbar": {
                        width: "4px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "gray.600",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    <Box
                      bg="gray.800"
                      p={2}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.600"
                    >
                      <Code
                        display="block"
                        whiteSpace="pre"
                        fontSize="xs"
                        bg="transparent"
                        color="whiteAlpha.800"
                        p={0}
                        overflowX="auto"
                        sx={{
                          "& .chakra-code": {
                            bg: "transparent",
                          }
                        }}
                      >
                        {formatJSON(currentConfig)}
                      </Code>
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          )}

          {/* Component Type Info */}
          {nodeData.componentType && (
            <Box
              bg="gray.700"
              p={2}
              borderRadius="md"
              border="1px solid"
              borderColor="gray.600"
            >
              <Text fontSize="xx-small" color="whiteAlpha.600" fontWeight="medium">
                Component Type
              </Text>
              <Text fontSize="xs" color="white" mt={1}>
                {nodeData.componentType}
              </Text>
            </Box>
          )}

          {/* Processing Type Info */}
          {nodeData.processingType && (
            <Box
              bg="purple.900"
              p={2}
              borderRadius="md"
              border="1px solid"
              borderColor="purple.700"
            >
              <Text fontSize="xx-small" color="purple.200" fontWeight="medium">
                Processing Type
              </Text>
              <Text fontSize="xs" color="white" mt={1}>
                {nodeData.processingType.replace('_', ' ').toUpperCase()}
              </Text>
            </Box>
          )}
        </VStack>
      </Box>

      {/* Universal Wizard Modal */}
      {configKey && (
        <UniversalWizard
          isOpen={isWizardOpen}
          onClose={handleCloseWizard}
          onSave={handleSaveConfig}
          initialConfig={
            nodeData.type === 'Job' ? nodeData.jobConfig :
            nodeData.type === "lamda" ? nodeData.etlConfig :
            nodeData.type === "ETLO" || nodeData.type === "etlo" ? nodeData.etlConfig :
            {}
          }
          configKey={configKey}
        />
      )}

      {/* Map Wizard Modal */}
      <MapFormWizard
        isOpen={isMapWizardOpen}
        onClose={handleCloseMapWizard}
        onSave={handleSaveMapSteps}
        initialSteps={nodeData.config?.mapSteps || []}
      />
    </Box>
  );
};