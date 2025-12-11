import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  IconButton,
  Collapse,
  VStack,
  HStack,
  Divider,
  useDisclosure,
  Tooltip,
  ScrollArea,
  CloseButton,
} from '@chakra-ui/react';
import {
  ChevronUp,
  ChevronDown,
  CheckCircleFill,
  XCircleFill,
  ExclamationTriangleFill,
  ArrowClockwise,
  Trash,
  Download,
} from 'react-bootstrap-icons';
import { useDarkMode } from '../store';

export enum LogStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  LOADING = 'loading',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  status: LogStatus;
  message: string;
  nodeId?: string;
  nodeName?: string;
  details?: string;
}

interface BottomStatusBarProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
  onExportLogs?: () => void;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  logs,
  onClearLogs,
  onExportLogs,
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const { isDark } = useDarkMode();

  // Calculate status counts
  const statusCounts = logs.reduce(
    (acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    },
    {} as Record<LogStatus, number>
  );

  const getStatusIcon = (status: LogStatus) => {
    switch (status) {
      case LogStatus.SUCCESS:
        return <CheckCircleFill color="#48bb78" size={16} />;
      case LogStatus.FAILED:
      case LogStatus.ERROR:
        return <XCircleFill color="#f56565" size={16} />;
      case LogStatus.WARNING:
        return <ExclamationTriangleFill color="#ed8936" size={16} />;
      case LogStatus.LOADING:
        return <ArrowClockwise color="#4299e1" size={16} className="rotating" />;
      default:
        return <CheckCircleFill color="#a0aec0" size={16} />;
    }
  };

  const getStatusColor = (status: LogStatus) => {
    switch (status) {
      case LogStatus.SUCCESS:
        return 'green';
      case LogStatus.FAILED:
      case LogStatus.ERROR:
        return 'red';
      case LogStatus.WARNING:
        return 'orange';
      case LogStatus.LOADING:
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLatestStatus = (): LogStatus | null => {
    if (logs.length === 0) return null;
    return logs[logs.length - 1].status;
  };

  const latestStatus = getLatestStatus();

  return (
    <>
      {/* Status Bar */}
      <Box
        position="fixed"
        bottom={0}
        left="280px" // Align with left sidebar
        right={0}
        height={isOpen ? '300px' : '40px'}
        bg={isDark ? 'gray.800' : 'white'}
        borderTop="1px solid"
        borderColor={isDark ? 'gray.700' : 'gray.200'}
        boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
        zIndex={1000}
        transition="height 0.3s ease"
      >
        {/* Top Bar */}
        <Flex
          height="40px"
          alignItems="center"
          justifyContent="space-between"
          px={4}
          cursor="pointer"
          onClick={onToggle}
          bg={isDark ? 'gray.800' : 'white'}
          _hover={{ bg: isDark ? 'gray.750' : 'gray.50' }}
        >
          <HStack spacing={4}>
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="semibold" color={isDark ? 'gray.300' : 'gray.700'}>
                Status
              </Text>
              {latestStatus && (
                <Box>{getStatusIcon(latestStatus)}</Box>
              )}
            </HStack>

            <Divider orientation="vertical" height="20px" />

            {/* Status Badges */}
            <HStack spacing={3}>
              {statusCounts[LogStatus.SUCCESS] > 0 && (
                <Tooltip label="Success">
                  <Badge colorScheme="green" variant="subtle" fontSize="xs">
                    <HStack spacing={1}>
                      <CheckCircleFill size={12} />
                      <Text>{statusCounts[LogStatus.SUCCESS]}</Text>
                    </HStack>
                  </Badge>
                </Tooltip>
              )}

              {statusCounts[LogStatus.LOADING] > 0 && (
                <Tooltip label="Loading">
                  <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                    <HStack spacing={1}>
                      <ArrowClockwise size={12} />
                      <Text>{statusCounts[LogStatus.LOADING]}</Text>
                    </HStack>
                  </Badge>
                </Tooltip>
              )}

              {statusCounts[LogStatus.WARNING] > 0 && (
                <Tooltip label="Warnings">
                  <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                    <HStack spacing={1}>
                      <ExclamationTriangleFill size={12} />
                      <Text>{statusCounts[LogStatus.WARNING]}</Text>
                    </HStack>
                  </Badge>
                </Tooltip>
              )}

              {(statusCounts[LogStatus.FAILED] || statusCounts[LogStatus.ERROR]) && (
                <Tooltip label="Errors">
                  <Badge colorScheme="red" variant="subtle" fontSize="xs">
                    <HStack spacing={1}>
                      <XCircleFill size={12} />
                      <Text>
                        {(statusCounts[LogStatus.FAILED] || 0) + (statusCounts[LogStatus.ERROR] || 0)}
                      </Text>
                    </HStack>
                  </Badge>
                </Tooltip>
              )}
            </HStack>

            <Divider orientation="vertical" height="20px" />

            <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.500'}>
              {logs.length} {logs.length === 1 ? 'log' : 'logs'}
            </Text>
          </HStack>

          <HStack spacing={2}>
            {logs.length > 0 && (
              <>
                {onExportLogs && (
                  <Tooltip label="Export Logs">
                    <IconButton
                      icon={<Download />}
                      aria-label="Export logs"
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportLogs();
                      }}
                    />
                  </Tooltip>
                )}
                {onClearLogs && (
                  <Tooltip label="Clear Logs">
                    <IconButton
                      icon={<Trash />}
                      aria-label="Clear logs"
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearLogs();
                      }}
                    />
                  </Tooltip>
                )}
              </>
            )}
            <IconButton
              icon={isOpen ? <ChevronDown /> : <ChevronUp />}
              aria-label="Toggle logs"
              size="xs"
              variant="ghost"
            />
          </HStack>
        </Flex>

        {/* Logs Panel */}
        <Collapse in={isOpen} animateOpacity>
          <Box height="260px" overflow="hidden">
            <Flex height="100%">
              {/* Logs List */}
              <Box
                width={selectedLog ? '50%' : '100%'}
                height="100%"
                overflowY="auto"
                borderRight={selectedLog ? '1px solid' : 'none'}
                borderColor={isDark ? 'gray.700' : 'gray.200'}
                css={{
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: isDark ? '#2D3748' : '#F7FAFC',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: isDark ? '#4A5568' : '#CBD5E0',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: isDark ? '#718096' : '#A0AEC0',
                  },
                }}
              >
                <VStack spacing={0} align="stretch">
                  {logs.length === 0 ? (
                    <Flex
                      height="260px"
                      alignItems="center"
                      justifyContent="center"
                      color={isDark ? 'gray.600' : 'gray.400'}
                    >
                      <Text fontSize="sm">No logs available</Text>
                    </Flex>
                  ) : (
                    logs.map((log) => (
                      <Box
                        key={log.id}
                        px={4}
                        py={3}
                        cursor="pointer"
                        bg={
                          selectedLog?.id === log.id
                            ? isDark
                              ? 'gray.700'
                              : 'gray.100'
                            : 'transparent'
                        }
                        _hover={{
                          bg: isDark ? 'gray.750' : 'gray.50',
                        }}
                        onClick={() => setSelectedLog(log)}
                        borderBottom="1px solid"
                        borderColor={isDark ? 'gray.700' : 'gray.200'}
                      >
                        <HStack spacing={3} align="flex-start">
                          <Box mt={0.5}>{getStatusIcon(log.status)}</Box>
                          <VStack align="flex-start" spacing={1} flex={1}>
                            <HStack spacing={2} width="100%">
                              <Text
                                fontSize="sm"
                                fontWeight="medium"
                                color={isDark ? 'gray.200' : 'gray.800'}
                                noOfLines={1}
                                flex={1}
                              >
                                {log.message}
                              </Text>
                              <Text
                                fontSize="xs"
                                color={isDark ? 'gray.500' : 'gray.500'}
                              >
                                {formatTime(log.timestamp)}
                              </Text>
                            </HStack>
                            {log.nodeName && (
                              <Badge
                                colorScheme={getStatusColor(log.status)}
                                fontSize="xs"
                                variant="subtle"
                              >
                                {log.nodeName}
                              </Badge>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    ))
                  )}
                </VStack>
              </Box>

              {/* Log Details Panel */}
              {selectedLog && (
                <Box
                  width="50%"
                  height="100%"
                  overflowY="auto"
                  bg={isDark ? 'gray.900' : 'gray.50'}
                  p={4}
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: isDark ? '#1A202C' : '#EDF2F7',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: isDark ? '#4A5568' : '#CBD5E0',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: isDark ? '#718096' : '#A0AEC0',
                    },
                  }}
                >
                  <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Text fontSize="sm" fontWeight="bold" color={isDark ? 'gray.300' : 'gray.700'}>
                      Log Details
                    </Text>
                    <CloseButton
                      size="sm"
                      onClick={() => setSelectedLog(null)}
                    />
                  </Flex>

                  <VStack align="flex-start" spacing={3}>
                    <Box>
                      <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.600'} mb={1}>
                        Status
                      </Text>
                      <HStack>
                        {getStatusIcon(selectedLog.status)}
                        <Badge colorScheme={getStatusColor(selectedLog.status)}>
                          {selectedLog.status.toUpperCase()}
                        </Badge>
                      </HStack>
                    </Box>

                    <Box>
                      <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.600'} mb={1}>
                        Timestamp
                      </Text>
                      <Text fontSize="sm" color={isDark ? 'gray.300' : 'gray.800'}>
                        {selectedLog.timestamp.toLocaleString()}
                      </Text>
                    </Box>

                    {selectedLog.nodeName && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.600'} mb={1}>
                          Component
                        </Text>
                        <Text fontSize="sm" color={isDark ? 'gray.300' : 'gray.800'}>
                          {selectedLog.nodeName}
                        </Text>
                      </Box>
                    )}

                    {selectedLog.nodeId && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.600'} mb={1}>
                          Node ID
                        </Text>
                        <Text fontSize="xs" fontFamily="mono" color={isDark ? 'gray.400' : 'gray.600'}>
                          {selectedLog.nodeId}
                        </Text>
                      </Box>
                    )}

                    <Box width="100%">
                      <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.600'} mb={1}>
                        Message
                      </Text>
                      <Text fontSize="sm" color={isDark ? 'gray.300' : 'gray.800'}>
                        {selectedLog.message}
                      </Text>
                    </Box>

                    {selectedLog.details && (
                      <Box width="100%">
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.600'} mb={1}>
                          Details
                        </Text>
                        <Box
                          p={3}
                          bg={isDark ? 'gray.800' : 'white'}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={isDark ? 'gray.700' : 'gray.200'}
                        >
                          <Text
                            fontSize="xs"
                            fontFamily="mono"
                            color={isDark ? 'gray.400' : 'gray.600'}
                            whiteSpace="pre-wrap"
                          >
                            {selectedLog.details}
                          </Text>
                        </Box>
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}
            </Flex>
          </Box>
        </Collapse>
      </Box>

      {/* CSS for rotating animation */}
      <style>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </>
  );
};