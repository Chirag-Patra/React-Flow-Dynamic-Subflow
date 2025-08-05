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
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import React, { useEffect, useState, useRef } from "react";
import { Node, useReactFlow, Edge, MarkerType } from "@xyflow/react";
import { MajorComponentsData } from "../types";

export default function ComponentDetail({
  node,
  onDelete,
}: {
  node: Node<MajorComponentsData>;
  onDelete: () => void;
}) {
  const nodeType = node?.data?.type || node?.type;
  const [value, setValue] = useState(`${node?.data?.value || ""}`);
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [width, setWidth] = useState(300);
  const isDragging = useRef(false);

  const { updateNodeData, deleteElements, getNodes, addEdges, getEdges, setEdges } = useReactFlow();

  const handleDelete = async () => {
    await deleteElements({ nodes: [node] });
    onDelete();
  };

  const handleCheckboxChange = (newSelectedIds: string[]) => {
    const prevSelected = new Set(selectedTargetIds);
    const newSelected = new Set(newSelectedIds);

    const added = newSelectedIds.filter((id) => !prevSelected.has(id));
    const removed = selectedTargetIds.filter((id) => !newSelected.has(id));

    // Add new edges
    const newEdges: Edge[] = added.map((targetId) => ({
      id: `e-${node.id}-${targetId}`,
      source: node.id,
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

    // Remove deselected edges
    if (removed.length) {
      const currentEdges = getEdges();
      const edgesToKeep = currentEdges.filter(
        (e) => !(e.source === node.id && removed.includes(e.target))
      );
      setEdges(edgesToKeep);
    }

    setSelectedTargetIds(newSelectedIds);
  };

  const allNodes = getNodes().filter((n) => n.id !== node.id);

  useEffect(() => {
    const connectedEdges = getEdges().filter((e) => e.source === node.id);
    const initialTargets = connectedEdges.map((e) => e.target);
    setSelectedTargetIds(initialTargets);
  }, [node.id]);

  // --- Resizing Logic ---
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

 return (
  <Box
    position="fixed"
    top="0"
    right="0"
    height="100vh"
    width={`${width}px`}
    bg="white"
    p={4}
    boxShadow="lg"
    zIndex={1000}
    overflow="hidden"  // 👈 disables scroll bar
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
        bg: "gray.700",  // 👈 dark lining on the right edge of the handle
      }}
    />

    <Flex justify="space-between" align="center">
      <Heading fontSize="sm">{nodeType?.toUpperCase()}</Heading>
      <IconButton
        icon={<DeleteIcon />}
        aria-label="Delete node"
        size="xs"
        colorScheme="red"
        variant="ghost"
        onClick={handleDelete}
      />
    </Flex>

    <InputGroup size="sm" mt={5}>
      <Input
        value={value}
        placeholder={`ID: ${node.id}`}
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          updateNodeData(node.id, { value: newValue });
        }}
      />
    </InputGroup>

    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button mt={3} size="sm" variant="outline" width="100%">
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
  </Box>
);

}
