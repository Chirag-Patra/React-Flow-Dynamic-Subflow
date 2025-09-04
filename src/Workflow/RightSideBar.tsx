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
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Node, useReactFlow, Edge, MarkerType } from "@xyflow/react";
import { useDarkMode } from "../store";
import ProcessingTypeSelect, { ProcessingType } from "../Components/ProcessingTypeSelect";
import ETLConfiguration, { ETLConfig } from "../Components/ETLConfiguration";
import IngestionWizard from "../Components/IngestionWizard";
import { IngestionConfig } from "../Components/IngestionConfiguration";
import { MajorComponentsData, MajorComponents } from "../types";

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
  const [width, setWidth] = useState(300);
  const [isIngestionWizardOpen, setIsIngestionWizardOpen] = useState(false);
  const isDragging = useRef(false);

  // Memoized computed values to ensure stability
  const nodeData = useMemo(() => {
    if (!selectedNode) return null;

    return {
      id: selectedNode.id,
      type: selectedNode.data?.type || selectedNode.type,
      value: selectedNode.data?.value || "",
      processingType: selectedNode.data?.processingType || "",
      etlConfig: selectedNode.data?.etlConfig || {},
      ingestionConfig: selectedNode.data?.ingestionConfig || {}
    };
  }, [selectedNode?.id, selectedNode?.data, selectedNode?.type]);

  // Determine component visibility with proper memoization
  const componentVisibility = useMemo(() => {
    if (!nodeData) return {
      showProcessingType: false,
      showETLConfig: false,
      showIngestionConfig: false
    };

    const isJobType = nodeData.type === "Job";
    const isETLProcessingType = [
      MajorComponents.Run_Lamda,
      MajorComponents.Run_Eks,
      MajorComponents.Run_GlueJob,
      MajorComponents.Run_StepFunction
    ].includes(nodeData.type as MajorComponents);

    const isIngestionType = nodeData.type === MajorComponents.Ingestion;

    return {
      showProcessingType: isJobType,
      showETLConfig: isETLProcessingType,
      showIngestionConfig: isIngestionType
    };
  }, [nodeData?.type]);

  const allNodes = useMemo(() => {
    if (!selectedNode) return [];
    return getNodes().filter((n) => n.id !== selectedNode.id);
  }, [selectedNode?.id, nodes]);

  // Sync local state with selected node
  useEffect(() => {
    if (nodeData) {
      setValue(nodeData.value);
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
      if (newWidth > 240 && newWidth < 600) {
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

  // Event handlers with useCallback to prevent unnecessary re-renders
  const handleProcessingTypeChange = useCallback((processingType: ProcessingType) => {
    if (!selectedNode) return;

    console.log('Processing type changing to:', processingType);
    updateNodeData(selectedNode.id, { processingType });

    if (onProcessingTypeChange && nodeData?.type === "Job") {
      onProcessingTypeChange(selectedNode.id, processingType);
    }
  }, [selectedNode?.id, nodeData?.type, updateNodeData, onProcessingTypeChange]);

  const handleETLConfigChange = useCallback((etlConfig: ETLConfig) => {
    if (!selectedNode) return;

    console.log('ETL Config changing:', etlConfig);

    // Force immediate update with a new object reference
    const updatedData = {
      ...selectedNode.data,
      etlConfig: { ...etlConfig }
    };

    updateNodeData(selectedNode.id, updatedData);

    // Force re-render by ensuring state change
    setTimeout(() => {
      const updatedNode = getNodes().find(n => n.id === selectedNode.id);
      console.log('Node after ETL update:', updatedNode?.data?.etlConfig);
    }, 10);
  }, [selectedNode?.id, selectedNode?.data, updateNodeData, getNodes]);

  const handleIngestionConfigChange = useCallback((ingestionConfig: IngestionConfig) => {
    if (!selectedNode) return;

    console.log('Ingestion Config changing:', ingestionConfig);

    // Force immediate update with a new object reference
    const updatedData = {
      ...selectedNode.data,
      ingestionConfig: { ...ingestionConfig }
    };

    updateNodeData(selectedNode.id, updatedData);

    // Force re-render by ensuring state change
    setTimeout(() => {
      const updatedNode = getNodes().find(n => n.id === selectedNode.id);
      console.log('Node after Ingestion update:', updatedNode?.data?.ingestionConfig);
    }, 10);
  }, [selectedNode?.id, selectedNode?.data, updateNodeData, getNodes]);

  const handleOpenIngestionWizard = useCallback(() => {
    setIsIngestionWizardOpen(true);
  }, []);

  const handleCloseIngestionWizard = useCallback(() => {
    setIsIngestionWizardOpen(false);
  }, []);

  const handleSaveIngestionConfig = useCallback((ingestionConfig: IngestionConfig) => {
    handleIngestionConfigChange(ingestionConfig);
  }, [handleIngestionConfigChange]);

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

  return (
    <Box
      position="fixed"
      right="0"
      height="100vh"
      width={`${width}px`}
      bg="white"
      p={4}
      boxShadow="lg"
      zIndex={1000}
      overflow="auto"
      borderLeft="1px solid #e2e8f0"
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
          right: "0",
          top: "0",
          height: "100%",
          width: "2px",
          bg: "gray.700",
        }}
      />

      <VStack spacing={4} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading fontSize="sm">{nodeData.type?.toUpperCase()}</Heading>
          <IconButton
            icon={<DeleteIcon />}
            aria-label="Delete node"
            size="xs"
            colorScheme="red"
            variant="ghost"
            onClick={handleDelete}
          />
        </Flex>

        {/* Node Value Input */}
        <InputGroup size="sm">
          <Input
            value={value}
            placeholder={`ID: ${nodeData.id}`}
            onChange={(e) => {
              const newValue = e.target.value;
              setValue(newValue);
              updateNodeData(selectedNode.id, { value: newValue });
            }}
          />
        </InputGroup>

        {/* Connections */}
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <Button size="sm" variant="outline" width="100%">
              {selectedTargetIds.length > 0
                ? `Connected to ${selectedTargetIds.length} node(s)`
                : "Connect to node(s)..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent zIndex={10}>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Select connections</PopoverHeader>
            <PopoverBody>
              <CheckboxGroup
                value={selectedTargetIds}
                onChange={(values) => handleCheckboxChange(values as string[])}
              >
                <Stack spacing={2}>
                  {allNodes.map((n) => (
                    <Checkbox key={n.id} value={n.id}>
                      {String(n.data?.type || n.type).toUpperCase()} - {n.id}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* Conditional Components with proper keys and separation */}
        {componentVisibility.showProcessingType && (
          <>
            <Divider />
            <Box key={`processing-${nodeData.id}`}>
              <ProcessingTypeSelect
                value={nodeData.processingType}
                onChange={handleProcessingTypeChange}
              />
            </Box>
          </>
        )}

        {componentVisibility.showETLConfig && (
          <>
            <Divider />
            <Box key={`etl-${nodeData.id}-${JSON.stringify(nodeData.etlConfig)}`}>
              <ETLConfiguration
                value={nodeData.etlConfig}
                onChange={handleETLConfigChange}
              />
            </Box>
          </>
        )}

        {componentVisibility.showIngestionConfig && (
          <>
            <Divider />
            <Box key={`ingestion-${nodeData.id}`}>
              <Button
                colorScheme="blue"
                variant="outline"
                size="sm"
                width="100%"
                onClick={handleOpenIngestionWizard}
              >
                Configure Ingestion
              </Button>
            </Box>
          </>
        )}
      </VStack>

      {/* Ingestion Wizard Modal */}
      <IngestionWizard
        isOpen={isIngestionWizardOpen}
        onClose={handleCloseIngestionWizard}
        onSave={handleSaveIngestionConfig}
        initialConfig={nodeData?.ingestionConfig || {}}
      />
    </Box>
  );
};