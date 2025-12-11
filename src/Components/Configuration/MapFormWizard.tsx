import React, { useState, useMemo, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, CheckIcon } from '@chakra-ui/icons';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

import { MapStepConfig } from '../../types';

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
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBgColor = useColorModeValue('gray.50', 'gray.700');
  const alternateRowBg = useColorModeValue('gray.50', 'gray.700');
  const detailRowBg = useColorModeValue('gray.25', 'gray.750');

  const handleAddStep = useCallback(() => {
    setSteps(prevSteps => {
      const newStep: MapStepConfig = {
        id: Date.now().toString(),
        etl_stp_job_nm: '',
        etl_stp_desc: '',
        etl_stp_sqnc_nbr: prevSteps.length + 1, // Auto-increment based on current array length
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
      return [...prevSteps, newStep];
    });
  }, []);



  const handleDeleteStep = useCallback((index: number) => {
    setSteps(prevSteps => {
      const newSteps = prevSteps.filter((_, i) => i !== index);
      // Auto-resequence all remaining steps
      return newSteps.map((step, i) => ({
        ...step,
        etl_stp_sqnc_nbr: i + 1
      }));
    });
    // Remove the deleted row from editing state
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Adjust indices for remaining rows
      const adjustedSet = new Set<number>();
      newSet.forEach(editingIndex => {
        if (editingIndex > index) {
          adjustedSet.add(editingIndex - 1);
        } else {
          adjustedSet.add(editingIndex);
        }
      });
      return adjustedSet;
    });
  }, []);

  const handleFieldChange = useCallback((stepIndex: number, field: keyof MapStepConfig, value: any) => {
    setSteps(prevSteps => 
      prevSteps.map((step, index) => {
        if (index === stepIndex) {
          // For sequence number, allow empty string during editing but store as number
          if (field === 'etl_stp_sqnc_nbr') {
            if (value === '') {
              return { ...step, [field]: '' as any }; // Temporary empty state
            }
            const numValue = parseInt(value);
            return { ...step, [field]: isNaN(numValue) ? 1 : Math.max(1, numValue) };
          }
          return { ...step, [field]: value };
        }
        return step;
      })
    );
  }, []);

  const handleToggleEdit = useCallback((rowIndex: number) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  }, []);

  const isRowEditing = useCallback((rowIndex: number) => {
    return editingRows.has(rowIndex);
  }, [editingRows]);



  // Table columns definition with all fields in one row
  const columns = useMemo<ColumnDef<MapStepConfig>[]>(
    () => [
      {
        accessorKey: 'etl_stp_sqnc_nbr',
        header: 'Seq',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              type="text"
              value={getValue() as number}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string during editing
                if (value === '') {
                  handleFieldChange(row.index, 'etl_stp_sqnc_nbr', '');
                } else {
                  // Only allow numeric input
                  const numericValue = value.replace(/[^0-9]/g, '');
                  if (numericValue !== value) return; // Prevent non-numeric input
                  handleFieldChange(row.index, 'etl_stp_sqnc_nbr', numericValue);
                }
              }}
              onBlur={(e) => {
                // On blur, ensure we have a valid number
                const value = e.target.value;
                const numValue = parseInt(value) || 1;
                handleFieldChange(row.index, 'etl_stp_sqnc_nbr', Math.max(1, numValue));
              }}
              size="sm"
              w="50px"
              textAlign="center"
            />
          ) : (
            <Text fontSize="sm">{getValue() as number}</Text>
          )
        ),
        size: 60
      },
      {
        accessorKey: 'etl_stp_job_nm',
        header: 'Job Name',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_job_nm', e.target.value)}
              size="sm"
              placeholder="Job name"
              w="120px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="120px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 130
      },
      {
        accessorKey: 'etl_stp_desc',
        header: 'Description',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_desc', e.target.value)}
              size="sm"
              placeholder="Description"
              w="150px"
            />
          ) : (
            <Tooltip label={getValue() as string} hasArrow placement="top">
              <Text fontSize="sm" isTruncated maxW="150px">{getValue() as string || '-'}</Text>
            </Tooltip>
          )
        ),
        size: 160
      },
      {
        accessorKey: 'etl_stp_src_platfrm',
        header: 'Src Platform',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_src_platfrm', e.target.value)}
              size="sm"
              placeholder="AWS, Snowflake..."
              w="100px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="100px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 110
      },
      {
        accessorKey: 'etl_stp_src_schma',
        header: 'Src Schema',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_src_schma', e.target.value)}
              size="sm"
              placeholder="Source schema"
              w="100px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="100px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 110
      },
      {
        accessorKey: 'etl_stp_src_stg_schma',
        header: 'Src Stage Schema',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_src_stg_schma', e.target.value)}
              size="sm"
              placeholder="Stage schema"
              w="120px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="120px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 130
      },
      {
        accessorKey: 'etl_stp_trgt_tbl_nm',
        header: 'Target Table',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_trgt_tbl_nm', e.target.value)}
              size="sm"
              placeholder="Table name"
              w="120px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="120px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 130
      },
      {
        accessorKey: 'etl_stp_trgt_platfrm',
        header: 'Tgt Platform',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_trgt_platfrm', e.target.value)}
              size="sm"
              placeholder="AWS, Snowflake..."
              w="100px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="100px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 110
      },
      {
        accessorKey: 'etl_stp_trgt_schma',
        header: 'Tgt Schema',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_trgt_schma', e.target.value)}
              size="sm"
              placeholder="Target schema"
              w="100px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="100px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 110
      },
      {
        accessorKey: 'etl_stp_trgt_stg_schma',
        header: 'Tgt Stage Schema',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_trgt_stg_schma', e.target.value)}
              size="sm"
              placeholder="Stage schema"
              w="120px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="120px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 130
      },
      {
        accessorKey: 'etl_stp_parms',
        header: 'ETL Parameters',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Textarea
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_parms', e.target.value)}
              size="sm"
              placeholder="ETL parameters"
              rows={1}
              resize="none"
              w="150px"
            />
          ) : (
            <Tooltip label={getValue() as string} hasArrow placement="top">
              <Text fontSize="sm" isTruncated maxW="150px">{getValue() as string || '-'}</Text>
            </Tooltip>
          )
        ),
        size: 160
      },
      {
        accessorKey: 'etl_stp_s3_code_bkt',
        header: 'S3 Code Bucket',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_s3_code_bkt', e.target.value)}
              size="sm"
              placeholder="S3 bucket"
              w="120px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="120px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 130
      },
      {
        accessorKey: 'etl_stp_s3_code_key',
        header: 'S3 Code Key',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_s3_code_key', e.target.value)}
              size="sm"
              placeholder="S3 key/path"
              w="130px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="130px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 140
      },
      {
        accessorKey: 'etl_stp_s3_log_bkt',
        header: 'S3 Log Bucket',
        cell: ({ getValue, row }) => (
          isRowEditing(row.index) ? (
            <Input
              value={getValue() as string}
              onChange={(e) => handleFieldChange(row.index, 'etl_stp_s3_log_bkt', e.target.value)}
              size="sm"
              placeholder="Log bucket"
              w="120px"
            />
          ) : (
            <Text fontSize="sm" isTruncated maxW="120px">{getValue() as string || '-'}</Text>
          )
        ),
        size: 130
      },
      {
        accessorKey: 'actv_flag',
        header: 'Active',
        cell: ({ getValue, row }) => (
          <Switch 
            isChecked={getValue() as boolean}
            onChange={(e) => handleFieldChange(row.index, 'actv_flag', e.target.checked)}
            size="sm"
            isDisabled={!isRowEditing(row.index)}
          />
        ),
        size: 70
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <HStack spacing={1}>
            <IconButton
              aria-label={isRowEditing(row.index) ? "Save changes" : "Edit step"}
              icon={isRowEditing(row.index) ? <CheckIcon /> : <EditIcon />}
              size="sm"
              colorScheme={isRowEditing(row.index) ? "green" : "blue"}
              variant="ghost"
              onClick={() => handleToggleEdit(row.index)}
            />
            <IconButton
              aria-label="Delete step"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => handleDeleteStep(row.index)}
            />
          </HStack>
        ),
        size: 100
      }
    ],
    [handleFieldChange, handleDeleteStep, handleToggleEdit, isRowEditing]
  );

  const table = useReactTable({
    data: steps,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });



  const handleSaveAll = () => {
    onSave(steps);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent maxH="95vh" maxW="95vw">
          <ModalHeader>Map Configuration - ETL Steps</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            <VStack spacing={4} align="stretch">
              <Flex>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Configure multiple ETL steps for the Map component. Click the <EditIcon w={3} h={3} /> button to edit a row, and <CheckIcon w={3} h={3} /> to save changes.
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Sequence numbers auto-increment when adding new steps and can be manually edited.
                  </Text>
                </VStack>
                <Spacer />
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  size="sm"
                  onClick={handleAddStep}
                >
                  Add Step
                </Button>
              </Flex>

              {steps.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No steps configured. Click "Add Step" to create your first ETL step.
                </Alert>
              ) : (
                <Box border="1px" borderColor={borderColor} borderRadius="md" overflow="auto" maxH="70vh">
                  <Table variant="simple" size="sm">
                    <Thead bg={headerBgColor} position="sticky" top={0} zIndex={1}>
                      {table.getHeaderGroups().map(headerGroup => (
                        <Tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <Th key={header.id} w={`${header.getSize()}px`} fontSize="xs" p={2}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </Th>
                          ))}
                        </Tr>
                      ))}
                    </Thead>
                    <Tbody>
                      {table.getRowModel().rows.map((row, rowIndex) => (
                        <Tr key={row.id} bg={rowIndex % 2 === 0 ? 'transparent' : alternateRowBg}>
                          {row.getVisibleCells().map(cell => (
                            <Td key={cell.id} w={`${cell.column.getSize()}px`} py={2} px={1}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveAll}>
              Save Configuration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


    </>
  );
};

export default MapFormWizard;