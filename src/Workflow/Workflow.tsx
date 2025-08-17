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
import Bulb from "../Components/Bulb";
import Battery from "../Components/Battery";
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
  bulb: Bulb,
  battery: Battery,
  board: Board,
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

  const handleProcessingNodeManagement = (boardId: string, processingType: string) => {
    // Map processing types to their corresponding component types
    const processingTypeToComponent: Record<string, MajorComponents> = {
      'run_lambda': MajorComponents.Lamda,
      'run_glue': MajorComponents.GlueJob,
       'run_eks': MajorComponents.Eks,
       'run_sfn': MajorComponents.StepFunction,

    };

    // Get the component type for the current processing type
    const componentType = processingTypeToComponent[processingType];

    // Find any existing processing node for this board
    const existingProcessingNode = nodes.find(
      n => n.parentId === boardId &&
        Object.values(processingTypeToComponent).includes(n.data?.type as MajorComponents)
    );

    // Remove any existing processing node if it exists
    if (existingProcessingNode) {
      removeNode(existingProcessingNode);
    }

    // Add new node if there's a valid component type for this processing type
    if (componentType) {
      const node: Node = {
        id: `${processingType}-${boardId}`,
        type: "MajorComponent",
        position: { x: 50, y: 50 },
        data: {
          type: componentType,
          value: '',
          visible: showContent,
          connectable: showContent
        },
        parentId: boardId,
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
    event: React.DragEvent<HTMLButtonElement>,
    type: MajorComponents
  ) => {
    dragOutsideRef.current = type;
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const type = dragOutsideRef.current;

    if (!type) return;

    let position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const boards = nodes?.filter(
      (node) => node.type === MajorComponents.Board
    );
    const board = boards.find((board) => {
      return isPointInBox(
        { x: position.x, y: position.y },
        {
          x: board.position?.x || 0,
          y: board?.position?.y || 0,
          height: board?.measured?.height || 0,
          width: board?.measured?.width || 0,
        }
      );
    });

    if (board) {
      const { x, y } = board?.position || {
        x: 0,
        y: 0,
      };
      const { x: dragX, y: dragY } = position || {
        x: 0,
        y: 0,
      };
      position = { x: dragX - x, y: dragY - y };
    }

    let node: Node | undefined;
    if (
      [
        MajorComponents.Capacitor,
        MajorComponents.Inductor,
        MajorComponents.Resistor,
        MajorComponents.Js,
        MajorComponents.Aws,
        MajorComponents.Db,
        MajorComponents.Email,
        MajorComponents.Python,
        MajorComponents.Lamda,
        MajorComponents.GlueJob,
        MajorComponents.Eks,
        MajorComponents.StepFunction,
      ].includes(type)
    ) {
      node = {
        id: uuid(),
        type: "MajorComponent",
        position,
        data: { type, value: '' },
        parentId: board?.id,
      };
    } else if (type === MajorComponents.Bulb) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    } else if (type === MajorComponents.Battery) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
    else if (type === MajorComponents.Capacitor) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
    else if (type === MajorComponents.Js) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
    else if (type === MajorComponents.Aws) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
    else if (type === MajorComponents.Db) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
    else if (type === MajorComponents.Email) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
    else if (type === MajorComponents.Python) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
    else if (type === MajorComponents.Lamda) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
    else if (type === MajorComponents.GlueJob) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
 else if (type === MajorComponents.Eks) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
     else if (type === MajorComponents.StepFunction) {
      node = {
        id: uuid(),
        type,
        position,
        data: { value: 12 },
        parentId: board?.id,
      };
    }
    else if (type === MajorComponents.Board) {
      node = {
        id: uuid(),
        type,
        position,
        data: {},
        style: { height: 200, width: 200 },
      };
    }

    if (node) addNode(node);
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
                    MajorComponents.Capacitor,
                    MajorComponents.Resistor,
                    MajorComponents.Inductor,
                    MajorComponents.Js,
                    MajorComponents.Aws,
                    MajorComponents.Db,
                    MajorComponents.Email,
                    MajorComponents.Python,
                    MajorComponents.Lamda,
                    MajorComponents.GlueJob,
                    MajorComponents.Eks,
                    MajorComponents.StepFunction,
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
    if (dragNode.type === 'board' && dragNode.data?.processingType === 'run_lambda') {
      return;
    }
    if (
      !overlappingNodeRef.current ||
      (overlappingNodeRef?.current?.type !== MajorComponents.Board &&
        dragNode?.parentId)
    ) {
      setNodes((prevNodes) => {
        const board = prevNodes?.find(
          (prevNode) => prevNode.id === dragNode?.parentId
        );

        return prevNodes.map((node) => {
          if (node.id === dragNode.id) {
            const { x, y } = board?.position || { x: 0, y: 0 };
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
        MajorComponents.Capacitor,
        MajorComponents.Resistor,
        MajorComponents.Inductor,
        MajorComponents.Js,
        MajorComponents.Aws,
        MajorComponents.Db,
        MajorComponents.Email,
        MajorComponents.Python,
        MajorComponents.Lamda,
        MajorComponents.GlueJob,
        MajorComponents.Eks,
        MajorComponents.StepFunction,
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