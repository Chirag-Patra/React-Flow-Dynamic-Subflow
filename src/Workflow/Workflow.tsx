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
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box, Center, Flex, IconButton, Spinner, Text, useToast } from "@chakra-ui/react";
import { COMPONENTS, initialEdges, initialNodes } from "../constants";
import { v4 as uuid } from "uuid";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import MajorComponent from "../Components/MajorComponent";
import customEdge from "../Components/customEdge";
import ETLOEdge from "../Components/ETLOEdge";
import ConnectionLine from "../Components/ConnectionLine";
import { MajorComponentsState, MajorComponents } from "../types";
import Board from "../Components/Board";
import Map from "../Components/Map";
import ETLO from "../Components/ETLO";
import BatchETLO from "../Components/BatchETLO";
import { isPointInBox, zoomSelector } from "../utils";
import useKeyBindings from "../hooks/useKeyBindings";
import { useData, useUpdateData } from "../api";
import useHistory from "../hooks/useHistory";
import { LeftSidebar } from "./LeftSideBar";
import { RightSidebar } from "./RightSideBar";
import { useDarkMode } from "../store";
import { Sun, Moon } from "react-bootstrap-icons";
import { BottomStatusBar } from "../Workflow/BottomStatusBar";
import PlaceholderNode from "../Components/PlaceholderNode";
import ComponentPlaceholder from "../Components/JobPlaceholder";

// Memoize node and edge types to prevent re-creation on every render
const nodeTypes = {
  MajorComponent: MajorComponent,
  Job: Board,
  ETLO: ETLO,
  BatchETLO: BatchETLO,
  Map: Map,
  PlaceholderNode: PlaceholderNode,
  ComponentPlaceholder: ComponentPlaceholder,
};

const edgeTypes = {
  customEdge: customEdge,
  ETLOEdge: ETLOEdge,
};

// Constant arrays for component type checks (prevents re-creation on every render)
const ALLOWED_COMPONENT_TYPES = [
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
];

const PROCESSING_NODE_TYPES = [
  MajorComponents.Ingestion,
  MajorComponents.Run_Lamda,
  MajorComponents.Run_GlueJob,
  MajorComponents.Run_Eks,
  MajorComponents.Run_StepFunction,
];

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
  const toast = useToast();

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

  // Forward changes upstream without extra effects to avoid re-render loops
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((prev) => {
        const next = applyNodeChanges(changes, prev);
        setPropsNodes(next);
        return next;
      });
    },
    [setNodes, setPropsNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((prev) => {
        const next = applyEdgeChanges(changes, prev);
        setPropsEdges(next);
        return next;
      });
    },
    [setEdges, setPropsEdges]
  );

  const { addNode, removeNode, addEdge, removeEdge, undo, redo } = useHistory();

  // Memoize node lookup map for faster access
  const nodeMap = useMemo(() => {
    const map: Record<string, Node> = {};
    nodes.forEach(node => {
      map[node.id] = node;
    });
    return map;
  }, [nodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      // Check if the source node is an ETLO or BatchETLO to determine edge type
      const sourceNode = nodeMap[connection.source];
      const isETLOConnection = sourceNode?.type === "ETLO" || sourceNode?.type === "BatchETLO";

      const edge = {
        ...connection,
        type: isETLOConnection ? "ETLOEdge" : "customEdge",
        id: uuid(),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width:  20,
          height: 20,
          color: isETLOConnection ? "#2c5aa0" : "#516fb4ff", // Green glass for ETLO/BatchETLO, blue for others
        },
      };
      addEdge(edge);
    },
    [addEdge, nodeMap]
  );

  const isValidConnection = (connection: Edge | Connection) => {
    const { source, target } = connection;

    if (source === target) return false;
    return true;
  };

  const dragOutsideRef = useRef<MajorComponents | null>(null);

  const { screenToFlowPosition, getIntersectingNodes, setViewport } =
    useReactFlow();
  const showContent = useStore(zoomSelector);

  // Memoize processing type mapping
  const processingTypeToComponent: Record<string, MajorComponents | null> = useMemo(() => ({
    'ingest': MajorComponents.Ingestion,
    'ingest_etl': MajorComponents.Ingestion,
    'etl': null,
    'stream': null,
    'stream_etl': null,
  }), []);

  const handleProcessingNodeManagement = useCallback((boardId: string, processingType: string) => {
    // Get the component type for the current processing type
    const componentType = processingTypeToComponent[processingType];

    // Find the Job node using memoized map
    const jobNode = nodeMap[boardId];
    if (!jobNode || jobNode.type !== 'Job') return;

    // Find any existing processing node for this Job
    const existingProcessingNode = nodes.find(
      n => n.parentId === boardId && PROCESSING_NODE_TYPES.includes(n.data?.type as MajorComponents)
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
  }, [nodeMap, nodes, removeNode, addNode, showContent, processingTypeToComponent]);

  const onDragStart = useCallback((
    event: React.DragEvent<HTMLDivElement>,
    type: MajorComponents
  ) => {
    dragOutsideRef.current = type;
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Memoize expensive node computations
  const nodesByType = useMemo(() => {
    const jobNodes = nodes.filter(n => n.type === "Job");
    const mapNodes = nodes.filter(n => n.type === "Map");
    const etloNodes = nodes.filter(n => n.type === "ETLO");
    const batchETLONodes = nodes.filter(n => n.type === "BatchETLO");
    return { jobNodes, mapNodes, etloNodes, batchETLONodes };
  }, [nodes]);

  const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback((event) => {
  event.preventDefault();
  setIsDragging(false);
  const type = dragOutsideRef.current;

  // console.debug("onDrop triggered, type:", type);

  if (!type) {
    // console.debug("No type found");
    return;
  }

  const position = screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  // console.debug("Drop position:", position);
  // console.debug("All nodes:", nodes);

  // Board/Job can be dropped anywhere on the background
  if (type === MajorComponents.Board) {
    // console.debug("Creating Board/Job");
    const node: Node = {
      id: uuid(),
      type: "Job",
      position,
      data: {},
      expandParent: true,
      style: { height: 200, width: 200 },
    };
    addNode(node);
    return; // Exit early
  }

  // PlaceholderNode can be dropped anywhere on the background
  if (type === MajorComponents.PlaceholderNode) {
    const node: Node = {
      id: uuid(),
      type: "PlaceholderNode",
      position,
      data: {},
      expandParent: true,
      style: { height: 150, width: 200 },
    };
    addNode(node);
    return; // Exit early
  }

  // ETLO can be dropped anywhere on the background
  if (type === MajorComponents.ETLO) {
    // console.debug("Creating ETLO");
    const node: Node = {
      id: uuid(),
      type: "ETLO",
      position,
      data: {},
      style: { height: 200, width: 200 },
    };
    addNode(node);
    return; // Exit early
  }

  // Map can ONLY be dropped inside Job components
  if (type === MajorComponents.Map) {
    // console.debug("Creating Map - checking for Job container");

    // Check if dropping inside a Job - use memoized value
    const Job = nodesByType.jobNodes.find((Job) => {
      return isPointInBox(
        { x: position.x, y: position.y },
        {
          x: Job.position?.x || 0,
          y: Job?.position?.y || 0,
          height: Job?.measured?.height || 0,
          width: Job?.measured?.width || 0,
        }
      );
    });

    // If no Job container found, don't allow the drop
    if (!Job) {
      // console.debug("Map can only be dropped inside Job components");
      toast({
        title: "Invalid Drop Location",
        description: "Map components can only be dropped inside Job components",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return; // Exit early - prevent Map creation outside of Job
    }

    // Calculate relative position inside the Job
    const { x, y } = Job?.position || { x: 0, y: 0 };
    const { x: dragX, y: dragY } = position || { x: 0, y: 0 };
    const mapPosition = { x: dragX - x, y: dragY - y };

    const node: Node = {
      id: uuid(),
      type: "Map",
      position: mapPosition,
      data: { type, value: '' },
      style: { height: 100, width: 200 },
      parentId: Job.id,
      extent: "parent",
      expandParent: true
    };
    addNode(node);
    return; // Exit early
  }

  // Check if dropping inside any container (Job or Map)
  // ETLO is a root-only parent and cannot contain children
  // Use memoized values to avoid re-filtering
  const allContainers = [
    ...nodesByType.mapNodes,
    ...nodesByType.jobNodes,
  ];

  // console.debug("Found containers:", allContainers);

  let finalParentId: string | undefined;
  let finalPosition = position;

  // Find the deepest/smallest container that contains the drop point
  const container = allContainers.find((containerNode) => {
    let containerAbsX = containerNode.position?.x || 0;
    let containerAbsY = containerNode.position?.y || 0;

    // If container has a parent, add parent's position
    if (containerNode.parentId) {
      const parent = nodes.find(n => n.id === containerNode.parentId);
      if (parent) {
        containerAbsX += parent.position?.x || 0;
        containerAbsY += parent.position?.y || 0;
      }
    }

    let isInside = false;

    if (containerNode.type === "Map") {

      const dropZoneMargin = 2;
      const headerHeight = 20;
      const containerHeight = containerNode?.measured?.height || (containerNode.type === "Map" ? 100 : 200);
      const containerWidth = containerNode?.measured?.width || (containerNode.type === "Map" ? 200 : 200);

      isInside = isPointInBox(
        { x: position.x, y: position.y },
        {
          x: containerAbsX + dropZoneMargin,
          y: containerAbsY + headerHeight + dropZoneMargin,
          height: containerHeight - headerHeight - (dropZoneMargin * 2),
          width: containerWidth - (dropZoneMargin * 2),
        }
      );
    } else {
      // For Job and ETLO components, use the entire container area
      isInside = isPointInBox(
        { x: position.x, y: position.y },
        {
          x: containerAbsX,
          y: containerAbsY,
          height: containerNode?.measured?.height || 200,
          width: containerNode?.measured?.width || 200,
        }
      );
    }

    // console.debug(`Checking ${containerNode.type}:`, containerNode.id, "isInside:", isInside);
    return isInside;
  });

  if (container) {
    // console.debug("Dropping inside container:", container.type, container.id);
    finalParentId = container.id;

    // Calculate position relative to the container
    let containerAbsX = container.position?.x || 0;
    let containerAbsY = container.position?.y || 0;

    if (container.parentId) {
      const parent = nodes.find(n => n.id === container.parentId);
      if (parent) {
        containerAbsX += parent.position?.x || 0;
        containerAbsY += parent.position?.y || 0;
      }
    }

    if (container.type === "Map") {
      // For Map components, center components with smart positioning for multiple components
      const dropZoneMargin = 4;  // Minimal margin to fit 180px component in 200px Map
      const headerHeight = 30;   // Reduced header height for smaller Map
      const containerHeight = container?.measured?.height || 100;
      const containerWidth = container?.measured?.width || 200;

      // Calculate the drop zone dimensions
      const dropZoneWidth = containerWidth - (dropZoneMargin * 2);
      const dropZoneHeight = containerHeight - headerHeight - (dropZoneMargin * 2);

      // Component dimensions (matching actual MajorComponent size)
      const componentWidth = 180;  // Actual component width
      const componentHeight = 55;  // Actual component height
      const componentSpacing = 10; // Spacing between components

      // Count existing components in this Map
      const existingComponents = nodes.filter(n => n.parentId === container.id);
      const componentCount = existingComponents.length;

      // Calculate position based on component count
      let xPos, yPos;

      if (componentCount === 0) {
        // First component - center it perfectly with equal margins on all sides
        const availableWidth = dropZoneWidth - componentWidth;
        const availableHeight = dropZoneHeight - componentHeight;
        xPos = dropZoneMargin + availableWidth / 2;
        yPos = headerHeight + dropZoneMargin + availableHeight / 2;
      } else {
        // Multiple components - arrange in a centered grid pattern with equal spacing
        const minMargin = 1; // Minimal margin from edges due to tight space
        const availableGridWidth = dropZoneWidth - (2 * minMargin);
        const componentsPerRow = Math.max(1, Math.floor(availableGridWidth / (componentWidth + componentSpacing)));
        const totalComponents = componentCount + 1; // Include the new component being added
        const totalRows = Math.ceil(totalComponents / componentsPerRow);

        // Current component position in grid
        const row = Math.floor(componentCount / componentsPerRow);
        const col = componentCount % componentsPerRow;

        // Calculate grid dimensions
        const componentsInCurrentRow = Math.min(componentsPerRow, totalComponents - (row * componentsPerRow));
        const currentRowWidth = (componentsInCurrentRow * componentWidth) + ((componentsInCurrentRow - 1) * componentSpacing);

        // Center the current row with minimum margins
        const rowStartX = dropZoneMargin + minMargin + (availableGridWidth - currentRowWidth) / 2;

        // Calculate total grid height
        const totalGridHeight = (totalRows * componentHeight) + ((totalRows - 1) * componentSpacing);
        const gridStartY = headerHeight + dropZoneMargin + (dropZoneHeight - totalGridHeight) / 2;

        xPos = rowStartX + col * (componentWidth + componentSpacing);
        yPos = gridStartY + row * (componentHeight + componentSpacing);

        // debug: grid positioning variables available here if needed
      }

      finalPosition = { x: xPos, y: yPos };
      // console.debug("Map centering - Final position:", finalPosition);
    } else {
      // For Job and ETLO components, use standard relative positioning
      finalPosition = {
        x: position.x - containerAbsX,
        y: position.y - containerAbsY
      };
    }
  } else {
    // console.debug("No container found - cannot drop component");
    return;
  }

  // console.debug("Final parent ID:", finalParentId);
  // console.debug("Final position:", finalPosition);

  // Create node inside the Job or Map
  let node: Node | undefined;
  if (ALLOWED_COMPONENT_TYPES.includes(type)) {
    // Check if parent is a Map component to determine draggable state
    const parentContainer = container;
    const isParentMap = parentContainer?.type === "Map";

    node = {
      id: uuid(),
      type: "MajorComponent",
      position: finalPosition,
      data: { type, value: '' },
      extent: "parent",
      parentId: finalParentId,
      expandParent: true,
      draggable: !isParentMap, // Components in Map are not draggable
      selectable: showContent,
    };
    // console.debug("Node to be created:", node, "isParentMap:", isParentMap);
  } else {
    // console.debug("Type not in allowed list:", type);
  }

  if (node) {
    // console.debug("Adding node");
    addNode(node);
  } else {
    // console.debug("No node created");
  }
}, [addNode, nodes, nodesByType, screenToFlowPosition, toast, showContent]);
  const [selectedNode, setSelectedNode] = useState<Node | undefined>();

  const onNodeClick = useCallback((event: React.MouseEvent<Element>, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(undefined);
  }, []);

  const edgeReconnectSuccessful = useRef(false);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect: OnReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((prevEdges) => reconnectEdge(oldEdge, newConnection, prevEdges));
  }, []);

  const onReconnectEnd = useCallback((_: MouseEvent | TouchEvent, edge: Edge) => {
    if (!edgeReconnectSuccessful.current) {
      removeEdge(edge);
    }
  }, [removeEdge]);

  const onNodeDragStop: OnNodeDrag = useCallback((evt, dragNode) => {
    const overlappingNode = getIntersectingNodes(dragNode)?.[0];
    if (dragNode.type === 'Job' || dragNode.type === 'ETLO' || dragNode.type === 'Map') {
      return;
    }
    if (
      !overlappingNode ||
      (overlappingNode?.type !== MajorComponents.Board &&
        overlappingNode?.type !== 'ETLO' &&
        overlappingNode?.type !== 'Map' &&
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
      ALLOWED_COMPONENT_TYPES.includes(overlappingNode?.data?.type as MajorComponents) &&
      dragNode?.data?.type === overlappingNode?.data?.type
    ) {
      setNodes((prevNodes) =>
        prevNodes
          .map((node) => {
            if (node.id === overlappingNode?.id) {
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

    // Handle dynamic subgrouping for Board and Map components (ETLO excluded)
    if (overlappingNode?.type === MajorComponents.Board ||
        overlappingNode?.type === 'Map') {
      setNodes((prevNodes) => [
        overlappingNode as Node,
        ...prevNodes
          .filter((node) => node.id !== overlappingNode?.id)
          .map((node) => {
            if (node.id === dragNode?.id) {
              const { x, y } = overlappingNode?.position || {
                x: 0,
                y: 0,
              };
              const { x: dragX, y: dragY } = dragNode?.position || {
                x: 0,
                y: 0,
              };

              // Check if the new parent is a Map to set draggable state and position
              const isNewParentMap = overlappingNode?.type === 'Map';

              let position;

              if (isNewParentMap) {
                // For Map containers, center the component automatically
                const dropZoneMargin = 2;
                const headerHeight = 20;
                const containerHeight = overlappingNode?.measured?.height || 100;
                const containerWidth = overlappingNode?.measured?.width || 200;

                const dropZoneWidth = containerWidth - (dropZoneMargin * 2);
                const dropZoneHeight = containerHeight - headerHeight - (dropZoneMargin * 2);

                const componentWidth = 180;
                const componentHeight = 55;
                const componentSpacing = 10;

                // Count existing components in this Map
                const existingComponents = prevNodes.filter(n => n.parentId === overlappingNode?.id);
                const componentCount = existingComponents.length;

                // Calculate centered position
                let xPos, yPos;

                if (componentCount === 0) {
                  // First component - center it perfectly with equal margins on all sides
                  const availableWidth = dropZoneWidth - componentWidth;
                  const availableHeight = dropZoneHeight - componentHeight;
                  xPos = dropZoneMargin + availableWidth / 2;
                  yPos = headerHeight + dropZoneMargin + availableHeight / 2;
                } else {
                  // Multiple components - arrange in a centered grid pattern with equal spacing
                  const minMargin = 1; // Minimal margin from edges due to tight space
                  const availableGridWidth = dropZoneWidth - (2 * minMargin);
                  const componentsPerRow = Math.max(1, Math.floor(availableGridWidth / (componentWidth + componentSpacing)));
                  const totalComponents = componentCount + 1; // Include the new component being moved
                  const totalRows = Math.ceil(totalComponents / componentsPerRow);

                  // Current component position in grid
                  const row = Math.floor(componentCount / componentsPerRow);
                  const col = componentCount % componentsPerRow;

                  // Calculate grid dimensions
                  const componentsInCurrentRow = Math.min(componentsPerRow, totalComponents - (row * componentsPerRow));
                  const currentRowWidth = (componentsInCurrentRow * componentWidth) + ((componentsInCurrentRow - 1) * componentSpacing);

                  // Center the current row with minimum margins
                  const rowStartX = dropZoneMargin + minMargin + (availableGridWidth - currentRowWidth) / 2;

                  // Calculate total grid height
                  const totalGridHeight = (totalRows * componentHeight) + ((totalRows - 1) * componentSpacing);
                  const gridStartY = headerHeight + dropZoneMargin + (dropZoneHeight - totalGridHeight) / 2;

                  xPos = rowStartX + col * (componentWidth + componentSpacing);
                  yPos = gridStartY + row * (componentHeight + componentSpacing);
                }

                position = { x: xPos, y: yPos };
              } else {
                // For non-Map containers, use standard positioning
                if (!node.parentId) {
                  position = { x: dragX - x, y: dragY - y };
                } else if (
                  node.parentId &&
                  node?.parentId !== overlappingNode?.id
                ) {
                  const prevParent = prevNodes?.find(
                    (node) => node?.id === dragNode?.parentId
                  );
                  const { x: prevParentX, y: prevParentY } =
                    prevParent?.position || {
                      x: 0,
                      y: 0,
                    };
                  position = {
                    x: dragX + prevParentX - x,
                    y: dragY + prevParentY - y,
                  };
                }
              }

              return {
                ...node,
                parentId: overlappingNode?.id,
                ...((!dragNode?.parentId ||
                  dragNode?.parentId !== overlappingNode?.id) && {
                  position,
                }),
                draggable: isNewParentMap ? false : showContent, // Components in Map are not draggable
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
    // Do not allow parenting into ETLO
    if (overlappingNode?.type === 'ETLO') {
      return;
    }
  }, [getIntersectingNodes, setNodes, showContent]);

  useKeyBindings({ removeNode, undo, redo });

  // Create a map of parent types for quick lookup
  const parentTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    nodes.forEach(node => {
      if (node.type) {
        map[node.id] = node.type;
      }
    });
    return map;
  }, [nodes]);

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.parentId) {
          // Use memoized parent type map for faster lookup
          const isParentMap = parentTypeMap[node.parentId] === "Map";

          return {
            ...node,
            draggable: isParentMap ? false : showContent,
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
  }, [showContent, setNodes, parentTypeMap]);

  const { mutateAsync: saveFlow, isPending } = useUpdateData();
  const { data: reactFlowState } = useData();

  useEffect(() => {
    if (reactFlowState) {
      const { x = 0, y = 0, zoom = 1 } = reactFlowState.viewport;
      setNodes(reactFlowState.nodes || []);
      setEdges(reactFlowState.edges || []);
      setViewport({ x, y, zoom });
    }
  }, [reactFlowState, setNodes, setEdges, setViewport]);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    Node,
    Edge
  > | null>(null);

  const { isDark, toggleMode } = useDarkMode();

  // Memoize computed values
  const rightMargin = useMemo(() => selectedNode ? "320px" : "0", [selectedNode]);
  const onDeleteNode = useCallback(() => setSelectedNode(undefined), []);

  return (
    <Box height="calc(100vh - 60px)" width="100vw" position="relative">

      {/* Left Sidebar */}
      <LeftSidebar
        onDragStart={onDragStart}
      />

      {/* Right Sidebar */}
      <RightSidebar
        selectedNode={selectedNode}
        onDelete={onDeleteNode}
        onProcessingTypeChange={handleProcessingNodeManagement}
        nodes={nodes}
        showContent={showContent}
      />
       {/* <BottomStatusBar
        logs={[]}
        onClearLogs={() => {}}
        onExportLogs={() => {}}
      /> */}

      {/* Main Canvas */}
      <Box
        ml="280px" // Left sidebar width
        mr={rightMargin} // Right sidebar width when open
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
            style={{ WebkitBackdropFilter: 'blur(8px)' }} // For Safari support
          />
        </Box>
      )}
        <ReactFlow
          onInit={setRfInstance}
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Strict}
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