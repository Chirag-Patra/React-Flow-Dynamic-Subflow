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
import JobWizard from "../Components/Configuration/Job configuration/JobWizard";
import ETLWizard from "../Components/Configuration/ETLWizard";
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
  const [reusableComponenttype, setReusableComponentType] = useState("");
  const [value, setValue] = useState("");
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [width, setWidth] = useState(300);
  const [isJobWizardOpen, setIsJobWizardOpen] = useState(false);
  const [isETLWizardOpen, setIsETLWizardOpen] = useState(false);
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
      jobConfig: selectedNode.data?.jobConfig || {},
      reusableComponenttype: selectedNode.data?.componentType || "",

    };
  }, [selectedNode?.id, selectedNode?.data, selectedNode?.type]);

  // Determine component visibility with proper memoization
  const componentVisibility = useMemo(() => {
    if (!nodeData) return {
      showJobWizardButton: false,
      showETLWizardButton: false
    };

    const isJobType = nodeData.type === "Job";
    const isETLProcessingType = [
      MajorComponents.Run_Lamda,
      MajorComponents.Run_Eks,
      MajorComponents.Run_GlueJob,
      MajorComponents.Run_StepFunction
    ].includes(nodeData.type as MajorComponents);

    return {
      showJobWizardButton: isJobType,
      showETLWizardButton: isETLProcessingType
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

  // Event handlers
  const handleOpenJobWizard = useCallback(() => {
    setIsJobWizardOpen(true);
  }, []);

  const handleCloseJobWizard = useCallback(() => {
    setIsJobWizardOpen(false);
  }, []);

  const handleOpenETLWizard = useCallback(() => {
    setIsETLWizardOpen(true);
  }, []);

  const handleCloseETLWizard = useCallback(() => {
    setIsETLWizardOpen(false);
  }, []);

  const handleSaveJobConfig = useCallback((config: any) => {
    if (!selectedNode) return;

    console.log('Job Config:', config);

    // Update node data with job configuration
    const updatedData = {
      ...selectedNode.data,
      processingType: config.processingType,
      jobConfig: { ...config }
    };

    updateNodeData(selectedNode.id, updatedData);

    // Call the onProcessingTypeChange callback to handle node creation/removal
    if (config.processingType && onProcessingTypeChange) {
      onProcessingTypeChange(selectedNode.id, config.processingType);
    }

    handleCloseJobWizard();
  }, [selectedNode?.id, selectedNode?.data, updateNodeData, onProcessingTypeChange, handleCloseJobWizard]);

  const handleSaveETLConfig = useCallback((config: any) => {
    if (!selectedNode) return;

    console.log('ETL Config:', config);

    // Update node data with ETL configuration
    const updatedData = {
      ...selectedNode.data,
      etlConfig: { ...config }
    };

    updateNodeData(selectedNode.id, updatedData);
    handleCloseETLWizard();
  }, [selectedNode?.id, selectedNode?.data, updateNodeData, handleCloseETLWizard]);

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

  // Get button text based on node type and configuration state
  const getJobWizardButtonText = () => {
    const config = nodeData.jobConfig;
    if (config && config.processingType) {
      return `Processing Type: ${config.processingType}`;
    }
    return "Configure Job";
  };

  const getETLWizardButtonText = () => {
    const config = nodeData.etlConfig;
    if (config && config.etl_stp_job_nm) {
      const componentType = config?.componentType || '';
      return `ETL : ${componentType} - ${config.etl_stp_job_nm}`;
    }
    if (config && config.componentType) {
      return `ETL : ${config.componentType}`;
    }
    return "Configure ETL";
  };

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
            placeholder={`Enter ${nodeData.type} name/value`}
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

        {/* Job Wizard Button for Job nodes */}
        {componentVisibility.showJobWizardButton && (
          <>
            <Divider />
            <Box key={`job-wizard-${nodeData.id}`}>
              <Button
                colorScheme="blue"
                variant={nodeData.processingType ? "solid" : "outline"}
                size="sm"
                width="100%"
                onClick={handleOpenJobWizard}
              >
                {getJobWizardButtonText()}
              </Button>
            </Box>
          </>
        )}

        {/* ETL Wizard Button for ETL processing nodes */}
        {componentVisibility.showETLWizardButton && (
          <>
            <Divider />
            <Box key={`etl-wizard-${nodeData.id}`}>
              <Button
                colorScheme="green"
                variant={nodeData.etlConfig?.etl_stp_job_nm ? "solid" : "outline"}
                size="sm"
                width="100%"
                onClick={handleOpenETLWizard}
              >
                {getETLWizardButtonText()}
              </Button>
              {/* Show reusable component info if configured */}
              {nodeData.reusableComponent && nodeData.componentType && (
                setReusableComponentType(nodeData.componentType),
                <Box mt={1} fontSize="xs" color="gray.600" textAlign="center">
                  Reusable: {nodeData.componentType}
                </Box>
              )}
            </Box>
          </>
        )}
      </VStack>

      {/* Job Wizard Modal for Job nodes */}
      <JobWizard
        isOpen={isJobWizardOpen}
        onClose={handleCloseJobWizard}
        onSave={handleSaveJobConfig}
        initialConfig={nodeData?.jobConfig || {
          processingType: nodeData?.processingType
        }}
      />

      {/* ETL Wizard Modal for ETL processing nodes */}
      <ETLWizard
        isOpen={isETLWizardOpen}
        onClose={handleCloseETLWizard}
        onSave={handleSaveETLConfig}
        initialConfig={nodeData?.etlConfig || {}}
      />

    </Box>
  );
};