import {
  Box,
  Text,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { COMPONENTS, PARENT } from "../constants"; // Your component arrays
import { MajorComponents } from "../types";

interface LeftSidebarProps {
  onDragStart: (event: React.DragEvent<HTMLDivElement>, type: MajorComponents) => void;
}

// Draggable item, styled for the dark theme (no changes needed here)
const DraggableNode = ({
  component,
  onDragStart,
}: {
  component: { icon: JSX.Element; label: string; type: MajorComponents };
  onDragStart: (event: React.DragEvent<HTMLDivElement>, type: MajorComponents) => void;
}) => {
  return (
    <HStack
      p={2}
      bg="gray.700"
      borderRadius="md"
      w="full"
      cursor="grab"
      transition="background-color 0.2s ease-in-out"
      _hover={{ bg: "gray.600" }}
      _active={{ cursor: "grabbing", bg: "gray.500" }}
      draggable
      onDragStart={(event) => onDragStart(event, component.type)}
    >
      <Box w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
        {component.icon}
      </Box>
      <Text fontSize="sm" fontWeight="medium">
        {component.label}
      </Text>
    </HStack>
  );
};

// The main sidebar component using Tabs
export const LeftSidebar = ({ onDragStart }: LeftSidebarProps) => {
  return (
    <Box
      as="aside"
      w="280px"
      h="calc(100vh - 50px)"
      bg="#232F3E"
      color="whiteAlpha.900"
      borderRight="1px solid"
      borderColor="gray.700"
      position="fixed"
      left={0}
      top="49.5px"
      zIndex={100}
    >
      <Tabs variant="line" colorScheme="blue" h="100%" display="flex" flexDirection="column">
        {/* Tab Buttons */}
        <TabList borderBottomColor="gray.700">
          <Tab
            fontWeight="semibold"
            _selected={{ color: "white", borderColor: "blue.400" }}
            _hover={{ bg: "whiteAlpha.100" }}
            flex="1"
          >
            Framework
          </Tab>
          <Tab
            fontWeight="semibold"
            _selected={{ color: "white", borderColor: "blue.400" }}
            _hover={{ bg: "whiteAlpha.100" }}
            flex="1"
          >
            Components
          </Tab>
        </TabList>

        {/* Tab Content */}
        <TabPanels flex="1" overflowY="auto">
          {/* Components Panel */}
          <TabPanel p={4}>
            <VStack spacing={2} align="stretch">
              {PARENT.map((component) =>
                component ? (
                  <DraggableNode
                    key={component.label}
                    component={component}
                    onDragStart={onDragStart}
                  />
                ) : null
              )}
            </VStack>
          </TabPanel>


          {/* Framework Panel */}
          <TabPanel p={4}>
            <VStack spacing={2} align="stretch">
              {COMPONENTS.map((component) =>
                component ? (
                  <DraggableNode
                    key={component.label}
                    component={component}
                    onDragStart={onDragStart}
                  />
                ) : null
              )}
            </VStack>
          </TabPanel>


        </TabPanels>
      </Tabs>
    </Box>
  );
};