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
import Map from "../Components/Map";
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
  Map: Map,
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

  // Map can be dropped anywhere on the background or inside Job
  if (type === MajorComponents.Map) {
    console.log("Creating Map");
    
    // Check if dropping inside a Job
    const boards = nodes?.filter((node) => node.type === "Job");
    const Job = boards.find((Job) => {
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

    let mapPosition = position;
    let parentId = undefined;

    if (Job) {
      // Calculate relative position inside the Job
      const { x, y } = Job?.position || { x: 0, y: 0 };
      const { x: dragX, y: dragY } = position || { x: 0, y: 0 };
      mapPosition = { x: dragX - x, y: dragY - y };
      parentId = Job.id;
    }

    const node: Node = {
      id: uuid(),
      type: "Map",
      position: mapPosition,
      data: { type, value: '' },
      style: { height: 100, width: 200 },
      ...(parentId && { 
        parentId,
        extent: "parent",
        expandParent: true 
      }),
    };
    addNode(node);
    return; // Exit early
  }

  // Check if dropping inside any container (Job or Map)
  // Priority: Map containers first, then Job containers
  const allContainers = [
    ...nodes.filter((node) => node.type === "Map"),
    ...nodes.filter((node) => node.type === "Job")
  ];

  console.log("Found containers:", allContainers);

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
      // For Map components, only allow drops in the inner rectangular drop zone
      // The drop zone has minimal margins of 2px to fit 180px component in 200px Map
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
      // For Job components, use the entire container area
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
    
    console.log(`Checking ${containerNode.type}:`, containerNode.id, "isInside:", isInside);
    return isInside;
  });

  if (container) {
    console.log("Dropping inside container:", container.type, container.id);
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
        
        console.log("Grid positioning:", {
          componentCount,
          totalComponents,
          row,
          col,
          componentsPerRow,
          currentRowWidth,
          dropZoneWidth,
          xPos,
          yPos
        });
      }
      
      finalPosition = { x: xPos, y: yPos };
      console.log("Map centering - Final position:", finalPosition);
    } else {
      // For Job components, use standard relative positioning
      finalPosition = { 
        x: position.x - containerAbsX, 
        y: position.y - containerAbsY 
      };
    }
  } else {
    console.log("No container found - cannot drop component");
    return;
  }

  console.log("Final parent ID:", finalParentId);
  console.log("Final position:", finalPosition);

  // Create node inside the Job or Map
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
    console.log("Node to be created:", node, "isParentMap:", isParentMap);
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
                  (
                    // Handle component-to-component merging
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
                    ].includes(overlappingNode?.data?.type as MajorComponents) ||
                    // Handle dropping on containers
                    overlappingNode?.type === 'Job' ||
                    overlappingNode?.type === 'Map'
                  )
                  ? (
                      // If overlapping with containers, no state change needed
                      overlappingNode?.type === 'Job' || overlappingNode?.type === 'Map' ? undefined :
                      // If overlapping with same component type, show Add state
                      overlappingNode?.data?.type === dragNode?.data?.type
                        ? MajorComponentsState.Add
                        : MajorComponentsState.NotAdd
                    )
                  : undefined,
            },
          };
        }
        return node;
      })
    );
  };

  const onNodeDragStop: OnNodeDrag = (evt, dragNode) => {
    if (dragNode.type === 'Job' || dragNode.type === 'Map') {
      return;
    }
    if (
      !overlappingNodeRef.current ||
      (overlappingNodeRef?.current?.type !== MajorComponents.Board &&
        overlappingNodeRef?.current?.type !== 'Map' &&
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

    // Handle dynamic subgrouping for Board and Map components
    if (overlappingNodeRef?.current?.type === MajorComponents.Board || 
        overlappingNodeRef?.current?.type === 'Map') {
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

              // Check if the new parent is a Map to set draggable state and position
              const isNewParentMap = overlappingNodeRef?.current?.type === 'Map';
              
              let position;
              
              if (isNewParentMap) {
                // For Map containers, center the component automatically
                const dropZoneMargin = 2;
                const headerHeight = 20;
                const containerHeight = overlappingNodeRef?.current?.measured?.height || 100;
                const containerWidth = overlappingNodeRef?.current?.measured?.width || 200;
                
                const dropZoneWidth = containerWidth - (dropZoneMargin * 2);
                const dropZoneHeight = containerHeight - headerHeight - (dropZoneMargin * 2);
                
                const componentWidth = 180;
                const componentHeight = 55;
                const componentSpacing = 10;
                
                // Count existing components in this Map
                const existingComponents = prevNodes.filter(n => n.parentId === overlappingNodeRef?.current?.id);
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
                  node?.parentId !== overlappingNodeRef?.current?.id
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
                parentId: overlappingNodeRef?.current?.id,
                ...((!dragNode?.parentId ||
                  dragNode?.parentId !== overlappingNodeRef?.current?.id) && {
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
  };

  useKeyBindings({ removeNode, undo, redo });

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.parentId) {
          // Find the parent node to check if it's a Map
          const parentNode = prevNodes.find(n => n.id === node.parentId);
          const isParentMap = parentNode?.type === "Map";
          
          return {
            ...node,
            draggable: isParentMap ? false : showContent, // Components in Map are not draggable
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
            style={{ WebkitBackdropFilter: 'blur(8px)' }} // For Safari support
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