import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import { MajorComponents } from '../types';

// Constants for component positioning and sizing
const COMPONENT_LAYOUT = {
  basePosition: { x: 50, y: 80 },
  offsetStep: 80,
  componentSize: { height: 60, width: 180 },
  placeholderSize: { height: 60, width: 100 },
  placeholderOffset: 200
} as const;

/**
 * Hook for managing node operations in ReactFlow
 * Provides optimized functions for creating and manipulating nodes
 */
export function useNodeOperations() {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();

  // Memoized function to create component nodes with placeholders
  const createComponentWithPlaceholder = useCallback((
    parentId: string,
    componentType: MajorComponents,
    onComplete?: () => void
  ) => {
    const nodes = getNodes();
    const existingComponentsCount = nodes.filter(node =>
      node.parentId === parentId && node.type !== "ComponentPlaceholder"
    ).length;
    
    const yOffset = existingComponentsCount * COMPONENT_LAYOUT.offsetStep;
    const { x: baseX, y: baseY } = COMPONENT_LAYOUT.basePosition;

    const componentNodeId = uuid();
    const placeholderNodeId = uuid();

    const componentNode = {
      id: componentNodeId,
      type: "MajorComponent",
      position: { x: baseX, y: baseY + yOffset },
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
        x: baseX + COMPONENT_LAYOUT.placeholderOffset, 
        y: baseY + yOffset 
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
  const { setNodes, setEdges, getNode, getNodes, getEdges, updateNode } = useReactFlow();
  const { getChildNodeIds } = useNodeOperations();

  // Board size configurations - use fixed default sizes
  const boardSizes = useMemo(() => {
    return {
      expanded: { height: 400, width: 500, minHeight: 300, minWidth: 300 },
      collapsed: { height: 200, width: 200 } // Always use default size for collapse
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

    // Simple approach - just update the size and show/hide children
    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          style: { 
            ...node.style, 
            height: targetSize.height, 
            width: targetSize.width 
          },
          data: { ...node.data, isExpanded: newExpandedState }
        };
      }
      
      if (node.parentId === nodeId) {
        return { ...node, hidden: !newExpandedState };
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