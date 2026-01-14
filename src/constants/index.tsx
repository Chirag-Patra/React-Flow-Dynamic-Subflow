import { Edge, Node } from "@xyflow/react";
import { MajorComponents } from "../types";
import { Email, Python, Lamda, GlueJob, Eks, Stepfunction } from "../icons";
import { Box } from "@chakra-ui/react";
import { memo } from "react";

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

// Memoized icon components with inline styles to prevent Chakra re-calculations
const EmailIcon = memo(() => <Email height={40} />);
const PythonIcon = memo(() => <Python height={40} />);
const LamdaIcon = memo(() => <Lamda height={40} />);
const GlueJobIcon = memo(() => <GlueJob height={40} />);
const EksIcon = memo(() => <Eks height={40} />);
const StepfunctionIcon = memo(() => <Stepfunction height={40} />);

// Pre-rendered static styles for icons to avoid recalculation
const mapIconStyle = {
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
};

const placeholderIconStyle = {
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
};

const jobIconStyle = {
  height: "30px",
  width: "30px",
  borderRadius: "4px",
  border: "1px solid black",
};

const etloIconStyle = {
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
};

const batchETLOIconStyle = {
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
};

const MapIcon = memo(() => <Box sx={mapIconStyle}>MAP</Box>);
const PlaceholderIcon = memo(() => <Box sx={placeholderIconStyle}>+</Box>);
const JobIcon = memo(() => <Box sx={jobIconStyle} />);
const ETLOIcon = memo(() => <Box sx={etloIconStyle}>ETLO</Box>);
const BatchETLOIcon = memo(() => <Box sx={batchETLOIconStyle}>BATCH</Box>);

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

// Pre-instantiate icons once to avoid recreation
const iconInstances = {
  email: <EmailIcon />,
  python: <PythonIcon />,
  lamda: <LamdaIcon />,
  glueJob: <GlueJobIcon />,
  eks: <EksIcon />,
  stepfunction: <StepfunctionIcon />,
  map: <MapIcon />,
  placeholder: <PlaceholderIcon />,
  job: <JobIcon />,
  etlo: <ETLOIcon />,
  batchETLO: <BatchETLOIcon />,
};

export const COMPONENTS = [
  {
    icon: iconInstances.email,
    type: MajorComponents.Email_notification,
    label: "Email Notification",
  },
  {
    icon: iconInstances.python,
    type: MajorComponents.Execute_Py,
    label: "Execute Py",
  },
  {
    icon: iconInstances.lamda,
    type: MajorComponents.Run_Lamda,
    label: "Run Lamda",
  },
  {
    icon: iconInstances.glueJob,
    type: MajorComponents.Run_GlueJob,
    label: "Run GlueJob",
  },
  {
    icon: iconInstances.eks,
    type: MajorComponents.Run_Eks,
    label: "Run Eks",
  },
  {
    icon: iconInstances.stepfunction,
    type: MajorComponents.Run_StepFunction,
    label: "Run StepFunction",
  },
  {
    icon: iconInstances.map,
    type: MajorComponents.Map,
    label: "Map",
  },
];

export const PARENT = [
  {
    icon: iconInstances.job,
    type: MajorComponents.Board,
    label: "Job",
  },
  {
    icon: iconInstances.etlo,
    type: MajorComponents.ETLO,
    label: "ETLO",
  },
  {
    icon: iconInstances.batchETLO,
    type: MajorComponents.BatchETLO,
    label: "BatchETLO",
  },
];

// Freeze arrays to prevent accidental mutations and enable engine optimizations
Object.freeze(COMPONENTS);
Object.freeze(PARENT);

// ============================================================================
// PLACEHOLDER CONFIGURATION - Dynamic placeholder positioning for each node type
// ============================================================================

export interface PlaceholderPosition {
  x: number;
  y: number;
}

export interface PlaceholderConfig {
  count: number;
  positions: PlaceholderPosition[];
}

// Configuration for how many placeholders each component type should create
export const PLACEHOLDER_CONFIG: Partial<Record<MajorComponents, PlaceholderConfig>> = {
  // BatchETLO creates 2 placeholders: one right, one below
  [MajorComponents.BatchETLO]: {
    count: 3,
    positions: [
      { x: 250, y: 0 },   // Right
      { x: 0, y: -250 },
      { x: -250, y: 0 },   // Left
    ],
  },

  // ETLO creates 2 placeholders: one right, one below
  [MajorComponents.ETLO]: {
    count: 1,
    positions: [
      { x: 250, y: 0 },   // Right
      //{ x: 0, y: 250 },   // Below
    ],
  },

  // Board/Job creates 1 placeholder to the right
  [MajorComponents.Board]: {
    count: 1,
    positions: [
      { x: 250, y: 0 },   // Right
    ],
  },

  // Example: Map could have 3 placeholders in different directions
  // [MajorComponents.Map]: {
  //   count: 3,
  //   positions: [
  //     { x: 250, y: 0 },    // Right
  //     { x: 0, y: 250 },    // Below
  //     { x: -250, y: 0 },   // Left
  //   ],
  // },
};

// Default configuration for components not specified above
const DEFAULT_PLACEHOLDER_CONFIG: PlaceholderConfig = {
  count: 1,
  positions: [
    { x: 250, y: 0 }, // Default: single placeholder to the right
  ],
};

/**
 * Get the placeholder configuration for a specific component type
 * @param componentType - The component type to get configuration for
 * @returns The placeholder configuration
 */
export const getPlaceholderConfig = (componentType: MajorComponents): PlaceholderConfig => {
  return PLACEHOLDER_CONFIG[componentType] || DEFAULT_PLACEHOLDER_CONFIG;
};

/**
 * Check if a component should create multiple placeholders
 * @param componentType - The component type to check
 * @returns True if the component creates multiple placeholders
 */
export const hasMultiplePlaceholders = (componentType: MajorComponents): boolean => {
  const config = getPlaceholderConfig(componentType);
  return config.count > 1;
};

/**
 * Get the number of placeholders for a component type
 * @param componentType - The component type to check
 * @returns The number of placeholders
 */
export const getPlaceholderCount = (componentType: MajorComponents): number => {
  const config = getPlaceholderConfig(componentType);
  return config.count;
};

// ============================================================================
// CONNECTION RULES
// ============================================================================

// Optimized connection rules using Sets for O(1) lookup
const connectionRulesMap = new Map<MajorComponents, Set<MajorComponents>>([
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
  [MajorComponents.ETLO, new Set([MajorComponents.Board,MajorComponents.ETLO, MajorComponents.BatchETLO])],
  [MajorComponents.BatchETLO, new Set([MajorComponents.Board, MajorComponents.ETLO,MajorComponents.BatchETLO])],
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

// Pre-compute reverse lookup map for better performance (which parents accept which children)
const reverseConnectionMap = new Map<MajorComponents, Set<MajorComponents>>();

// Build reverse map once
connectionRulesMap.forEach((children, parent) => {
  children.forEach(child => {
    if (!reverseConnectionMap.has(child)) {
      reverseConnectionMap.set(child, new Set());
    }
    reverseConnectionMap.get(child)!.add(parent);
  });
});

// Export as regular object for backwards compatibility (frozen for performance)
export const CONNECTION_RULES: Readonly<Record<MajorComponents, MajorComponents[]>> =
  Object.freeze(
    Object.fromEntries(
      Array.from(connectionRulesMap.entries()).map(([key, value]) => [key, Object.freeze(Array.from(value))])
    ) as Record<MajorComponents, MajorComponents[]>
  );

// Optimized validation using Set for O(1) lookup
export const isValidConnection = (
  sourceType: MajorComponents,
  targetType: MajorComponents
): boolean => {
  const allowedTargets = connectionRulesMap.get(sourceType);
  return allowedTargets ? allowedTargets.has(targetType) : false;
};

// Helper function to get allowed child components for a parent
export const getAllowedChildren = (parentType: MajorComponents): readonly MajorComponents[] => {
  const children = connectionRulesMap.get(parentType);
  return children ? Array.from(children) : [];
};

// Optimized cache with WeakMap for automatic garbage collection
const filteredParentsCache = new Map<MajorComponents | "undefined", readonly typeof PARENT[number][]>();

// Pre-compute all possible filtered parent results on initialization
const precomputeFilteredParents = () => {
  // Cache for undefined/null case
  filteredParentsCache.set("undefined", PARENT);

  // Pre-compute for all possible component types
  Object.values(MajorComponents).forEach(componentType => {
    const parents = reverseConnectionMap.get(componentType as MajorComponents);
    const filtered = parents
      ? PARENT.filter(parent => parents.has(parent.type))
      : [];
    filteredParentsCache.set(componentType as MajorComponents, Object.freeze(filtered));
  });
};

// Run pre-computation immediately
precomputeFilteredParents();

// Ultra-fast filtered parents lookup (now just a Map.get)
export const getFilteredParents = (sourceNodeType?: MajorComponents): readonly typeof PARENT[number][] => {
  const key = sourceNodeType ?? "undefined";
  return filteredParentsCache.get(key) ?? PARENT;
};

// Optional: Clear cache function (only needed if rules change at runtime)
export const clearFilteredParentsCache = () => {
  filteredParentsCache.clear();
  precomputeFilteredParents();
};

// Type guard for better performance
export const isMajorComponent = (type: string): type is MajorComponents => {
  return connectionRulesMap.has(type as MajorComponents);
};