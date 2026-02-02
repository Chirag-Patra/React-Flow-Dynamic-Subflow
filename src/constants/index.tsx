import { Edge, Node } from "@xyflow/react";
import { MajorComponents } from "../types";
import { Email, Python, Lamda, GlueJob, Eks, Stepfunction } from "../icons";
import { Box } from "@chakra-ui/react";
import { memo } from "react";

// ============================================================================
// INITIAL STATE
// ============================================================================
export const initialEdges: Edge[] = [];

export const initialNodes: Node[] = [
  {
    id: "placeholder-start",
    type: "PlaceholderNode",
    position: { x: 200, y: 200 },
    data: {},
    style: { height: 150, width: 200 },
  },
];

// ============================================================================
// OPTIMIZED ICON COMPONENTS & STYLES
// ============================================================================

// Consolidated and optimized styles as const assertions for better performance
const ICON_STYLES = {
  map: {
    height: "25px",
    width: "25px", 
    borderRadius: "4px",
    border: "2px solid red",
    background: "rgba(255, 100, 100, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: "bold",
  },
  placeholder: {
    height: "30px",
    width: "30px",
    borderRadius: "4px", 
    border: "2px dashed #4A5568",
    background: "rgba(99, 179, 237, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#63B3ED",
  },
  job: {
    height: "30px",
    width: "30px",
    borderRadius: "4px",
    border: "1px solid black",
  },
  etlo: {
    height: "30px",
    width: "30px",
    borderRadius: "4px",
    border: "2px solid green",
    background: "rgba(50, 200, 50, 0.2)",
    display: "flex",
    alignItems: "center", 
    justifyContent: "center",
    fontSize: "8px",
    fontWeight: "bold",
  },
  batchETLO: {
    height: "30px",
    width: "30px",
    borderRadius: "4px",
    border: "2px solid #48bb78",
    background: "rgba(72, 187, 120, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center", 
    fontSize: "7px",
    fontWeight: "bold",
  },
} as const;

// Memoized icon components with display names for debugging
const EmailIcon = memo(() => <Email height={40} />);
const PythonIcon = memo(() => <Python height={40} />);
const LamdaIcon = memo(() => <Lamda height={40} />);
const GlueJobIcon = memo(() => <GlueJob height={40} />);
const EksIcon = memo(() => <Eks height={40} />);
const StepfunctionIcon = memo(() => <Stepfunction height={40} />);
const MapIcon = memo(() => <Box sx={ICON_STYLES.map}>MAP</Box>);
const PlaceholderIcon = memo(() => <Box sx={ICON_STYLES.placeholder}>+</Box>);
const JobIcon = memo(() => <Box sx={ICON_STYLES.job} />);
const ETLOIcon = memo(() => <Box sx={ICON_STYLES.etlo}>ETLO</Box>);
const BatchETLOIcon = memo(() => <Box sx={ICON_STYLES.batchETLO}>BATCH</Box>);

// Set display names for better debugging
EmailIcon.displayName = "EmailIcon";
PythonIcon.displayName = "PythonIcon"; 
LamdaIcon.displayName = "LamdaIcon";
GlueJobIcon.displayName = "GlueJobIcon";
EksIcon.displayName = "EksIcon";
StepfunctionIcon.displayName = "StepfunctionIcon";
MapIcon.displayName = "MapIcon";
PlaceholderIcon.displayName = "PlaceholderIcon";
JobIcon.displayName = "JobIcon";
ETLOIcon.displayName = "ETLOIcon";
BatchETLOIcon.displayName = "BatchETLOIcon";

// ============================================================================
// COMPONENT CONFIGURATIONS
// ============================================================================

// Frozen component arrays for optimal performance
export const COMPONENTS = Object.freeze([
  Object.freeze({
    icon: <EmailIcon />,
    type: MajorComponents.Email_notification,
    label: "Email Notification",
  }),
  Object.freeze({
    icon: <PythonIcon />,
    type: MajorComponents.Execute_Py,
    label: "Execute Py",
  }),
  Object.freeze({
    icon: <LamdaIcon />,
    type: MajorComponents.Run_Lamda,
    label: "Run Lambda",
  }),
  Object.freeze({
    icon: <GlueJobIcon />,
    type: MajorComponents.Run_GlueJob,
    label: "Run Glue Job",
  }),
  Object.freeze({
    icon: <EksIcon />,
    type: MajorComponents.Run_Eks,
    label: "Run EKS",
  }),
  Object.freeze({
    icon: <StepfunctionIcon />,
    type: MajorComponents.Run_StepFunction,
    label: "Run Step Function",
  }),
  Object.freeze({
    icon: <MapIcon />,
    type: MajorComponents.Map,
    label: "Map",
  }),
]);

export const PARENT = Object.freeze([
  Object.freeze({
    icon: <JobIcon />,
    type: MajorComponents.Board,
    label: "Job",
  }),
  Object.freeze({
    icon: <ETLOIcon />,
    type: MajorComponents.ETLO,
    label: "ETLO",
  }),
  Object.freeze({
    icon: <BatchETLOIcon />,
    type: MajorComponents.BatchETLO,
    label: "BatchETLO",
  }),
]);

// ============================================================================
// PLACEHOLDER CONFIGURATION
// ============================================================================

export interface PlaceholderPosition {
  x: number;
  y: number;
}

export interface PlaceholderConfig {
  count: number;
  positions: readonly PlaceholderPosition[];
}

// Optimized placeholder configurations with frozen positions
export const PLACEHOLDER_CONFIG: Readonly<Partial<Record<MajorComponents, PlaceholderConfig>>> = Object.freeze({
  [MajorComponents.BatchETLO]: Object.freeze({
    count: 3,
    positions: Object.freeze([
      Object.freeze({ x: 250, y: 0 }),   // Right
      Object.freeze({ x: 0, y: -250 }),  // Top
      Object.freeze({ x: -250, y: 0 }),  // Left
    ]),
  }),
  [MajorComponents.ETLO]: Object.freeze({
    count: 1,
    positions: Object.freeze([
      Object.freeze({ x: 250, y: 0 }),   // Right
    ]),
  }),
  [MajorComponents.Board]: Object.freeze({
    count: 1,
    positions: Object.freeze([
      Object.freeze({ x: 250, y: 0 }),   // Right
    ]),
  }),
});

// Default configuration
const DEFAULT_PLACEHOLDER_CONFIG: PlaceholderConfig = Object.freeze({
  count: 1,
  positions: Object.freeze([
    Object.freeze({ x: 250, y: 0 }), // Default: single placeholder to the right
  ]),
});

/**
 * Get the placeholder configuration for a specific component type
 * @param componentType - The component type to get configuration for  
 * @returns The placeholder configuration
 */
export const getPlaceholderConfig = (componentType: MajorComponents): PlaceholderConfig => {
  return PLACEHOLDER_CONFIG[componentType] ?? DEFAULT_PLACEHOLDER_CONFIG;
};

/**
 * Check if a component should create multiple placeholders
 * @param componentType - The component type to check
 * @returns True if the component creates multiple placeholders
 */
export const hasMultiplePlaceholders = (componentType: MajorComponents): boolean => {
  return getPlaceholderConfig(componentType).count > 1;
};

/**
 * Get the number of placeholders for a component type
 * @param componentType - The component type to check
 * @returns The number of placeholders
 */
export const getPlaceholderCount = (componentType: MajorComponents): number => {
  return getPlaceholderConfig(componentType).count;
};

// ============================================================================
// CONNECTION RULES - Optimized with Sets and Maps
// ============================================================================

// Optimized connection rules using Maps and Sets for O(1) lookup
const CONNECTION_RULES_MAP = new Map<MajorComponents, Set<MajorComponents>>([
  [MajorComponents.Board, new Set([
    MajorComponents.ETLO,
    MajorComponents.BatchETLO,
    MajorComponents.Board,
    MajorComponents.Map,
    MajorComponents.Execute_Py,
    MajorComponents.Email_notification,
    MajorComponents.Run_Lamda,
    MajorComponents.Run_GlueJob,
    MajorComponents.Run_Eks,
    MajorComponents.Run_StepFunction,
    MajorComponents.Ingestion,
  ])],
  [MajorComponents.ETLO, new Set([
    MajorComponents.Board,
    MajorComponents.ETLO,
    MajorComponents.BatchETLO
  ])],
  [MajorComponents.BatchETLO, new Set([
    MajorComponents.Board,
    MajorComponents.ETLO,
    MajorComponents.BatchETLO
  ])],
  [MajorComponents.Map, new Set()],
  [MajorComponents.Execute_Py, new Set()],
  [MajorComponents.Email_notification, new Set()],
  [MajorComponents.Run_Lamda, new Set()],
  [MajorComponents.Run_GlueJob, new Set()],
  [MajorComponents.Run_Eks, new Set()],
  [MajorComponents.Run_StepFunction, new Set()],
  [MajorComponents.Ingestion, new Set()],
  [MajorComponents.PlaceholderNode, new Set([
    MajorComponents.Board,
    MajorComponents.ETLO,
    MajorComponents.BatchETLO,
    MajorComponents.Map,
  ])],
  [MajorComponents.Js, new Set()],
  [MajorComponents.Aws, new Set()],
  [MajorComponents.Db, new Set()],
]);

// Pre-compute reverse lookup map for which parents accept which children
const REVERSE_CONNECTION_MAP = new Map<MajorComponents, Set<MajorComponents>>();

// Build reverse map once on module load
CONNECTION_RULES_MAP.forEach((children, parent) => {
  children.forEach(child => {
    if (!REVERSE_CONNECTION_MAP.has(child)) {
      REVERSE_CONNECTION_MAP.set(child, new Set());
    }
    REVERSE_CONNECTION_MAP.get(child)!.add(parent);
  });
});

// Legacy export for backwards compatibility
export const CONNECTION_RULES: Readonly<Record<MajorComponents, readonly MajorComponents[]>> =
  Object.freeze(
    Object.fromEntries(
      Array.from(CONNECTION_RULES_MAP.entries()).map(([key, value]) => 
        [key, Object.freeze(Array.from(value))]
      )
    ) as Record<MajorComponents, readonly MajorComponents[]>
  );

/**
 * Optimized connection validation using Set for O(1) lookup
 * @param sourceType - The source component type
 * @param targetType - The target component type
 * @returns True if connection is valid
 */
export const isValidConnection = (
  sourceType: MajorComponents,
  targetType: MajorComponents
): boolean => {
  const allowedTargets = CONNECTION_RULES_MAP.get(sourceType);
  return allowedTargets?.has(targetType) ?? false;
};

/**
 * Get allowed child components for a parent type
 * @param parentType - The parent component type
 * @returns Array of allowed child component types
 */
export const getAllowedChildren = (parentType: MajorComponents): readonly MajorComponents[] => {
  const children = CONNECTION_RULES_MAP.get(parentType);
  return children ? Object.freeze(Array.from(children)) : Object.freeze([]);
};

// ============================================================================
// FILTERED PARENTS CACHE - Ultra-fast lookups
// ============================================================================

// Pre-computed cache for filtered parents
const FILTERED_PARENTS_CACHE = new Map<MajorComponents | "undefined", readonly (typeof PARENT)[number][]>();

// Pre-compute all possible filtered parent results
const precomputeFilteredParents = (): void => {
  // Cache for undefined/null case
  FILTERED_PARENTS_CACHE.set("undefined", PARENT);

  // Pre-compute for all possible component types
  Object.values(MajorComponents).forEach(componentType => {
    const parents = REVERSE_CONNECTION_MAP.get(componentType as MajorComponents);
    const filtered = parents
      ? Object.freeze(PARENT.filter(parent => parents.has(parent.type)))
      : Object.freeze([]);
    FILTERED_PARENTS_CACHE.set(componentType as MajorComponents, filtered);
  });
};

// Run pre-computation on module load
precomputeFilteredParents();

/**
 * Ultra-fast filtered parents lookup using pre-computed cache
 * @param sourceNodeType - The source node type to filter by
 * @returns Array of parent components that can accept this source type
 */
export const getFilteredParents = (sourceNodeType?: MajorComponents): readonly (typeof PARENT)[number][] => {
  const key = sourceNodeType ?? "undefined";
  return FILTERED_PARENTS_CACHE.get(key) ?? PARENT;
};

/**
 * Clear and rebuild the filtered parents cache (only needed if rules change at runtime)
 */
export const clearFilteredParentsCache = (): void => {
  FILTERED_PARENTS_CACHE.clear();
  precomputeFilteredParents();
};

/**
 * Type guard for better performance and type safety
 * @param type - The type to check
 * @returns True if the type is a valid MajorComponent
 */
export const isMajorComponent = (type: string): type is MajorComponents => {
  return CONNECTION_RULES_MAP.has(type as MajorComponents);
};