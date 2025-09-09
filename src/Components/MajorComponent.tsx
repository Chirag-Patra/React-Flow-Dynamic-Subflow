import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import React from "react";
import {
  MajorComponentsData,
  MajorComponentsState,
  MajorComponents,
} from "../types";
import Board from "./Board";
import { Box, Text, HStack } from "@chakra-ui/react";
import {  Js, Aws, Db, Python, Email, Lamda, GlueJob, Eks, Stepfunction,Ingestion } from "../icons";
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

  // Check if this is an ingestion component
  const isIngestionComponent = type === MajorComponents.Ingestion;

  // Map component types to their labels
  const getComponentLabel = (type: MajorComponents) => {
    const labelMap = {
      [MajorComponents.Js]: 'JavaScript',
      [MajorComponents.Aws]: 'AWS',
      [MajorComponents.Execute_Py]: 'Execute Py',
      [MajorComponents.Db]: 'Database',
      [MajorComponents.Email_notification]: 'Email Notification',
      [MajorComponents.Run_Lamda]: 'Run Lambda',
      [MajorComponents.Run_GlueJob]: 'Run Glue Job',
      [MajorComponents.Run_Eks]: 'Run EKS',
      [MajorComponents.Run_StepFunction]: 'Run Step Function',
      [MajorComponents.Ingestion]: 'Ingestion',

    };
    return labelMap[type] || 'Component';
  };

  // Function to render the icon based on type
  const renderIcon = () => {
    const iconProps = { height: 30, color };

    switch(type) {

      case MajorComponents.Execute_Py:
        return <Python {...iconProps} />;
      case MajorComponents.Email_notification:
        return <Email {...iconProps} />;
      case MajorComponents.Run_Lamda:
        return <Lamda {...iconProps} />;
      case MajorComponents.Run_GlueJob:
        return <GlueJob {...iconProps} />;
      case MajorComponents.Run_Eks:
        return <Eks {...iconProps} />;
      case MajorComponents.Run_StepFunction:
        return <Stepfunction {...iconProps} />;
      case MajorComponents.Ingestion:
        return <Ingestion {...iconProps} />;

      default:
        return null;
    }
  };

  return (
    <Box
      pos="relative"
      style={{
        transform: `rotate(${rotation}deg)`,
        visibility: visible ? "visible" : "hidden",
      }}
    >
      <Rotation selected={selected} id={id} />

      {/* Lock/Unlock button - hidden for Ingestion components */}
      {parentId && selected && !isIngestionComponent && (
        <Box
          position="absolute"
          top="-23px"
          right="30px"
          color={color}
          cursor="pointer"
          onClick={() => {
            updateNode(id, (prevNode) => ({
              extent: prevNode.extent === "parent" ? undefined : "parent",
              data: { ...prevNode.data, isAttachedToGroup: !isAttachedToGroup },
            }));
          }}
        >
          {isAttachedToGroup ? <Lock /> : <Unlock />}
        </Box>
      )}

      {/* Addition state indicators */}
      {isAdditionValid && (
        <Plus
          style={{ position: "absolute", top: -17, right: 2, zIndex: 10 }}
          color={color}
        />
      )}
      {isAdditionInvalid && (
        <X style={{ position: "absolute", top: -17, right: 2, zIndex: 10 }} color={color} />
      )}

      {/* Main component container */}
      <HStack
        spacing={2}
        p={2}
        bg={
          isAdditionValid ? "#58ed58" :
          isAdditionInvalid ? "#ff0505" :
          selected ? (isDark ? "gray.700" : "gray.200") :
          (isDark ? "gray.800" : "gray.100")
        }
        borderRadius="sm"
        border={selected ? "2px solid" : "1px solid"}
        borderColor={
          selected ? "blue.500" :
          isDark ? "gray.600" : "gray.300"
        }
        minW="140px"
        align="center"
        transition="all 0.2s"
        _hover={{
          boxShadow: 'md',
          bg: isDark ? "gray.700" : "gray.200"
        }}
      >
        {/* Icon container */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="40px"
          h="40px"
          bg={isDark ? "gray.900" : "white"}
          borderRadius="md"
          boxShadow="sm"
          flexShrink={0}
        >
          {renderIcon()}
        </Box>

        {/* Label and value */}
        <Box pr={2}>
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={isDark ? "gray.200" : "gray.700"}
          >
            {getComponentLabel(type)}
          </Text>
          {value && (
            <Text
              fontSize="xs"
              color={isDark ? "gray.400" : "gray.500"}
            >
              {value} {unit}
            </Text>
          )}
        </Box>
      </HStack>

      {/* Connection terminals - conditional based on component type */}
      {isIngestionComponent ? (
        <>
          {/* Top and bottom terminals for Ingestion */}
          <Terminal
            type="target"
            position={Position.Top}
            id="top"
            isConnectable={connectable}
          />
          <Terminal
            type="source"
            position={Position.Bottom}
            id="bottom"
            isConnectable={connectable}
          />
        </>
      ) : (
        <>
          {/* Left and right terminals for other components */}
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
        </>
      )}
    </Box>
  );
}