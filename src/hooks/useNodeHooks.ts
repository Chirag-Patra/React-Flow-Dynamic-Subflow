import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import { MajorComponents } from '../types';

// Storage key prefix for board sizes
const BOARD_SIZE_STORAGE_KEY = 'board-expanded-size-';

export function getStoredBoardSize(nodeId: string): { width: number; height: number } | null {
  try {
    const stored = localStorage.getItem(BOARD_SIZE_STORAGE_KEY + nodeId);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
}

export function storeBoardSize(nodeId: string, width: number, height: number): void {
  try {
    localStorage.setItem(BOARD_SIZE_STORAGE_KEY + nodeId, JSON.stringify({ width, height }));
  } catch {
    // Ignore localStorage errors
  }
}

// Constants for component positioning and sizing - vertical layout (top to bottom)
const COMPONENT_LAYOUT = {
  // Start position inside the board, accounting for top buttons
  basePosition: { x: 30, y: 50 },
  componentSize: { height: 55, width: 180 },
  placeholderSize: { height: 44, width: 44 },  // Square for circular appearance
  placeholderGap: 10  // Reduced gap between component and placeholder for tighter spacing
} as const;

/**
 * Hook for managing node operations in ReactFlow
 * Provides optimized functions for creating and manipulating nodes
 */
export function useNodeOperations() {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();

  // Memoized function to create component nodes with placeholders
  // Uses vertical layout - components chained top to bottom
  const createComponentWithPlaceholder = useCallback((
    parentId: string,
    componentType: MajorComponents,
    onComplete?: () => void
  ) => {
    const nodes = getNodes();

    // Find the bottommost component/placeholder in the parent to chain after it
    const childNodes = nodes.filter(node => node.parentId === parentId);
    let startY = COMPONENT_LAYOUT.basePosition.y;

    if (childNodes.length > 0) {
      // Find the bottommost position
      const maxY = Math.max(...childNodes.map(n => n.position.y + (n.style?.height as number || 55)));
      startY = maxY + COMPONENT_LAYOUT.placeholderGap;
    }

    const { x: baseX } = COMPONENT_LAYOUT.basePosition;
    // Center the placeholder horizontally relative to component
    const placeholderX = baseX + (COMPONENT_LAYOUT.componentSize.width - COMPONENT_LAYOUT.placeholderSize.width) / 2;

    const componentNodeId = uuid();
    const placeholderNodeId = uuid();

    const componentNode = {
      id: componentNodeId,
      type: "MajorComponent",
      position: { x: baseX, y: startY },  // Same X for vertical line
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
        x: placeholderX,  // Centered horizontally
        y: startY + COMPONENT_LAYOUT.componentSize.height + COMPONENT_LAYOUT.placeholderGap  // Below component
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

    // Get child node IDs once for efficient processing
    const childIds = getChildNodeIds(nodeId);

    // Determine target size - use stored size when expanding, default collapsed size when collapsing
    let targetSize: { width: number; height: number };
    if (newExpandedState) {
      const storedSize = getStoredBoardSize(nodeId);
      targetSize = storedSize || { width: boardSizes.expanded.width, height: boardSizes.expanded.height };
    } else {
      targetSize = boardSizes.collapsed;
    }

    // Update size and show/hide children
    // Also toggle expandParent to prevent hidden children from expanding the parent
    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        // Force the node dimensions by setting width/height directly
        // and measured to force React Flow to use these dimensions
        const updatedNode = {
          ...node,
          width: targetSize.width,
          height: targetSize.height,
          measured: { width: targetSize.width, height: targetSize.height },
          style: {
            ...node.style,
            height: targetSize.height,
            width: targetSize.width
          },
          data: { ...node.data, isExpanded: newExpandedState }
        };

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