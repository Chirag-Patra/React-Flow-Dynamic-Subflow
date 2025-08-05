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
import React, { useEffect, useState } from "react";
import { Node, useReactFlow, Edge } from "@xyflow/react";
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

  // List of other nodes
  const allNodes = getNodes().filter((n) => n.id !== node.id);

  // On mount: preload connected targetIds (only for source = current node)
  useEffect(() => {
    const connectedEdges = getEdges().filter((e) => e.source === node.id);
    const initialTargets = connectedEdges.map((e) => e.target);
    setSelectedTargetIds(initialTargets);
  }, [node.id, getEdges]);

  return (
    <Box position="relative" width={"200px"}>
      <Flex justify="space-between" align="center">
        <Heading fontSize="xs">{nodeType?.toUpperCase()}</Heading>
        <IconButton
          icon={<DeleteIcon />}
          aria-label="Delete node"
          size="xs"
          colorScheme="red"
          variant="ghost"
          position="absolute"
          top="-5px"
          right="4px"
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

      {/* Multi-select Dropdown with Checkboxes */}
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
