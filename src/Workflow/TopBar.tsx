import { Box, Flex, Text, IconButton } from "@chakra-ui/react";
import { ExportFlow } from "../Components/ExportFlow";
import { ImportFlow } from "../Components/ImportFlow";
import { ClearCanvas } from "../Components/ClearCanvas";
import DownloadBtn from "../Components/DownloadBtn";
import { Node, Edge } from "@xyflow/react";

interface TopBarProps {
  nodes: Node[];
  edges: Edge[];
  onImport: (flow: { nodes?: Node[]; edges?: Edge[] }) => void;
  onClear: () => void;
}

export const TopBar = ({ nodes, edges, onImport, onClear }: TopBarProps) => {
  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={6}
      py={3}
      position="relative"
      zIndex={1000}
    >
      <Flex justify="space-between" align="center">
        <Text
          fontSize="2xl"
          fontWeight="bold"
          fontFamily="cursive"
          sx={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            background: 'linear-gradient(to right, #4f46e5, #af78cfff)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
            _hover: {
              transform: 'scale(1.02)',
              transition: 'transform 0.2s ease-in-out'
            }
          }}
        >
          WorkFlow.io
        </Text>

        <Flex gap={2} align="center">
          <Text
            fontSize="md"
            fontWeight="semibold"
            color="gray.600"
            mr={3}
          >
            Toolbar
          </Text>
          <DownloadBtn />
          <ExportFlow nodes={nodes} edges={edges} />
          <ImportFlow onImport={onImport} />
          <ClearCanvas onClear={onClear} />
        </Flex>
      </Flex>
    </Box>
  );
};