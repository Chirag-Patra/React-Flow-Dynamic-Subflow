import { ChakraProvider, Box } from "@chakra-ui/react";
import { Workflow } from "./Workflow/Workflow";
import { TopBar } from "./Workflow/TopBar";
import "./index.css";
import { ReactFlowProvider } from "@xyflow/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Node, Edge } from "@xyflow/react";

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

  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <ReactFlowProvider>
          <Box height="100vh" width="100vw" overflow="hidden">
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

            {/* Main Content */}
            <Box height="calc(100vh - 60px)" overflow="hidden">
              <Workflow
                nodes={nodes}
                edges={edges}
                setNodes={setNodes}
                setEdges={setEdges}
              />
            </Box>
          </Box>
        </ReactFlowProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;