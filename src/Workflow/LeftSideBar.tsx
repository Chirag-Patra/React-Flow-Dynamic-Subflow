import {
  Box,
  Flex,
  Text,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack
} from "@chakra-ui/react";
import { COMPONENTS, PARENT} from "../constants";
import { MajorComponents } from "../types";

interface LeftSidebarProps {
  onDragStart: (event: React.DragEvent<HTMLDivElement>, type: MajorComponents) => void;
}

// Component item with icon and label
const ComponentItem = ({
  component,
  onDragStart
}: {
  component: any;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, type: MajorComponents) => void;
}) => {
  return (
    <HStack
      spacing={3}
      p={2}
      bg="gray.100"
      borderRadius="sm"
      w="full"
      align="center"
      cursor="grab"
      transition="all 0.2s"
      _hover={{
        transform: 'translateX(4px)',
        boxShadow: 'md',
        bg: "gray.200"
      }}
      _active={{
        cursor: "grabbing",
        transform: 'translateX(2px)',
      }}
      draggable
      onDragStart={(event) => onDragStart(event, component.type)}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="40px"
        h="40px"
        bg="white"
        borderRadius="md"
        boxShadow="sm"
        p={1}
      >
        {component.icon}
      </Box>
      <Text
        fontSize="sm"
        fontWeight="medium"
        color="gray.700"
      >
        {component.label}
      </Text>
    </HStack>
  );
};

export const LeftSidebar = ({ onDragStart }: LeftSidebarProps) => {
  return (
    <Box
      as="aside"
      w="280px"
      h="calc(100vh - 60px)" // Subtract header height
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      overflowY="auto"
      position="fixed"
      left={0}
      top="60px" // Header height
      zIndex={100}
    >
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList px={4} pt={4}>
          <Tab>Framework</Tab>
          <Tab>Components</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={4} py={4}>
            {/* Actions Tab - Components */}
            <Box>
              {/* <Text
                fontSize="md"
                fontWeight="semibold"
                mb={3}
                color="gray.700"
              >
                Components
              </Text> */}

              {/* List view of components with labels */}
              <VStack spacing={2} align="stretch">
                {COMPONENTS.map((component) =>
                  component ? (
                    <ComponentItem
                      key={component.label}
                      component={component}
                      onDragStart={onDragStart}
                    />
                  ) : null
                )}
              </VStack>
            </Box>
          </TabPanel>

          <TabPanel px={4} py={4}>
            {/* Flow Tab - Future flow management features */}
             <Box>
              {/* <Text
                fontSize="md"
                fontWeight="semibold"
                mb={3}
                color="gray.700"
              >
                Components
              </Text> */}

              {/* List view of components with labels */}
              <VStack spacing={2} align="stretch">
                {PARENT.map((component) =>
                  component ? (
                    <ComponentItem
                      key={component.label}
                      component={component}
                      onDragStart={onDragStart}
                    />
                  ) : null
                )}
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};