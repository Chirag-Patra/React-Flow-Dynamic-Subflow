import { ChakraProvider, Box } from "@chakra-ui/react";
import { Workflow } from "./Workflow/Workflow";
import { TopBar } from "./Workflow/TopBar";
import LandingPage from "./Workflow/LandingPage";
import "./index.css";
import { ReactFlowProvider, Node, Edge } from "@xyflow/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 0,
    },
  },
});

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showLanding, setShowLanding] = useState(true);

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
                onImport={(flow) => {
                  setNodes(flow.nodes || []);
                  setEdges(flow.edges || []);
                }}
                onClear={() => {
                  setNodes([]);
                  setEdges([]);
                }}
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
              <LandingPage
                onFinish={() => {
                  setShowLanding(false);
                }}
              />
            )}

          </Box>
        </ReactFlowProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;