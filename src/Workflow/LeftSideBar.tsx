import { Box, Flex, Text, IconButton, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { COMPONENTS } from "../constants";
import { MajorComponents } from "../types";

interface LeftSidebarProps {
  onDragStart: (event: React.DragEvent<HTMLButtonElement>, type: MajorComponents) => void;
}

export const LeftSidebar = ({ onDragStart }: LeftSidebarProps) => {
  return (
    <Box
      as="aside"
      w="280px"
      h="calc(100vh - 60px)" // Subtract header height
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      p={4}
      overflowY="auto"
      position="fixed"
      left={0}
      top="60px" // Header height
      zIndex={100}
    >
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Actions</Tab>
          <Tab>Flow</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} py={4}>
            {/* Actions Tab - Components */}
            <Box>
              <Text
                fontSize="md"
                fontWeight="semibold"
                mb={3}
                color="gray.700"
              >
                Components
              </Text>
              <Flex gap={3} flexWrap="wrap">
                {COMPONENTS.map((component) =>
                  component ? (
                    <IconButton
                      size="lg"
                      key={component.label}
                      aria-label={component.label}
                      icon={component.icon}
                      onDragStart={(event) => onDragStart(event, component.type)}
                      draggable
                      cursor="grab"
                      _active={{ cursor: "grabbing" }}
                      colorScheme="gray"
                      variant="outline"
                      _hover={{
                        bg: "gray.50",
                        borderColor: "blue.300"
                      }}
                    />
                  ) : null
                )}
              </Flex>
            </Box>
          </TabPanel>

          <TabPanel px={0} py={4}>
            {/* Flow Tab - Future flow management features */}
            <Box>
              <Text
                fontSize="md"
                fontWeight="semibold"
                mb={3}
                color="gray.700"
              >
                Flow Controls
              </Text>
              <Text fontSize="sm" color="gray.500">
                Flow management features coming soon...
              </Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};