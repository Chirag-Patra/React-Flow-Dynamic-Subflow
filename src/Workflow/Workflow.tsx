import {
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  Node,
  OnNodeDrag,
  OnReconnect,
  Panel,
  ReactFlow,
  ReactFlowInstance,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box, Center, Flex, IconButton, Spinner, Text } from "@chakra-ui/react";
import { COMPONENTS, initialEdges, initialNodes } from "../constants";
import { v4 as uuid } from "uuid";
import { useCallback, useEffect, useRef, useState } from "react";
import MajorComponent from "../Components/MajorComponent";
import customEdge from "../Components/customEdge";
import ConnectionLine from "../Components/ConnectionLine";
import { MajorComponentsState, MajorComponents } from "../types";
import Board from "../Components/Board";
import { isPointInBox, zoomSelector } from "../utils";
import useKeyBindings from "../hooks/useKeyBindings";
import { useData, useUpdateData } from "../api";
import useHistory from "../hooks/useHistory";
import { LeftSidebar } from "./LeftSideBar";
import { RightSidebar } from "./RightSideBar";
import { useDarkMode } from "../store";
import { Sun, Moon } from "react-bootstrap-icons";

const nodeTypes = {
  MajorComponent: MajorComponent,
  Job: Board,
};

const edgeTypes = {
  customEdge: customEdge,
};

interface WorkflowProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export const Workflow = ({ nodes: propsNodes, edges: propsEdges, setNodes: setPropsNodes, setEdges: setPropsEdges }: WorkflowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(propsNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(propsEdges);
  const [isDragging, setIsDragging] = useState(false); // Add this line

  // Keep track of the last props to detect external changes
  const lastPropsNodes = useRef(propsNodes);
  const lastPropsEdges = useRef(propsEdges);

  // Only sync when props actually change from external source (import/clear)
  useEffect(() => {
    if (propsNodes !== lastPropsNodes.current) {
      setNodes(propsNodes);
      lastPropsNodes.current = propsNodes;
    }
  }, [propsNodes, setNodes]);

  useEffect(() => {
    if (propsEdges !== lastPropsEdges.current) {
      setEdges(propsEdges);
      lastPropsEdges.current = propsEdges;
    }
  }, [propsEdges, setEdges]);

  // Debounced update to parent - only sync back to parent occasionally
  const updateParentTimeout = useRef<number | undefined>();

  useEffect(() => {
    // Clear existing timeout
    if (updateParentTimeout.current) {
      clearTimeout(updateParentTimeout.current);
    }

    // Set new timeout to update parent after changes settle
    updateParentTimeout.current = setTimeout(() => {
      setPropsNodes(nodes);
    }, 100);

    return () => {
      if (updateParentTimeout.current) {
        clearTimeout(updateParentTimeout.current);
      }
    };
  }, [nodes, setPropsNodes]);

  useEffect(() => {
    // Clear existing timeout
    if (updateParentTimeout.current) {
      clearTimeout(updateParentTimeout.current);
    }

    // Set new timeout to update parent after changes settle
    updateParentTimeout.current = setTimeout(() => {
      setPropsEdges(edges);
    }, 100);

    return () => {
      if (updateParentTimeout.current) {
        clearTimeout(updateParentTimeout.current);
      }
    };
  }, [edges, setPropsEdges]);

  const { addNode, removeNode, addEdge, removeEdge, undo, redo } = useHistory();

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        type: "customEdge",
        id: uuid(),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#11b3cfff",
        },
      };
      addEdge(edge);
    },
    [addEdge]
  );

 // Extract of the updated handleProcessingNodeManagement function
// This would replace the existing function in Workflow.tsx

const handleProcessingNodeManagement = (boardId: string, processingType: string) => {
  // Map processing types to their corresponding component types
  const processingTypeToComponent: Record<string, MajorComponents | null> = {
    'ingest': MajorComponents.Ingestion,
    'ingest_etl': MajorComponents.Ingestion, // Also add Ingestion for ingest_etl
    'etl': null, // No component for ETL only
    'stream': null, // No component for stream only
    'stream_etl': null, // No component for stream_etl
  };

  // Get the component type for the current processing type
  const componentType = processingTypeToComponent[processingType];

  // Find the Job node
  const jobNode = nodes.find(n => n.id === boardId && n.type === 'Job');
  if (!jobNode) return;

  // Find any existing processing node for this Job
  const existingProcessingNode = nodes.find(
    n => n.parentId === boardId &&
      (n.data?.type === MajorComponents.Ingestion ||
       n.data?.type === MajorComponents.Run_Lamda ||
       n.data?.type === MajorComponents.Run_GlueJob ||
       n.data?.type === MajorComponents.Run_Eks ||
       n.data?.type === MajorComponents.Run_StepFunction)
  );

  // Remove any existing processing node if it exists
  if (existingProcessingNode) {
    removeNode(existingProcessingNode);
  }

  // Add new node if there's a valid component type for this processing type
  if (componentType) {
    const node: Node = {
      id: `${processingType}-${boardId}-${uuid()}`,
      type: "MajorComponent",
      position: { x: 50, y: 50 }, // Position inside the Job box
      data: {
        type: componentType,
        value: '',
        visible: showContent,
        connectable: showContent,
        isAttachedToGroup: true, // Mark as attached to parent

        // Copy the job configuration to the ingestion node if it's an ingestion type
        ingestionConfig: jobNode.data?.jobConfig || {}
      },
      parentId: boardId,
       extent: "parent", // Lock the component within its parent bounds
      draggable: showContent,
      selectable: showContent,
    };

    addNode(node);
  }
};

  const isValidConnection = (connection: Edge | Connection) => {
    const { source, target } = connection;

    if (source === target) return false;
    return true;
  };

  const dragOutsideRef = useRef<MajorComponents | null>(null);

  const { screenToFlowPosition, getIntersectingNodes, setViewport } =
    useReactFlow();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    type: MajorComponents
  ) => {
    dragOutsideRef.current = type;
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
  //   event.preventDefault();
  //   const type = dragOutsideRef.current;

  //   if (!type) return;

  //   let position = screenToFlowPosition({
  //     x: event.clientX,
  //     y: event.clientY,
  //   });

  //   const boards = nodes?.filter(
  //     (node) => node.type === MajorComponents.Board
  //   );
  //   const Job = boards.find((Job) => {
  //     return isPointInBox(
  //       { x: position.x, y: position.y },
  //       {
  //         x: Job.position?.x || 0,
  //         y: Job?.position?.y || 0,
  //         height: Job?.measured?.height || 0,
  //         width: Job?.measured?.width || 0,
  //       }
  //     );
  //   });

  //   if (Job) {
  //     const { x, y } = Job?.position || {
  //       x: 0,
  //       y: 0,
  //     };
  //     const { x: dragX, y: dragY } = position || {
  //       x: 0,
  //       y: 0,
  //     };
  //     position = { x: dragX - x, y: dragY - y };
  //   }

  //   let node: Node | undefined;
  //   if (
  //     [
  //       MajorComponents.Js,
  //       MajorComponents.Aws,
  //       MajorComponents.Db,
  //       MajorComponents.Email_notification,
  //       MajorComponents.Execute_Py,
  //       MajorComponents.Run_Lamda,
  //       MajorComponents.Run_GlueJob,
  //       MajorComponents.Run_Eks,
  //       MajorComponents.Run_StepFunction,
  //       MajorComponents.Ingestion,
  //     ].includes(type)
  //   ) {
  //     node = {
  //       id: uuid(),
  //       type: "MajorComponent",
  //       position,
  //       data: { type, value: '' },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Js) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Aws) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Db) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Email_notification) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Execute_Py) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Run_Lamda) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Run_GlueJob) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Run_Eks) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Run_StepFunction) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //    else if (type === MajorComponents.Ingestion) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: { value: 12 },
  //       parentId: Job?.id,
  //     };
  //   }
  //   else if (type === MajorComponents.Board) {
  //     node = {
  //       id: uuid(),
  //       type,
  //       position,
  //       data: {},
  //       style: { height: 200, width: 200 },
  //     };
  //   }

  //   if (node) addNode(node);
  // };


  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
  event.preventDefault();
  setIsDragging(false);
  const type = dragOutsideRef.current;

  console.log("onDrop triggered, type:", type);

  if (!type) {
    console.log("No type found");
    return;
  }

  let position = screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  console.log("Drop position:", position);
  console.log("All nodes:", nodes);

  // Board/Job can be dropped anywhere on the background
  if (type === MajorComponents.Board) {
    console.log("Creating Board/Job");
    const node: Node = {
      id: uuid(),
      type: "Job",
      position,
      data: {},
      style: { height: 200, width: 200 },
    };
    addNode(node);
    return; // Exit early
  }

  // For all other components, check if they're being dropped inside a Job
  const boards = nodes?.filter(
    (node) => node.type === "Job"
  );

  console.log("Found boards:", boards);

  const Job = boards.find((Job) => {
    const isInside = isPointInBox(
      { x: position.x, y: position.y },
      {
        x: Job.position?.x || 0,
        y: Job?.position?.y || 0,
        height: Job?.measured?.height || 0,
        width: Job?.measured?.width || 0,
      }
    );
    console.log("Checking Job:", Job.id, "isInside:", isInside, "Job bounds:", {
      x: Job.position?.x,
      y: Job.position?.y,
      height: Job?.measured?.height,
      width: Job?.measured?.width,
    });
    return isInside;
  });

  console.log("Selected Job:", Job);

  // If no Job found, don't create the node
  if (!Job) {
    console.log("No Job found - cannot drop component");
    return;
  }

  // Calculate relative position inside the Job
  const { x, y } = Job?.position || {
    x: 0,
    y: 0,
  };
  const { x: dragX, y: dragY } = position || {
    x: 0,
    y: 0,
  };
  position = { x: dragX - x, y: dragY - y };

  console.log("Relative position inside Job:", position);

  // Create node inside the Job
  let node: Node | undefined;
  if (
    [
      MajorComponents.Js,
      MajorComponents.Aws,
      MajorComponents.Db,
      MajorComponents.Email_notification,
      MajorComponents.Execute_Py,
      MajorComponents.Run_Lamda,
      MajorComponents.Run_GlueJob,
      MajorComponents.Run_Eks,
      MajorComponents.Run_StepFunction,
      MajorComponents.Ingestion,
    ].includes(type)
  ) {
    node = {
      id: uuid(),
      type: "MajorComponent",
      position,
      data: { type, value: '' },
      extent: "parent",
      parentId: Job?.id,
      expandParent: true,
    };
    console.log("Node to be created:", node);
  } else {
    console.log("Type not in allowed list:", type);
  }

  if (node) {
    console.log("Adding node");
    addNode(node);
  } else {
    console.log("No node created");
  }
};
  const [selectedNode, setSelectedNode] = useState<Node | undefined>();

  const onNodeClick = (event: React.MouseEvent<Element>, node: Node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(undefined);
  };

  const edgeReconnectSuccessful = useRef(false);

  const onReconnectStart = () => {
    edgeReconnectSuccessful.current = false;
  };

  const onReconnect: OnReconnect = (oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((prevEdges) => reconnectEdge(oldEdge, newConnection, prevEdges));
  };

  const onReconnectEnd = (_: MouseEvent | TouchEvent, edge: Edge) => {
    if (!edgeReconnectSuccessful.current) {
      removeEdge(edge);
    }
  };

  const overlappingNodeRef = useRef<Node | null>(null);

  const showContent = useStore(zoomSelector);

  const onNodeDrag: OnNodeDrag = (evt, dragNode) => {
    const overlappingNode = getIntersectingNodes(dragNode)?.[0];
    overlappingNodeRef.current = overlappingNode;

    setNodes((prevNodes) =>
      prevNodes.map((node) => {

        if (node.id === dragNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              state:
                overlappingNode &&
                  [
                    MajorComponents.Js,
                    MajorComponents.Aws,
                    MajorComponents.Db,
                    MajorComponents.Email_notification,
                    MajorComponents.Execute_Py,
                    MajorComponents.Run_Lamda,
                    MajorComponents.Run_GlueJob,
                    MajorComponents.Run_Eks,
                    MajorComponents.Run_StepFunction,
                    MajorComponents.Ingestion,
                  ].includes(
                    overlappingNode?.data?.type as MajorComponents
                  )
                  ? overlappingNode?.data?.type === dragNode?.data?.type
                    ? MajorComponentsState.Add
                    : MajorComponentsState.NotAdd
                  : undefined,
            },
          };
        }
        return node;
      })
    );
  };

  const onNodeDragStop: OnNodeDrag = (evt, dragNode) => {
    if (dragNode.type === 'Job') {
      return;
    }
    if (
      !overlappingNodeRef.current ||
      (overlappingNodeRef?.current?.type !== MajorComponents.Board &&
        dragNode?.parentId)
    ) {
      setNodes((prevNodes) => {
        const Job = prevNodes?.find(
          (prevNode) => prevNode.id === dragNode?.parentId
        );

        return prevNodes.map((node) => {
          if (node.id === dragNode.id) {
            const { x, y } = Job?.position || { x: 0, y: 0 };
            const { x: dragX, y: dragY } = dragNode?.position || { x: 0, y: 0 };

            const position = { x: dragX + x, y: dragY + y };

            return { ...node, position, parentId: undefined };
          }
          return node;
        });
      });
    }

    if (
      [
        MajorComponents.Js,
        MajorComponents.Aws,
        MajorComponents.Db,
        MajorComponents.Email_notification,
        MajorComponents.Execute_Py,
        MajorComponents.Run_Lamda,
        MajorComponents.Run_GlueJob,
        MajorComponents.Run_Eks,
        MajorComponents.Run_StepFunction,
        MajorComponents.Ingestion,
      ].includes(
        overlappingNodeRef?.current?.data?.type as MajorComponents
      ) &&
      dragNode?.data?.type === overlappingNodeRef?.current?.data?.type
    ) {
      setNodes((prevNodes) =>
        prevNodes
          .map((node) => {
            if (node.id === overlappingNodeRef?.current?.id) {
              return {
                ...node,
                data: {
                  ...node?.data,
                  value:
                    (dragNode?.data?.value as number) +
                    (node?.data?.value as number),
                },
              };
            }
            return node;
          })
          .filter((node) => node.id !== dragNode?.id)
      );
    }

    if (overlappingNodeRef?.current?.type === MajorComponents.Board) {
      setNodes((prevNodes) => [
        overlappingNodeRef?.current as Node,
        ...prevNodes
          .filter((node) => node.id !== overlappingNodeRef?.current?.id)
          .map((node) => {
            if (node.id === dragNode?.id) {
              const { x, y } = overlappingNodeRef?.current?.position || {
                x: 0,
                y: 0,
              };
              const { x: dragX, y: dragY } = dragNode?.position || {
                x: 0,
                y: 0,
              };

              let position;
              if (!node.parentId) {
                position = { x: dragX - x, y: dragY - y };
              } else if (
                node.parentId &&
                node?.parentId !== overlappingNodeRef?.current?.id
              ) {
                const prevBoard = prevNodes?.find(
                  (node) => node?.id === dragNode?.parentId
                );
                const { x: prevBoardX, y: prevBoardY } =
                  prevBoard?.position || {
                    x: 0,
                    y: 0,
                  };
                position = {
                  x: dragX + prevBoardX - x,
                  y: dragY + prevBoardY - y,
                };
              }

              return {
                ...node,
                parentId: overlappingNodeRef?.current?.id,
                ...((!dragNode?.parentId ||
                  dragNode?.parentId !== overlappingNodeRef?.current?.id) && {
                  position,
                }),
                draggable: showContent,
                selectable: showContent,
                data: {
                  ...node.data,
                  visible: showContent,
                  connectable: showContent,
                },
              };
            }
            return node;
          }),
      ]);
    }
  };

  useKeyBindings({ removeNode, undo, redo });

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.parentId) {
          return {
            ...node,
            draggable: showContent,
            selectable: showContent,
            data: {
              ...node.data,
              visible: showContent,
              connectable: showContent,
            },
          };
        }
        return {
          ...node,
          ...node,
          draggable: true,
          selectable: true,
          data: {
            ...node.data,
            visible: true,
            connectable: true,
          },
        };
      })
    );
  }, [showContent]);

  const { mutateAsync: saveFlow, isPending } = useUpdateData();
  const { data: reactFlowState } = useData();

  useEffect(() => {
    if (reactFlowState) {
      const { x = 0, y = 0, zoom = 1 } = reactFlowState.viewport;
      setNodes(reactFlowState.nodes || []);
      setEdges(reactFlowState.edges || []);
      setViewport({ x, y, zoom });
    }
  }, [reactFlowState]);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    Node,
    Edge
  > | null>(null);

  const { isDark, toggleMode } = useDarkMode();

  return (
    <Box height="calc(100vh - 60px)" width="100vw" position="relative">

      {/* Left Sidebar */}
      <LeftSidebar
        onDragStart={onDragStart}
      />

      {/* Right Sidebar */}
      <RightSidebar
        selectedNode={selectedNode}
        onDelete={() => setSelectedNode(undefined)}
        onProcessingTypeChange={handleProcessingNodeManagement}
        nodes={nodes}
        showContent={showContent}
      />

      {/* Main Canvas */}
      <Box
        ml="280px" // Left sidebar width
        mr={selectedNode ? "320px" : "0"} // Right sidebar width when open
        height="100%"
        transition="margin-right 0.3s ease"
      >
         {/* Blur overlay when dragging - positioned inside the canvas */}
      {isDragging && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={999}
          pointerEvents="none"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)"}
            backdropFilter="blur(8px)"
            WebkitBackdropFilter="blur(8px)" // For Safari support
          />
        </Box>
      )}
        <ReactFlow
          onInit={setRfInstance}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={ConnectionLine}
          isValidConnection={isValidConnection}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onReconnectStart={onReconnectStart}
          onReconnect={onReconnect}
          onReconnectEnd={onReconnectEnd}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          colorMode={isDark ? "dark" : "light"}
        >
          <Panel position="top-right">
            <IconButton
              icon={isDark ? <Sun /> : <Moon />}
              aria-label="Light/Dark Mode"
              size="xs"
              colorScheme={isDark ? "orange" : "blackAlpha"}
              onClick={toggleMode}
            />
          </Panel>
          <Background color="#aaa" gap={16} />
          <Controls />
          <svg>
            <defs>
              <linearGradient id="customEdge">
                <stop offset="0%" stopColor="#665e92ff" />
                <stop offset="100%" stopColor="#2e488fff" />
              </linearGradient>
            </defs>
          </svg>
        </ReactFlow>
      </Box>
    </Box>
  );
};