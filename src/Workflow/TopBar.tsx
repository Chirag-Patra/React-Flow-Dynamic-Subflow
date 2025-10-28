import { Box, Flex, Text, Button, Divider, HStack, Image } from "@chakra-ui/react";
import { Node, Edge } from "@xyflow/react";
import ElevanceLogo from "../logo/Elevance_logo.png";

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
      bg="#20376F" // Updated background color
      color="whiteAlpha.900"
      borderBottom="1px solid"
      borderColor="gray.700"
      px={6}
      py={4} // Increased padding for more height
      position="relative"
      zIndex={1000}
      height="60px" // Set explicit height
    >
      <Flex justify="space-between" align="center" height="100%">
        {/* Left Side: Logo, Service and Workflow Name */}
        <HStack spacing={4} align="center">
          <Image src={ElevanceLogo} alt="Elevance Logo" height="40px" objectFit="contain" />
          <Divider orientation="vertical" h="30px" borderColor="gray.600" />
          <Text fontSize="lg" fontWeight="bold">
            Workflow
          </Text>
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
          <Divider orientation="vertical" h="30px" borderColor="gray.600" mx={2} />

        </HStack>
      </Flex>
    </Box>
  );
};