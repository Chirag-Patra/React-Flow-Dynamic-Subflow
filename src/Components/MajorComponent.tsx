import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import React, { memo, useMemo, useCallback } from "react";
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
import { useComponentTypeInfo, useComponentLabel, useComponentStyling } from "../hooks";

type MajorComponentNode = Node<MajorComponentsData, "string">;

function MajorComponent({
  data: {
    reusableComponenttype,
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
  const { updateNode } = useReactFlow();
  const { isDark } = useDarkMode();

  // Use optimized hooks for component information and styling
  const componentTypeInfo = useComponentTypeInfo(type);
  const componentLabel = useComponentLabel(type, reusableComponenttype);
  const componentStyling = useComponentStyling(selected, state === MajorComponentsState.Add, state === MajorComponentsState.NotAdd);

  // Memoize icon rendering
  const iconComponent = useMemo(() => {
    const iconProps = { height: 30 };
    
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
  }, [type]);

  return (
    <Box
      pos="relative"
      style={{
       // transform: `rotate(${rotation}deg)`,
       // visibility: visible ? "visible" : "hidden",
      }}
    >
      {/* <Rotation selected={selected} id={id} /> */}

      {/* Lock/Unlock button - hidden for Ingestion components */}
      {/* {parentId && selected && !isIngestionComponent && (
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
      )} */}

      {/* Addition state indicators */}
      {state === MajorComponentsState.Add && (
        <Plus
          style={{ position: "absolute", top: -17, right: 2, zIndex: 10 }}
          color={isDark ? "white" : "black"}
        />
      )}
      {state === MajorComponentsState.NotAdd && (
        <X style={{ position: "absolute", top: -17, right: 2, zIndex: 10 }} color={isDark ? "white" : "black"} />
      )}

      {/* Main component container */}
      <HStack
        spacing={2}
        p={2}
        bg={componentStyling.backgroundColor}
        borderRadius="sm"
        border={`${componentStyling.borderWidth} solid`}
        borderColor={componentStyling.borderColor}
        h='55px'
        w="180px"
        align="center"
        transition="all 0.2s"
        _hover={componentStyling.hoverStyles}
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
          {iconComponent}
        </Box>

        {/* Label only - value moved outside */}
        <Box pr={2}>
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={isDark ? "gray.200" : "gray.700"}
            textAlign="center"
          >
            {componentLabel}
          </Text>
        </Box>
      </HStack>

      {/* Value display outside the main box - positioned at bottom */}
      {(value || (componentTypeInfo.isETLProcessing && reusableComponenttype)) && (
        <Box
          position="absolute"
          bottom="-20px"
          left="50%"
          transform="translateX(-50%)"
          bg={isDark ? "gray.900" : "white"}
          border="1px solid"
          borderColor={isDark ? "gray.600" : "gray.300"}
          borderRadius="sm"
          px={2}
          py={1}
          fontSize="xs"
          color={isDark ? "gray.300" : "gray.600"}
          whiteSpace="nowrap"
          boxShadow="sm"
          zIndex={5}
        >
          {componentTypeInfo.isETLProcessing && reusableComponenttype && reusableComponenttype !== 'Custom' ? (
            <Text>{reusableComponenttype}</Text>
          ) : value ? (
            <Text>{value} {type ? getUnit(type as MajorComponents) : undefined}</Text>
          ) : null}
        </Box>
      )}

      {/* Connection terminals - conditional based on component type */}
      {/* {isIngestionComponent ? ( */}
        {/* <> */}
          {/* Top and bottom terminals for Ingestion */}
          {/* <Terminal
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
        </> */}
      {/* ) : (
        <> */}
          {/* Left and right terminals for other components */}
          {/* <Terminal
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
      )} */}
        {/* </> */}

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
    </Box>
  );
}

// Export memoized component for performance
export default memo(MajorComponent);