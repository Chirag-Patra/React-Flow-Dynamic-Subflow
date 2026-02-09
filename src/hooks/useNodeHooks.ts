import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import { MajorComponents } from '../types';

// Constants for component positioning and sizing - n8n style horizontal layout (left to right)
const COMPONENT_LAYOUT = {
  // Center components vertically in the board (board height 280, component height 55)
  // Y position: (280 - 55) / 2 ≈ 112, accounting for top buttons = ~100
  basePosition: { x: 30, y: 100 },
  horizontalStep: 220,  // Horizontal spacing between components (component width 180 + gap 40)
  componentSize: { height: 55, width: 180 },
  placeholderSize: { height: 44, width: 44 },  // Square for circular appearance
  placeholderGap: 20  // Gap between component and placeholder
} as const;

/**
 * Hook for managing node operations in ReactFlow
 * Provides optimized functions for creating and manipulating nodes
 */
export function useNodeOperations() {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();

  // Memoized function to create component nodes with placeholders
  // Uses n8n-style horizontal layout - components chained left to right
  const createComponentWithPlaceholder = useCallback((
    parentId: string,
    componentType: MajorComponents,
    onComplete?: () => void
  ) => {
    const nodes = getNodes();

    // Find the rightmost component/placeholder in the parent to chain after it
    const childNodes = nodes.filter(node => node.parentId === parentId);
    let startX = COMPONENT_LAYOUT.basePosition.x;

    if (childNodes.length > 0) {
      // Find the rightmost position
      const maxX = Math.max(...childNodes.map(n => n.position.x + (n.style?.width as number || 180)));
      startX = maxX + COMPONENT_LAYOUT.placeholderGap;
    }

    const { y: baseY } = COMPONENT_LAYOUT.basePosition;
    // Center the placeholder vertically relative to component
    const placeholderY = baseY + (COMPONENT_LAYOUT.componentSize.height - COMPONENT_LAYOUT.placeholderSize.height) / 2;

    const componentNodeId = uuid();
    const placeholderNodeId = uuid();

    const componentNode = {
      id: componentNodeId,
      type: "MajorComponent",
      position: { x: startX, y: baseY },  // Same Y for horizontal line
      data: {
        type: componentType,
        componentType,
        visible: true,
        connectable: true
      },
      parentId,
      extent: "parent" as const,
      expandParent: true,
      style: COMPONENT_LAYOUT.componentSize,
    };

    const placeholderNode = {
      id: placeholderNodeId,
      type: "ComponentPlaceholder",
      position: {
        x: startX + COMPONENT_LAYOUT.componentSize.width + COMPONENT_LAYOUT.placeholderGap,  // Right of component
        y: placeholderY  // Centered vertically
      },
      data: {},
      parentId,
      expandParent: true,
      extent: "parent" as const,
      style: COMPONENT_LAYOUT.placeholderSize,
    };

    const newEdge = {
      id: `${componentNodeId}-${placeholderNodeId}`,
      source: componentNodeId,
      target: placeholderNodeId,
      type: "smoothstep",
    };

    setNodes(nodes => [...nodes, componentNode, placeholderNode]);
    setEdges(edges => [...edges, newEdge]);

    onComplete?.();
  }, [getNodes, setNodes, setEdges]);

  // Optimized batch node updates
  const updateNodesInBatch = useCallback((updateFn: (nodes: any[]) => any[]) => {
    setNodes(updateFn);
  }, [setNodes]);

  // Optimized batch edge updates  
  const updateEdgesInBatch = useCallback((updateFn: (edges: any[]) => any[]) => {
    setEdges(updateFn);
  }, [setEdges]);

  // Get child nodes for a parent efficiently
  const getChildNodes = useCallback((parentId: string) => {
    return getNodes().filter(node => node.parentId === parentId);
  }, [getNodes]);

  // Get child node IDs for a parent
  const getChildNodeIds = useCallback((parentId: string) => {
    return getNodes()
      .filter(node => node.parentId === parentId)
      .map(node => node.id);
  }, [getNodes]);

  return {
    createComponentWithPlaceholder,
    updateNodesInBatch,
    updateEdgesInBatch,
    getChildNodes,
    getChildNodeIds,
    // Re-export for convenience
    setNodes,
    setEdges,
    getNodes,
    getEdges
  };
}

/**
 * Hook for managing board expansion/collapse operations
 * Optimized for performance with batched updates
 */
export function useBoardOperations(nodeId: string) {
  const { setNodes, setEdges } = useReactFlow();
  const { getChildNodeIds } = useNodeOperations();

  // Board size configurations - use fixed default sizes
  // Optimized for n8n-style horizontal layout (wider for left-to-right flow)
  const boardSizes = useMemo(() => {
    return {
      expanded: { height: 280, width: 400, minHeight: 250, minWidth: 350 },
      collapsed: { height: 150, width: 150 } // Always use default size for collapse
    };
  }, []);

  const toggleBoardExpansion = useCallback((
    isExpanded: boolean,
    setIsExpanded: (expanded: boolean) => void
  ) => {
    const newExpandedState = !isExpanded;
    const targetSize = newExpandedState ? boardSizes.expanded : boardSizes.collapsed;

    // Get child node IDs once for efficient processing
    const childIds = getChildNodeIds(nodeId);

    // Update size and show/hide children
    // Also toggle expandParent to prevent hidden children from expanding the parent
    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        // When collapsing, force the node dimensions by setting width/height directly
        // and clearing measured to force React Flow to re-measure
        const updatedNode = {
          ...node,
          style: {
            ...node.style,
            height: targetSize.height,
            width: targetSize.width
          },
          data: { ...node.data, isExpanded: newExpandedState }
        };

        // For collapse, also set width/height directly and clear measured
        if (!newExpandedState) {
          (updatedNode as any).width = targetSize.width;
          (updatedNode as any).height = targetSize.height;
          (updatedNode as any).measured = { width: targetSize.width, height: targetSize.height };
        }

        return updatedNode;
      }

      if (node.parentId === nodeId) {
        return {
          ...node,
          hidden: !newExpandedState,
          // Disable expandParent when collapsed to prevent resizing the parent
          expandParent: newExpandedState,
          // Remove extent constraint when collapsed so React Flow doesn't enforce parent bounds
          extent: newExpandedState ? ("parent" as const) : undefined
        };
      }

      return node;
    }));

    // Hide/show internal edges
    setEdges(edges => edges.map(edge => {
      const isInternalEdge = childIds.includes(edge.source) && childIds.includes(edge.target);
      return isInternalEdge ? { ...edge, hidden: !newExpandedState } : edge;
    }));

    setIsExpanded(newExpandedState);
  }, [nodeId, boardSizes, getChildNodeIds, setNodes, setEdges]);

  return {
    toggleBoardExpansion,
    boardSizes
  };
}

/**
 * Hook for managing ResizeObserver with performance optimizations
 */
export function useOptimizedResizeObserver(
  nodeRef: React.RefObject<HTMLElement>,
  nodeId: string,
  updateNodeInternals: (id: string) => void
) {
  const debouncedUpdateInternals = useMemo(() => {
    let timeoutId: number;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateNodeInternals(nodeId);
      }, 16); // ~60fps
    };
  }, [nodeId, updateNodeInternals]);

  const setupResizeObserver = useCallback(() => {
    const element = nodeRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(debouncedUpdateInternals);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [nodeRef, debouncedUpdateInternals]);

  return { setupResizeObserver };
}