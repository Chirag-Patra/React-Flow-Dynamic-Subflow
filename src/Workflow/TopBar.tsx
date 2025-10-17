import { Box, Flex, Text, Button, Divider, HStack } from "@chakra-ui/react";
import { Node, Edge } from "@xyflow/react";

// Import the refactored, AWS-style buttons
import {
  ExportButton,
  ImportButton,
  ClearCanvasButton,
  DownloadImageButton,
} from "../Components/ToolBar/ToolbarButtons"; // Adjust the path as needed

interface TopBarProps {
  nodes: Node[];
  edges: Edge[];
  onImport: (flow: { nodes?: Node[]; edges?: Edge[] }) => void;
  onClear: () => void;
  workflowName?: string; // Made optional with a default value
}

export const TopBar = ({
  nodes,
  edges,
  onImport,
  onClear,
  workflowName = "", // Provide a default name
}: TopBarProps) => {
  return (
    <Box
      as="header"
      bg="#232F3E" // AWS Console dark header
      color="whiteAlpha.900"
      borderBottom="1px solid"
      borderColor="gray.700"
      px={6}
      py={2}
      position="relative"
      zIndex={1000}
    >
      <Flex justify="space-between" align="center">
        {/* Left Side: Service and Workflow Name */}
        <HStack spacing={4} align="center">
          <Text fontSize="lg" fontWeight="bold">
            Step Functions
          </Text>
          <Divider orientation="vertical" h="20px" borderColor="gray.600" />
          <Text fontSize="md" color="whiteAlpha.800">
            {workflowName}
          </Text>
        </HStack>

        {/* Right Side: Action Buttons */}
        <HStack spacing={2}>
          {/* Integrated Functional Buttons */}
          <DownloadImageButton />
          <ExportButton nodes={nodes} edges={edges} />
          <ImportButton onImport={onImport} />
          <ClearCanvasButton onClear={onClear} />

          {/* Divider before primary action */}
          <Divider orientation="vertical" h="20px" borderColor="gray.600" mx={2} />

        </HStack>
      </Flex>
    </Box>
  );
};