import { Box, Flex, Text, Button, Divider, HStack } from "@chakra-ui/react";
import { Node, Edge } from "@xyflow/react";
import CarelonLogo from "../logo/carelonlogo";

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
      bg="linear-gradient(135deg, #131d2eff 0%, #1b2f60ff 50%, #2e519dff 100%)"
      color="whiteAlpha.900"
      borderBottom="4px solid"
      borderColor="purple.400"
      px={6}
      py={4}
      position="relative"
      zIndex={1000}
      height="60px"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.15)"
    >
      <Flex justify="space-between" align="center" height="100%">
        {/* Left Side: Logo, Service and Workflow Name */}
        <HStack spacing={4} align="center">
          <Box
            p={1}
            borderRadius="md"
            bg="whiteAlpha.100"
            transition="all 0.2s"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            <CarelonLogo width={40} height={40} role="img" aria-label="Carelon logo" />
          </Box>
          <Divider
            orientation="vertical"
            h="32px"
            borderColor="purple.300"
            opacity={0.5}
            borderWidth="1px"
          />
          <Text
            fontSize="lg"
            fontWeight="600"
            letterSpacing="0.5px"
            color="white"
          >
            Workflow
          </Text>
          {workflowName && (
            <>
              <Text fontSize="lg" color="purple.300" fontWeight="300">
                /
              </Text>
              <Text
                fontSize="md"
                color="purple.200"
                fontWeight="500"
                bg="whiteAlpha.100"
                px={3}
                py={1}
                borderRadius="md"
              >
                {workflowName}
              </Text>
            </>
          )}
        </HStack>

        {/* Right Side: Action Buttons */}
        <HStack spacing={2}>
          {/* Integrated Functional Buttons */}
          <DownloadImageButton />
          <ExportButton nodes={nodes} edges={edges} />
          <ImportButton onImport={onImport} />
          <ClearCanvasButton onClear={onClear} />

          {/* Divider before primary action */}
          <Divider
            orientation="vertical"
            h="32px"
            borderColor="purple.300"
            opacity={0.5}
            borderWidth="1px"
            mx={2}
          />
        </HStack>
      </Flex>
    </Box>
  );
};