// RightSidebar.tsx - Updated version
import {
  Box,
  Heading,
  Input,
  InputGroup,
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
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Node, useReactFlow, Edge, MarkerType } from "@xyflow/react";
import { useDarkMode } from "../store";
import UniversalWizard from "../Components/Configuration/Universal/UniversalWizard";
import MapFormWizard from "../Components/Configuration/MapFormWizard";
import { getSchemaForComponent } from "../Components/Configuration/Universal/schemas";
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
  const [value, setValue] = useState("");
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [width, setWidth] = useState(318);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentWizardType, setCurrentWizardType] = useState<string | null>(null);
  const [isMapWizardOpen, setIsMapWizardOpen] = useState(false);
  const isDragging = useRef(false);

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
      config: (selectedNode.data?.config || {}) as ComponentConfig, // Universal config storage
    };
  }, [selectedNode?.id, selectedNode?.data, selectedNode?.type]);

  // Determine which wizard schema to use
  const wizardSchema = useMemo(() => {
    if (!nodeData?.type) return null;
    return getSchemaForComponent(nodeData.type as string);
  }, [nodeData?.type]);

  // Determine if wizard button should be shown
  const shouldShowWizardButton = useMemo(() => {
    return wizardSchema !== null;
  }, [wizardSchema]);

  const allNodes = useMemo(() => {
    if (!selectedNode) return [];
    return getNodes().filter((n) => n.id !== selectedNode.id);
  }, [selectedNode?.id, nodes]);

  // Sync local state with selected node
  useEffect(() => {
    if (nodeData) {
      setValue(typeof nodeData.value === 'number' ? String(nodeData.value) : nodeData.value);
    } else {
      setValue("");
    }
  }, [nodeData?.id, nodeData?.value]);

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

  // Mouse event handlers for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 317 && newWidth < 600) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

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

    console.log('Saved Map Steps:', steps);

    // Update node data with map steps
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

    console.log('Saved Config:', config);

    // Determine which config key to use based on node type
  const configKey = nodeData?.type === 'Job' ? 'jobConfig' : nodeData?.type === 'lamda' ? 'etlConfig' : 'etlConfig';

    // Update node data with configuration
    const updatedData = {
      ...selectedNode.data,
      [configKey]: { ...config },
      config: { ...config }, // Also store in universal config
      processingType: config.processingType || selectedNode.data?.processingType,
      componentType: config.componentType || selectedNode.data?.componentType,
    };

    updateNodeData(selectedNode.id, updatedData);

    // Call the onProcessingTypeChange callback for Job nodes
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
    let configSummary = '';

    if (isJobNode) {
      if (config?.processingType) {
        buttonText = `Processing Type: ${config.processingType}`;
        isConfigured = true;
        configSummary = config.processingType;
      } else {
        buttonText = 'Configure Job';
      }
      colorScheme = 'blue';
    } else if (isMapNode) {
      // Map nodes - check for map steps
      const mapSteps = nodeData.config?.mapSteps;
      if (mapSteps && mapSteps.length > 0) {
        buttonText = `${mapSteps.length} ETL Step${mapSteps.length > 1 ? 's' : ''}`;
        isConfigured = true;
        configSummary = `${mapSteps.length} steps`;
      } else {
        buttonText = 'Configure Map Steps';
      }
      colorScheme = 'purple';
    } else {
      // Other ETL nodes
      if (config?.etl_stp_job_nm) {
        const componentType = config?.componentType || nodeData.type;
        buttonText = `${componentType}: ${config.etl_stp_job_nm}`;
        isConfigured = true;
        configSummary = config.etl_stp_job_nm;
      } else if (config?.componentType) {
        buttonText = `Configure ${config.componentType}`;
        isConfigured = true;
        configSummary = config.componentType;
      } else {
        buttonText = `Configure ${nodeData.type}`;
      }
      colorScheme = 'green';
    }

    return { buttonText, colorScheme, isConfigured, configSummary };
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
      p={4}
      boxShadow="lg"
      zIndex={1000}
      overflowY="auto"
      overflowX="hidden"
      borderLeft="1px solid"
      borderColor="gray.600"
      sx={{
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "gray.600",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "gray.500",
        },
      }}
    >
      {/* Resizable Handle */}
      <Box
        position="absolute"
        left="-5px"
        top="0"
        height="100%"
        width="8px"
        cursor="col-resize"
        onMouseDown={() => {
          isDragging.current = true;
        }}
        zIndex={1001}
        _after={{
          content: '""',
          position: "absolute",
          left: "0",
          top: "0",
          height: "100%",
          width: "2px",
          bg: "gray.600",
        }}
      />

      <VStack spacing={4} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading fontSize="sm" fontWeight="semibold" color="white">
            {nodeData.type?.toUpperCase()}
          </Heading>
          <IconButton
            icon={<DeleteIcon />}
            aria-label="Delete node"
            size="xs"
            colorScheme="red"
            variant="ghost"
            onClick={handleDelete}
            color="whiteAlpha.900"
            _hover={{ bg: "whiteAlpha.200" }}
          />
        </Flex>

        {/* Node Value Input */}
        <InputGroup size="sm">
          <Input
            value={value}
            placeholder={`Enter ${nodeData.type} name/value`}
            onChange={(e) => {
              const newValue = e.target.value;
              setValue(newValue);
              updateNodeData(selectedNode.id, { value: newValue });
            }}
            bg="gray.700"
            border="1px solid"
            borderColor="gray.600"
            color="white"
            _placeholder={{ color: "whiteAlpha.500" }}
            _hover={{ borderColor: "gray.500" }}
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
          />
        </InputGroup>

        {/* Connections */}
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <Button
              size="sm"
              variant="outline"
              width="100%"
              bg="gray.700"
              color="white"
              borderColor="gray.600"
              _hover={{ bg: "gray.600" }}
              _active={{ bg: "gray.500" }}
            >
              {selectedTargetIds.length > 0
                ? `Connected to ${selectedTargetIds.length} node(s)`
                : "Connect to node(s)..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent zIndex={10} bg="gray.700" borderColor="gray.600">
            <PopoverArrow bg="gray.700" />
            <PopoverCloseButton color="whiteAlpha.900" />
            <PopoverHeader color="white" borderColor="gray.600">
              Select connections
            </PopoverHeader>
            <PopoverBody>
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
                      sx={{
                        "& .chakra-checkbox__control": {
                          bg: "gray.600",
                          borderColor: "gray.500",
                        },
                        "& .chakra-checkbox__label": {
                          color: "white",
                        },
                      }}
                    >
                      {String(n.data?.type || n.type).toUpperCase()} - {n.id}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* Configuration Section */}
        <Divider borderColor="gray.700" />
        <Box>
          {nodeData.type === 'Map' ? (
            // Map Configuration Button
            <Button
              colorScheme={wizardButtonConfig.colorScheme}
              variant={wizardButtonConfig.isConfigured ? "solid" : "outline"}
              size="sm"
              width="100%"
              onClick={handleOpenMapWizard}
              bg={wizardButtonConfig.isConfigured ? `${wizardButtonConfig.colorScheme}.500` : "transparent"}
              color="white"
              borderColor={`${wizardButtonConfig.colorScheme}.400`}
              _hover={{
                bg: wizardButtonConfig.isConfigured
                  ? `${wizardButtonConfig.colorScheme}.600`
                  : "whiteAlpha.100"
              }}
            >
              {wizardButtonConfig.buttonText}
            </Button>
          ) : shouldShowWizardButton && wizardSchema ? (
            // Universal Configuration Button for other components
            <Button
              colorScheme={wizardButtonConfig.colorScheme}
              variant={wizardButtonConfig.isConfigured ? "solid" : "outline"}
              size="sm"
              width="100%"
              onClick={handleOpenWizard}
              bg={wizardButtonConfig.isConfigured ? `${wizardButtonConfig.colorScheme}.500` : "transparent"}
              color="white"
              borderColor={`${wizardButtonConfig.colorScheme}.400`}
              _hover={{
                bg: wizardButtonConfig.isConfigured
                  ? `${wizardButtonConfig.colorScheme}.600`
                  : "whiteAlpha.100"
              }}
            >
              {wizardButtonConfig.buttonText}
            </Button>
          ) : null}

          {/* Configuration Status Badge */}
          {wizardButtonConfig.isConfigured && (
            <Flex mt={2} align="center" justify="center">
              <Badge colorScheme="green" fontSize="xs">
                Configured
              </Badge>
            </Flex>
          )}

          {/* Component Type Info */}
          {nodeData.componentType && (
            <Text mt={1} fontSize="xs" color="whiteAlpha.600" textAlign="center">
              Type: {nodeData.componentType}
            </Text>
          )}
        </Box>
      </VStack>

      {/* Universal Wizard Modal */}
      {wizardSchema && (
        <UniversalWizard
          isOpen={isWizardOpen}
          onClose={handleCloseWizard}
          onSave={handleSaveConfig}
          initialConfig={nodeData.type === 'Job' ? nodeData.jobConfig : nodeData.type=== "lamda" ? nodeData.etlConfig : {}}
          schema={wizardSchema}
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