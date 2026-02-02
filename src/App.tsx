import { ChakraProvider, Box } from "@chakra-ui/react";
import { Workflow } from "./Workflow/Workflow";
import { TopBar } from "./Workflow/TopBar";
import LandingPage from "./Workflow/LandingPage";
import "./index.css";
import { ReactFlowProvider, Node, Edge } from "@xyflow/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useCallback, memo } from "react";
import { initialNodes, initialEdges } from "./constants";

// Optimized QueryClient configuration with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (was cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showLanding, setShowLanding] = useState(true);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleImport = useCallback((flow: { nodes?: Node[]; edges?: Edge[] }) => {
    setNodes(flow.nodes || []);
    setEdges(flow.edges || []);
  }, []);

  const handleClear = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const handleLandingFinish = useCallback(() => {
    setShowLanding(false);
  }, []);

  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <ReactFlowProvider>
          <Box height="100vh" width="100vw" overflow="hidden" position="relative">

            {/* MAIN APP CONTENT */}
            {/* We render this behind the landing page so it's ready when the cover slides up.
                opacity and pointerEvents ensure it doesn't interfere while Landing is active. */}
            <Box
              height="100%"
              width="100%"
              opacity={showLanding ? 0 : 1}
              transition="opacity 0.5s ease-in"
              pointerEvents={showLanding ? "none" : "all"}
            >
              {/* Top Bar */}
              <TopBar
                nodes={nodes}
                edges={edges}
                onImport={handleImport}
                onClear={handleClear}
              />

              {/* Workflow Canvas */}
              <Box height="calc(100vh - 60px)" overflow="hidden">
                <Workflow
                  nodes={nodes}
                  edges={edges}
                  setNodes={setNodes}
                  setEdges={setEdges}
                />
              </Box>
            </Box>

            {/* LANDING PAGE OVERLAY */}
            {/* Rendered conditionally; zIndex ensures it stays on top of TopBar */}
            {showLanding && (
              <LandingPage onFinish={handleLandingFinish} />
            )}

          </Box>
        </ReactFlowProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

// Export memoized component for better performance
export default memo(App);