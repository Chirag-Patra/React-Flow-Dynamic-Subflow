import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import React from "react";
import { MajorComponentsData, MajorComponents } from "../types";
import { Box, Text } from "@chakra-ui/react";
import { default as BatteryIcon } from "../icons/Battery";
import { getUnit } from "../utils";
import Terminal from "./Terminal";
import { useDarkMode } from "../store";

type BatteryNode = Node<MajorComponentsData, "string">;

export default function Battery({
  type,
  data: { value },
}: NodeProps<BatteryNode>) {
  const unit = getUnit(type as MajorComponents);

  return (
    <Box>
      <BatteryIcon height={48} />
      <Text
        fontSize="xx-small"
        position={"absolute"}
        top={"22px"}
        left="14px"
        color="white"
      >
        {value} {unit}
      </Text>
      <Terminal
        style={{ left: 39, top: 2 }}
        type="target"
        position={Position.Top}
        id="right"
      />
      <Terminal
        style={{ left: 9, top: 2 }}
        type="source"
        position={Position.Top}
        id="left"
      />
    </Box>
  );
}
