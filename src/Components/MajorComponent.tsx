import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import React from "react";
import {
  MajorComponentsData,
  MajorComponentsState,
  MajorComponents,
} from "../types";
import Board from "./Board";
import { Box, Text } from "@chakra-ui/react";
import { Capacitor, Inductor, Resistor, Js, Aws, Db, Python, Email, } from "../icons";
import { getUnit } from "../utils";
import Terminal from "./Terminal";
import Rotation from "./Rotation";
import { Lock, Plus, Unlock, X } from "react-bootstrap-icons";
import { useDarkMode } from "../store";


type MajorComponentNode = Node<MajorComponentsData, "string">;

export default function MajorComponent({
  data: {
    value,
    type,
    rotation,
    state,
    isAttachedToGroup,
    visible = true,
    connectable,
  },
  selected,
  id,
  parentId,
}: NodeProps<MajorComponentNode>) {
  const unit = getUnit(type as MajorComponents);

  const isAdditionValid = state === MajorComponentsState.Add;
  const isAdditionInvalid = state === MajorComponentsState.NotAdd;

  const { updateNode } = useReactFlow();

  const { isDark } = useDarkMode();

  let color = "black";
  if (isDark) color = "white";

  return (
    <Box
      pos={"relative"}
      style={{
        transform: `rotate(${rotation}deg)`,
        ...(isAdditionValid && { background: "#58ed58" }),
        ...(isAdditionInvalid && { background: "#ff0505" }),
        visibility: visible ? "visible" : "hidden",
      }}
    >
      <Rotation selected={selected} id={id} />
      {parentId && selected && (
        <div
          style={{
            position: "absolute",
            top: -23,
            right: 30,
            color,
          }}
          onClick={() => {
            updateNode(id, (prevNode) => ({
              extent: prevNode.extent === "parent" ? undefined : "parent",
              data: { ...prevNode.data, isAttachedToGroup: !isAttachedToGroup },
            }));
          }}
        >
          {isAttachedToGroup ? <Lock /> : <Unlock />}
        </div>
      )}
      {type === MajorComponents.Resistor && (
        <Resistor height={24} color={color} />
      )}
      {type === MajorComponents.Capacitor && (
        <Capacitor height={34} color={color} />
      )}
      {type === MajorComponents.Js && (
        <Js height={44} color={color} />
      )}
      {type === MajorComponents.Aws && (
        <Aws height={44} color={color} />
      )}
      {type === MajorComponents.Db && (
        <Db height={44} color={color} />
      )}
      {type === MajorComponents.Python && (
        <Python height={44} color={color} />
      )}
      {type === MajorComponents.Email && (
        <Email height={44} color={color} />
      )}
      {type === MajorComponents.Inductor && (
        <Inductor height={24} color={color} />
      )}

      

      <Text fontSize="xx-small" position={"absolute"} color={color}>
        {value} {unit}
      </Text>
      {isAdditionValid && (
        <Plus
          style={{ position: "absolute", top: -17, right: 2 }}
          color={color}
        />
      )}
      {isAdditionInvalid && (
        <X style={{ position: "absolute", top: -17, right: 2 }} color={color} />
      )}
      <Terminal
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={connectable}
      />
      <Terminal
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={connectable}
      />
    </Box>
  );
}
