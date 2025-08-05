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
import ComponentDetail from "../Components/ComponentDetail";
import Board from "../Components/Board";
import { ExportFlow } from "../Components/ExportFlow";
import { ImportFlow } from "../Components/ImportFlow";
import { ClearCanvas } from "../Components/ClearCanvas";
import { isPointInBox, zoomSelector } from "../utils";
import useKeyBindings from "../hooks/useKeyBindings";
import { Floppy, Moon, Sun } from "react-bootstrap-icons";
import { useData, useUpdateData } from "../api";
import DownloadBtn from "../Components/DownloadBtn";
import { useDarkMode } from "../store";
import useHistory from "../hooks/useHistory";
import { m } from "framer-motion";
import { Icon, Collapse } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

const nodeTypes = {
  MajorComponent: MajorComponent,
  bulb: Bulb,
  battery: Battery,
  board: Board,
};

const edgeTypes = {
  customEdge: customEdge,
};

export const Workflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
        //MajorComponents
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
      };}
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

  // const onSave = () => {
  //   if (rfInstance) {
  //     const flow = rfInstance.toObject();
  //     saveFlow(flow);
  //   }
  // };

  const { isDark, toggleMode } = useDarkMode();
  const [showIcons, setShowIcons] = useState(false);
  return (
    <Box
      height={"100vh"}
      width="100vw"
      border="1px solid black"
      position="relative"
    >
      {selectedNode && (

            <ComponentDetail
              node={selectedNode}
              key={selectedNode.id}
              onDelete={() => setSelectedNode(undefined)}
            />
         
      )}
      <ReactFlow
        onInit={setRfInstance}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // connectionMode={ConnectionMode.Strict}
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
        <Panel
          position="top-left"
          style={{
            border: "1px solid #ccc",
            padding: 12,
            borderRadius: 12,
            background: "white",
            width: 200,
            height: 400
          }}
        >
          <Flex direction={"column"} gap={10}>
            <div>
              <Text
                fontSize="x-large"
                fontWeight="bold"
                fontFamily="cursive"
                sx={{
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(to right, #4f46e5, #af78cfff)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  display: 'inline-block',
                  _hover: {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease-in-out'
                  }
                }}
              >
                WorkFlow.io
              </Text>

              <Text fontSize="x-medium" fontWeight="bold">Toolbar</Text>

              <Flex mt={3} gap={3.5} flexWrap="wrap" >
                <DownloadBtn />
                <ExportFlow nodes={nodes} edges={edges} />
                <ImportFlow onImport={(flow) => {
                  setNodes(flow.nodes || []);
                  setEdges(flow.edges || []);
                }} />
                <ClearCanvas onClear={() => {
                  setNodes([]);
                  setEdges([]);
                }} />
              </Flex>
            </div>

            <div>
              <Text fontSize="x-medium" fontWeight="bold">Components</Text>
              <Flex mt={1} gap={3} flexWrap="wrap">
                {COMPONENTS.map((component) => (
                  <IconButton
                    size="lg"
                    key={component.label}
                    aria-label={component.label}
                    icon={component.icon}
                    onDragStart={(event) => onDragStart(event, component.type)}
                    draggable
                  />
                ))}
              </Flex>
            </div>
          </Flex>
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
  );
};
