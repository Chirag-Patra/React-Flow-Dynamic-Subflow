import { Node, useReactFlow } from "@xyflow/react";
import React, { useState } from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import {
  Box,
  Heading,
  Input,
  InputGroup,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { getUnit } from "../utils";
import { DeleteIcon } from "@chakra-ui/icons";

export default function ComponentDetail({
  node,
  onDelete,
}: {
  node: Node<MajorComponentsData>;
  onDelete: () => void;
}) {
  const nodeType = node?.data?.type || node?.type;
  const [value, setValue] = useState(`${node?.data?.value || ""}`);

  const { updateNodeData, deleteElements } = useReactFlow();

  const handleDelete = async () => {
    await deleteElements({ nodes: [node] });
    onDelete();
  };

  return (
    <Box position="relative">
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
    </Box>
  );
}
