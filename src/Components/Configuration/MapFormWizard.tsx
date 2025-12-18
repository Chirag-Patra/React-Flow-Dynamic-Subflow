import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Input,
  Switch,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useColorModeValue,
  Flex,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
  Textarea,
  Tooltip,
  Checkbox,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, CheckIcon } from '@chakra-ui/icons';

// Assuming this type exists in your types file
export interface MapStepConfig {
  id: string;
  etl_stp_job_nm: string;
  etl_stp_desc: string;
  etl_stp_sqnc_nbr: number;
  etl_stp_src_platfrm: string;
  etl_stp_src_schma: string;
  etl_stp_src_stg_schma: string;
  etl_stp_trgt_tbl_nm: string;
  etl_stp_trgt_platfrm: string;
  etl_stp_trgt_schma: string;
  etl_stp_trgt_stg_schma: string;
  etl_stp_parms: string;
  etl_stp_s3_code_bkt: string;
  etl_stp_s3_code_key: string;
  etl_stp_s3_log_bkt: string;
  actv_flag: boolean;
}

interface MapFormWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (steps: MapStepConfig[]) => void;
  initialSteps?: MapStepConfig[];
}

const MapFormWizard: React.FC<MapFormWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSteps = []
}) => {
  const [steps, setSteps] = useState<MapStepConfig[]>(initialSteps);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingStep, setEditingStep] = useState<MapStepConfig | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBgColor = useColorModeValue('gray.50', 'gray.700');
  const alternateRowBg = useColorModeValue('gray.50', 'gray.700');
  const selectedRowBg = useColorModeValue('blue.50', 'blue.900');
  const sidePanelBg = useColorModeValue('gray.50', 'gray.700');

  const handleAddStep = useCallback(() => {
    const newStep: MapStepConfig = {
      id: Date.now().toString(),
      etl_stp_job_nm: '',
      etl_stp_desc: '',
      etl_stp_sqnc_nbr: steps.length + 1,
      etl_stp_src_platfrm: '',
      etl_stp_src_schma: '',
      etl_stp_src_stg_schma: '',
      etl_stp_trgt_tbl_nm: '',
      etl_stp_trgt_platfrm: '',
      etl_stp_trgt_schma: '',
      etl_stp_trgt_stg_schma: '',
      etl_stp_parms: '',
      etl_stp_s3_code_bkt: '',
      etl_stp_s3_code_key: '',
      etl_stp_s3_log_bkt: '',
      actv_flag: true
    };
    setSteps(prevSteps => [...prevSteps, newStep]);
  }, [steps.length]);

  const handleDeleteSelected = useCallback(() => {
    setSteps(prevSteps => {
      const newSteps = prevSteps.filter((_, i) => !selectedRows.has(i));
      return newSteps.map((step, i) => ({ ...step, etl_stp_sqnc_nbr: i + 1 }));
    });
    setSelectedRows(new Set());
    setEditingIndex(null);
    setEditingStep(null);
  }, [selectedRows]);

  const handleRowSelect = useCallback((index: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) setSelectedRows(new Set(steps.map((_, i) => i)));
    else setSelectedRows(new Set());
  }, [steps]);

  const handleEditRow = useCallback((index: number) => {
    setEditingIndex(index);
    setEditingStep({ ...steps[index] });
  }, [steps]);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditingStep(null);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingIndex !== null && editingStep) {
      setSteps(prevSteps => prevSteps.map((step, i) => (i === editingIndex ? editingStep : step)));
      setEditingIndex(null);
      setEditingStep(null);
    }
  }, [editingIndex, editingStep]);

  const handleEditFieldChange = useCallback((field: keyof MapStepConfig, value: any) => {
    setEditingStep(prev => {
      if (!prev) return prev;
      if (field === 'etl_stp_sqnc_nbr') {
        const numValue = parseInt(value) || 1;
        return { ...prev, [field]: Math.max(1, numValue) };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleSaveAll = () => {
    onSave(steps);
    onClose();
  };

  const isEditingActive = editingIndex !== null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent maxH="95vh" maxW="98vw" overflow="hidden">
        <ModalHeader borderBottom="1px" borderColor={borderColor}>
          Map Configuration - ETL Steps
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={6} overflow="hidden">
          {/* Main Layout Flex Container - Fixed Height */}
          <Flex gap={6} h="calc(95vh - 160px)" align="stretch">

            {/* LEFT: Table Section */}
            <Flex
              flex={isEditingActive ? "0 0 65%" : "1"}
              direction="column"
              transition="flex 0.3s ease"
              minW={0} // Important for flex truncation
            >
              <VStack spacing={4} align="stretch" h="full">
                <Flex flexShrink={0} align="center">
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Manage ETL step sequence and parameters.
                    </Text>
                  </Box>
                  <Spacer />
                  <HStack>
                    <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={handleAddStep}>
                      Add Step
                    </Button>
                  </HStack>
                </Flex>

                {steps.length === 0 ? (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    No steps configured. Click "Add Step" to begin.
                  </Alert>
                ) : (
                  /* THE ONLY SCROLLABLE AREA FOR THE TABLE */
                  <Box
                    flex={1}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    overflow="auto"
                    sx={{
                      '&::-webkit-scrollbar': { width: '8px', height: '8px' },
                      '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                      '&::-webkit-scrollbar-thumb': { background: '#c0abc6ff', borderRadius: '10px' },
                    }}
                  >
                    <Table variant="simple" size="sm" style={{ minWidth: '2150px', tableLayout: 'fixed' }}>
                      <Thead bg={headerBgColor} position="sticky" top={0} zIndex={10}>
                        <Tr>
                          <Th w="70px" textAlign="center">SEQ</Th>
                          <Th w="180px">JOB NAME</Th>
                          <Th w="250px">DESCRIPTION</Th>
                          <Th w="150px">SRC PLATFORM</Th>
                          <Th w="150px">SRC SCHEMA</Th>
                          <Th w="180px">SRC STG SCHEMA</Th>
                          <Th w="180px">TGT TABLE</Th>
                          <Th w="150px">TGT PLATFORM</Th>
                          <Th w="150px">TGT SCHEMA</Th>
                          <Th w="180px">TGT STG SCHEMA</Th>
                          <Th w="250px">ETL PARAMETERS</Th>
                          <Th w="150px">S3 CODE BKT</Th>
                          <Th w="150px">S3 CODE KEY</Th>
                          <Th w="150px">S3 LOG BKT</Th>
                          <Th w="80px" textAlign="center">ACTIVE</Th>
                          <Th w="120px" textAlign="center" position="sticky" right={0} bg={headerBgColor} zIndex={11}>ACTIONS</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {steps.map((step, index) => {
                          const isSelected = selectedRows.has(index);
                          const rowBg = isSelected ? selectedRowBg : (index % 2 === 0 ? bgColor : alternateRowBg);

                          return (
                            <Tr key={step.id} bg={index % 2 === 0 ? bgColor : alternateRowBg} _hover={{ bg: 'gray.100' }}>
                              <Td textAlign="center">{step.etl_stp_sqnc_nbr}</Td>
                              <Td isTruncated>{step.etl_stp_job_nm || '-'}</Td>
                              <Td>
                                <Tooltip label={step.etl_stp_desc} hasArrow><Text isTruncated>{step.etl_stp_desc || '-'}</Text></Tooltip>
                              </Td>
                              <Td isTruncated>{step.etl_stp_src_platfrm || '-'}</Td>
                              <Td isTruncated>{step.etl_stp_src_schma || '-'}</Td>
                              <Td isTruncated>{step.etl_stp_src_stg_schma || '-'}</Td>
                              <Td isTruncated>{step.etl_stp_trgt_tbl_nm || '-'}</Td>
                              <Td isTruncated>{step.etl_stp_trgt_platfrm || '-'}</Td>
                              <Td isTruncated>{step.etl_stp_trgt_schma || '-'}</Td>
                              <Td isTruncated>{step.etl_stp_trgt_stg_schma || '-'}</Td>
                              <Td>
                                <Tooltip label={step.etl_stp_parms} hasArrow><Text isTruncated>{step.etl_stp_parms || '-'}</Text></Tooltip>
                              </Td>
                              <Td isTruncated>{step.etl_stp_s3_code_bkt || '-'}</Td>
                              <Td isTruncated>{step.etl_stp_s3_code_key || '-'}</Td>
                              <Td isTruncated>{step.etl_stp_s3_log_bkt || '-'}</Td>
                              <Td textAlign="center">
                                <Switch isChecked={step.actv_flag} size="sm" isDisabled />
                              </Td>
                              <Td textAlign="center" position="sticky" right={0} bg={index % 2 === 0 ? bgColor : alternateRowBg} zIndex={1}>
                                <HStack spacing={1} justify="center">
                                  <IconButton
                                    aria-label="Edit"
                                    icon={<EditIcon />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => handleEditRow(index)}
                                  />
                                  <IconButton
                                    aria-label="Delete"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => {
                                      setSteps(prevSteps => {
                                        const newSteps = prevSteps.filter((_, i) => i !== index);
                                        return newSteps.map((step, i) => ({ ...step, etl_stp_sqnc_nbr: i + 1 }));
                                      });
                                      if (editingIndex === index) {
                                        setEditingIndex(null);
                                        setEditingStep(null);
                                      }
                                    }}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </VStack>
            </Flex>

            {/* RIGHT: Side Editing Panel */}
            {isEditingActive && editingStep && (
              <Box
                flex="0 0 34%"
                bg="white"
                borderRadius="lg"
                border="1px"
                borderColor="gray.200"
                overflowY="auto"
                boxShadow="lg"


                sx={{
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                    margin: '8px 0',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#CBD5E0',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#A0AEC0',
                  },
                }}
              >
                 <Box p={6} pr={4}>
                  <VStack spacing={6} align="stretch" pr={2}>
                    <Box borderBottom="1px" borderColor="gray.200" pb={4}>
                      <Text fontSize="xl" fontWeight="600" color="gray.800">
                        Edit Step Configuration
                      </Text>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Step {editingStep.etl_stp_sqnc_nbr} of {steps.length}: Basic Configuration
                      </Text>
                    </Box>

                  <VStack spacing={5} align="stretch">
                    <Text fontSize="sm" color="gray.600" fontWeight="500">
                      Configure step details and parameters
                    </Text>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Sequence Number <Text as="span" color="red.500">* *</Text>
                      </FormLabel>
                      <Input
                        size="md"
                        type="number"
                        value={editingStep.etl_stp_sqnc_nbr}
                        onChange={(e) => handleEditFieldChange('etl_stp_sqnc_nbr', e.target.value)}
                        placeholder="Enter sequence number"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Step execution order in the ETL pipeline
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Job Name <Text as="span" color="red.500">* *</Text>
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_job_nm}
                        onChange={(e) => handleEditFieldChange('etl_stp_job_nm', e.target.value)}
                        placeholder="Enter job name"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Unique identifier for this ETL job
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Description <Text as="span" color="red.500">* *</Text>
                      </FormLabel>
                      <Textarea
                        size="md"
                        rows={3}
                        value={editingStep.etl_stp_desc}
                        onChange={(e) => handleEditFieldChange('etl_stp_desc', e.target.value)}
                        placeholder="Enter description"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Brief description of what this step does
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Source Platform
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_src_platfrm}
                        onChange={(e) => handleEditFieldChange('etl_stp_src_platfrm', e.target.value)}
                        placeholder="e.g., AWS, Snowflake, Azure"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Source Schema
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_src_schma}
                        onChange={(e) => handleEditFieldChange('etl_stp_src_schma', e.target.value)}
                        placeholder="Enter source schema"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Source Stage Schema
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_src_stg_schma}
                        onChange={(e) => handleEditFieldChange('etl_stp_src_stg_schma', e.target.value)}
                        placeholder="Enter source stage schema"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Target Table Name
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_trgt_tbl_nm}
                        onChange={(e) => handleEditFieldChange('etl_stp_trgt_tbl_nm', e.target.value)}
                        placeholder="Enter target table name"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Target Platform
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_trgt_platfrm}
                        onChange={(e) => handleEditFieldChange('etl_stp_trgt_platfrm', e.target.value)}
                        placeholder="e.g., AWS, Snowflake, Azure"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Target Schema
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_trgt_schma}
                        onChange={(e) => handleEditFieldChange('etl_stp_trgt_schma', e.target.value)}
                        placeholder="Enter target schema"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        Target Stage Schema
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_trgt_stg_schma}
                        onChange={(e) => handleEditFieldChange('etl_stp_trgt_stg_schma', e.target.value)}
                        placeholder="Enter target stage schema"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        ETL Parameters
                      </FormLabel>
                      <Textarea
                        size="md"
                        rows={3}
                        value={editingStep.etl_stp_parms}
                        onChange={(e) => handleEditFieldChange('etl_stp_parms', e.target.value)}
                        placeholder="Enter ETL parameters"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        S3 Code Bucket
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_s3_code_bkt}
                        onChange={(e) => handleEditFieldChange('etl_stp_s3_code_bkt', e.target.value)}
                        placeholder="Enter S3 code bucket"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        S3 Code Key
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_s3_code_key}
                        onChange={(e) => handleEditFieldChange('etl_stp_s3_code_key', e.target.value)}
                        placeholder="Enter S3 code key/path"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="500" color="gray.700">
                        S3 Log Bucket
                      </FormLabel>
                      <Input
                        size="md"
                        value={editingStep.etl_stp_s3_log_bkt}
                        onChange={(e) => handleEditFieldChange('etl_stp_s3_log_bkt', e.target.value)}
                        placeholder="Enter S3 log bucket"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={0}>
                          Active Status
                        </FormLabel>
                        <Text fontSize="xs" color="gray.500">
                          Active or Inactive step
                        </Text>
                      </Box>
                      <Switch
                        isChecked={editingStep.actv_flag}
                        onChange={(e) => handleEditFieldChange('actv_flag', e.target.checked)}
                        size="lg"
                        colorScheme="blue"
                      />
                    </FormControl>
                  </VStack>

                  <HStack spacing={3} pt={4} borderTop="1px" borderColor="gray.200">
                    <Button
                      size="md"
                      variant="outline"
                      onClick={handleCancelEdit}
                      flex={1}
                      colorScheme="gray"
                    >
                      Back
                    </Button>
                    <Button
                      size="md"
                      colorScheme="blue"
                      onClick={handleSaveEdit}
                      flex={1}
                      bg="blue.500"
                      _hover={{ bg: "blue.600" }}
                    >
                      Save
                    </Button>
                  </HStack>
                </VStack>
                </Box>
              </Box>
            )}
          </Flex>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={borderColor}>
          <Button variant="ghost" mr={3} onClick={onClose}>Discard Changes</Button>
          <Button colorScheme="blue" onClick={handleSaveAll}>Apply Configuration</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MapFormWizard;