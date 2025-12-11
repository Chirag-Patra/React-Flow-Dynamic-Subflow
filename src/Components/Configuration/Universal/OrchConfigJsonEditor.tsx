import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  VStack,
  HStack,
  Input,
  Select,
  Box,
  Text,
  useToast,
  Badge,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import {
  CopyIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon
} from '@chakra-ui/icons';

// --- Interfaces ---
interface OrchConfigData {
  dpndnt_job_id_lst?: string[];
  dpndnt_btch_id_lst?: string[];
  scheduled_cutoff_time?: string;
  dpndnt_cutoff_dt?: string;
  scheduled_day?: string;
  scheduled_dt?: string;
  dpndnt_job_process_type?: string;
  dependency_check_window?: string;
  keep_active_in_days?: string;
  check_all_dpndnt_job_steps?: string;
  retry?: string;
}

interface ScheduledDayOption {
  day: string;
  week: string;
}

interface VisualJsonEditorProps {
  isOpen: boolean;
  onClose: (data?: OrchConfigData) => void;
  initialData?: OrchConfigData;
}

// --- Icons & Helpers ---
const FolderIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
  </Icon>
);

const TypeBadge = ({ type }: { type: 'string' | 'array' | 'number' | 'boolean' | 'object' }) => {
  const colors = {
    string: { bg: 'green.100', color: 'green.700', label: 'St' },
    array: { bg: 'purple.100', color: 'purple.700', label: 'Ar' },
    number: { bg: 'blue.100', color: 'blue.700', label: 'Nm' },
    boolean: { bg: 'orange.100', color: 'orange.700', label: 'Bl' },
    object: { bg: 'gray.100', color: 'gray.700', label: 'Ob' },
  };
  const style = colors[type];
  return (
    <Flex
      bg={style.bg} color={style.color}
      w="24px" h="24px" borderRadius="md"
      align="center" justify="center"
      fontSize="xs" fontWeight="bold"
      cursor="help"
    >
      {style.label}
    </Flex>
  );
};

// --- Main Component ---
const VisualJsonEditor: React.FC<VisualJsonEditorProps> = ({
  isOpen,
  onClose,
  initialData = {}
}) => {
  const toast = useToast();

  // --- State ---
  const defaultData: OrchConfigData = {
    dpndnt_job_id_lst: [],
    dpndnt_btch_id_lst: [],
    scheduled_cutoff_time: '',
    dpndnt_cutoff_dt: '',
    scheduled_day: '',
    scheduled_dt: '',
    dpndnt_job_process_type: 'na',
    dependency_check_window: 'na',
    keep_active_in_days: 'na',
    check_all_dpndnt_job_steps: 'na',
    retry: 'na',
  };

  const [configData, setConfigData] = useState<OrchConfigData>({ ...defaultData, ...initialData });

  // Store arrays as strings internally to avoid re-render issues
  const [jobIdsText, setJobIdsText] = useState('');
  const [batchIdsText, setBatchIdsText] = useState('');

  const [scheduledDayOptions, setScheduledDayOptions] = useState<ScheduledDayOption[]>([{ day: '', week: '' }]);

  // Cutoff time state
  const [startCutoffTime, setStartCutoffTime] = useState('');
  const [endCutoffTime, setEndCutoffTime] = useState('');
  const [timeSymbol, setTimeSymbol] = useState<'>=' | '<=' | ''>('');

  // UI State
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    dependencies: true,
    scheduling: true,
    system: true
  });

  // --- Effects (Parsing Initial Data) ---
  useEffect(() => {
    if (isOpen) {
      const parsedData = { ...defaultData, ...initialData };
      setConfigData(parsedData);

      // Parse job ids
      if (Array.isArray(parsedData.dpndnt_job_id_lst)) {
        setJobIdsText(parsedData.dpndnt_job_id_lst.join(', '));
      }

      // Parse batch ids
      if (Array.isArray(parsedData.dpndnt_btch_id_lst)) {
        setBatchIdsText(parsedData.dpndnt_btch_id_lst.join(', '));
      }

      // Parse cutoff time
      if (parsedData.scheduled_cutoff_time) {
        const timeStr = parsedData.scheduled_cutoff_time;
        if (timeStr.includes(',')) {
          const [start, end] = timeStr.split(',');
          setTimeSymbol('>=');
          setStartCutoffTime(start.replace(/[>=<]/g, ''));
          setEndCutoffTime(end.replace(/[>=<]/g, ''));
        } else {
          const symbol = timeStr.includes('>=') ? '>=' : timeStr.includes('<=') ? '<=' : '';
          setTimeSymbol(symbol as any);
          setStartCutoffTime(timeStr.replace(/[>=<]/g, ''));
        }
      } else {
        setTimeSymbol('');
        setStartCutoffTime('');
        setEndCutoffTime('');
      }

      // Parse scheduled days
      if (parsedData.scheduled_day) {
        const dayOptions = parsedData.scheduled_day.split(',').map(item => {
          const [day, week] = item.split('-');
          return { day: day || '', week: week || '' };
        });
        setScheduledDayOptions(dayOptions.length > 0 ? dayOptions : [{ day: '', week: '' }]);
      } else {
        setScheduledDayOptions([{ day: '', week: '' }]);
      }
    }
  }, [isOpen]);

  // --- Handlers ---
  const toggleNode = (node: string) => {
    setExpandedNodes(prev => ({ ...prev, [node]: !prev[node] }));
  };

  const buildScheduledCutoffTime = () => {
    if (!startCutoffTime && !endCutoffTime) return '';
    let result = '';
    if (startCutoffTime && timeSymbol) result = `${timeSymbol}${startCutoffTime}`;
    if (endCutoffTime && (timeSymbol === '>=' || !timeSymbol)) {
      result += result ? `,<=${endCutoffTime}` : `<=${endCutoffTime}`;
    }
    return result;
  };

  const getCleanData = () => {
    // Convert text back to arrays
    const jobIdArray = jobIdsText ? jobIdsText.split(',').map(s => s.trim()).filter(Boolean) : [];
    const batchIdArray = batchIdsText ? batchIdsText.split(',').map(s => s.trim()).filter(Boolean) : [];

    const finalData = {
      ...configData,
      scheduled_cutoff_time: buildScheduledCutoffTime(),
      dpndnt_job_id_lst: jobIdArray,
      dpndnt_btch_id_lst: batchIdArray,
    };

    // Remove empty/na keys
    Object.keys(finalData).forEach(key => {
      const k = key as keyof OrchConfigData;
      const val = finalData[k];
      if (val === '' || val === 'na' || (Array.isArray(val) && val.length === 0)) {
        delete finalData[k];
      }
    });
    return finalData;
  };

  const handleSave = () => {
    onClose(getCleanData());
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(getCleanData(), null, 2));
    toast({ title: 'Copied JSON', status: 'success', duration: 1000 });
  };

  // --- Syntax Highlighter for Left Panel ---
  const SyntaxHighlightedJson = ({ data }: { data: object }) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const lines = jsonStr.split('\n');

    return (
      <Box fontFamily="'Fira Code', monospace" fontSize="13px" lineHeight="1.6">
        {lines.map((line, i) => {
          // Simple regex coloring
          const keyMatch = line.match(/^(\s*)"(.+)":/);
          const valStringMatch = line.match(/: "(.+)"/);
          const valBoolMatch = line.match(/: (true|false|null|[0-9]+)/);

          return (
            <Flex key={i} w="full" _hover={{ bg: 'whiteAlpha.50' }}>
              <Text color="gray.600" w="30px" textAlign="right" mr={4} userSelect="none">
                {i + 1}
              </Text>
              <Box whiteSpace="pre">
                {keyMatch ? (
                  <>
                    <Text as="span" color="gray.500">{keyMatch[1]}</Text>
                    <Text as="span" color="#d375a3">"{keyMatch[2]}"</Text>
                    <Text as="span" color="gray.400">:</Text>
                    {valStringMatch && <Text as="span" color="#98c379"> "{valStringMatch[1]}"</Text>}
                    {valBoolMatch && <Text as="span" color="#d19a66"> {valBoolMatch[1]}</Text>}
                    {!valStringMatch && !valBoolMatch && <Text as="span" color="gray.400">{line.replace(keyMatch[0], '')}</Text>}
                  </>
                ) : (
                  <Text as="span" color="gray.400">{line}</Text>
                )}
              </Box>
            </Flex>
          );
        })}
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} size="6xl" motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent maxH="90vh" borderRadius="lg" overflow="hidden">
        <ModalBody p={0} display="flex" h="85vh">

          {/* --- LEFT PANEL: Code View (Dark) --- */}
          <Box
            w="40%"
            bg="#282a36"
            h="full"
            borderRight="1px solid"
            borderColor="whiteAlpha.200"
            display="flex"
            flexDirection="column"
          >
            {/* Header */}
            <Flex p={4} justify="space-between" align="center" borderBottom="1px solid" borderColor="whiteAlpha.100">
               <Text color="white" fontWeight="bold">Orch_config.json</Text>
               <Badge bg="purple.500" color="white" variant="solid">JSON</Badge>
            </Flex>

            {/* Code Area */}
            <Box flex={1} overflowY="auto" p={4} css={{ '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { background: '#44475a' } }}>
               <SyntaxHighlightedJson data={getCleanData()} />
            </Box>

            {/* Footer Status */}
            <Flex p={2} bg="#191a21" fontSize="xs" color="gray.400" justify="space-between">
               <Text>Ln {Object.keys(configData).length}, Col 1</Text>
               <Text>UTF-8</Text>
            </Flex>
          </Box>


          {/* --- RIGHT PANEL: Visual Editor (Light) --- */}
          <Box
            w="60%"
            bg="#f4f5f7"
            h="full"
            display="flex"
            flexDirection="column"
          >
            {/* Toolbar */}
            <Flex p={4} bg="white" borderBottom="1px solid" borderColor="gray.200" justify="space-between" align="center" shadow="sm">
              <HStack>
                <FolderIcon boxSize={5} color="purple.500" />
                <Text fontWeight="bold" color="gray.700" fontSize="lg">Edit Configuration</Text>
              </HStack>
              <HStack>
                <Button size="sm" leftIcon={<CopyIcon />} onClick={handleCopyToClipboard}>Copy</Button>
                <Button size="sm" colorScheme="purple" leftIcon={<CheckIcon />} onClick={handleSave}>Save Changes</Button>
                <IconButton size="sm" aria-label="close" icon={<CloseIcon />} onClick={() => onClose()} />
              </HStack>
            </Flex>

            {/* Tree Editor Area */}
            <Box flex={1} overflowY="auto" p={8}>

              {/* Root Group */}
              <Box>
                {/* Root Node */}
                <HStack
                  w="full"
                  bg="white"
                  p={2}
                  pl={4}
                  spacing={3}
                  borderRadius="md"
                  mb={2}
                  border="1px solid"
                  borderColor="transparent"
                  _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                  transition="all 0.2s"
                >
                  <Box w="20px" cursor="pointer" onClick={() => toggleNode('root')}>
                    {expandedNodes.root ? <ChevronDownIcon color="gray.400" /> : <ChevronRightIcon color="gray.400" />}
                  </Box>
                  <TypeBadge type="object" />
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.600"
                    minW="140px"
                    cursor="pointer"
                    onClick={() => toggleNode('root')}
                  >
                    Orch Config Json
                  </Text>
                  <Text fontSize="xs" color="gray.400" fontStyle="italic">Object container</Text>
                </HStack>

                {expandedNodes.root && (
                  <Box pl={6} borderLeft="1px dashed" borderColor="gray.300" ml={3}>

                    {/* Dependencies Group */}
                    <HStack
                      w="full"
                      bg="white"
                      p={2}
                      pl={4}
                      spacing={3}
                      borderRadius="md"
                      mb={2}
                      border="1px solid"
                      borderColor="transparent"
                      _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                      transition="all 0.2s"
                    >
                      <Box w="20px" cursor="pointer" onClick={() => toggleNode('dependencies')}>
                        {expandedNodes.dependencies ? <ChevronDownIcon color="gray.400" /> : <ChevronRightIcon color="gray.400" />}
                      </Box>
                      <TypeBadge type="object" />
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.600"
                        minW="140px"
                        cursor="pointer"
                        onClick={() => toggleNode('dependencies')}
                      >
                        dependencies_config
                      </Text>
                      <Text fontSize="xs" color="gray.400" fontStyle="italic">Object container</Text>
                    </HStack>

                    {expandedNodes.dependencies && (
                      <Box pl={6} borderLeft="1px dashed" borderColor="gray.300" ml={3} mb={4}>

                        {/* Job IDs */}
                        <HStack
                          w="full"
                          bg="white"
                          p={2}
                          pl={4}
                          spacing={3}
                          borderRadius="md"
                          mb={2}
                          border="1px solid"
                          borderColor="transparent"
                          _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                          transition="all 0.2s"
                        >
                          <Box w="6px" h="6px" borderRadius="full" bg="gray.200" ml={5} />
                          <TypeBadge type="array" />
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="140px">
                            job_ids
                          </Text>
                          <Flex flex={1} align="center" bg="gray.50" borderRadius="md" px={2} h="32px">
                            <Input
                              variant="unstyled"
                              size="sm"
                              placeholder="job1, job2..."
                              value={jobIdsText}
                              onChange={(e) => setJobIdsText(e.target.value)}
                              color="gray.700"
                            />
                          </Flex>
                          <IconButton
                            aria-label="clear"
                            icon={<CloseIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setJobIdsText('')}
                          />
                        </HStack>

                        {/* Batch IDs */}
                        <HStack
                          w="full"
                          bg="white"
                          p={2}
                          pl={4}
                          spacing={3}
                          borderRadius="md"
                          mb={2}
                          border="1px solid"
                          borderColor="transparent"
                          _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                          transition="all 0.2s"
                        >
                          <Box w="6px" h="6px" borderRadius="full" bg="gray.200" ml={5} />
                          <TypeBadge type="array" />
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="140px">
                            batch_ids
                          </Text>
                          <Flex flex={1} align="center" bg="gray.50" borderRadius="md" px={2} h="32px">
                            <Input
                              variant="unstyled"
                              size="sm"
                              placeholder="batch1, batch2..."
                              value={batchIdsText}
                              onChange={(e) => setBatchIdsText(e.target.value)}
                              color="gray.700"
                            />
                          </Flex>
                          <IconButton
                            aria-label="clear"
                            icon={<CloseIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setBatchIdsText('')}
                          />
                        </HStack>

                        {/* Process Type */}
                        <HStack
                          w="full"
                          bg="white"
                          p={2}
                          pl={4}
                          spacing={3}
                          borderRadius="md"
                          mb={2}
                          border="1px solid"
                          borderColor="transparent"
                          _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                          transition="all 0.2s"
                        >
                          <Box w="6px" h="6px" borderRadius="full" bg="gray.200" ml={5} />
                          <TypeBadge type="string" />
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="140px">
                            process_type
                          </Text>
                          <Flex flex={1} align="center" bg="gray.50" borderRadius="md" px={2} h="32px">
                            <Input
                              variant="unstyled"
                              size="sm"
                              placeholder="value"
                              value={configData.dpndnt_job_process_type === 'na' ? '' : configData.dpndnt_job_process_type}
                              onChange={(e) => setConfigData(prev => ({...prev, dpndnt_job_process_type: e.target.value || 'na'}))}
                              color="gray.700"
                            />
                          </Flex>
                          <IconButton
                            aria-label="clear"
                            icon={<CloseIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setConfigData(prev => ({...prev, dpndnt_job_process_type: 'na'}))}
                          />
                        </HStack>

                      </Box>
                    )}

                    {/* Scheduling Group */}
                    <HStack
                      w="full"
                      bg="white"
                      p={2}
                      pl={4}
                      spacing={3}
                      borderRadius="md"
                      mb={2}
                      border="1px solid"
                      borderColor="transparent"
                      _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                      transition="all 0.2s"
                    >
                      <Box w="20px" cursor="pointer" onClick={() => toggleNode('scheduling')}>
                        {expandedNodes.scheduling ? <ChevronDownIcon color="gray.400" /> : <ChevronRightIcon color="gray.400" />}
                      </Box>
                      <TypeBadge type="object" />
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.600"
                        minW="140px"
                        cursor="pointer"
                        onClick={() => toggleNode('scheduling')}
                      >
                        scheduling_config
                      </Text>
                      <Text fontSize="xs" color="gray.400" fontStyle="italic">Object container</Text>
                    </HStack>

                    {expandedNodes.scheduling && (
                      <Box pl={6} borderLeft="1px dashed" borderColor="gray.300" ml={3} mb={4}>

                        {/* Scheduled Date */}
                        <HStack
                          w="full"
                          bg="white"
                          p={2}
                          pl={4}
                          spacing={3}
                          borderRadius="md"
                          mb={2}
                          border="1px solid"
                          borderColor="transparent"
                          _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                          transition="all 0.2s"
                        >
                          <Box w="6px" h="6px" borderRadius="full" bg="gray.200" ml={5} />
                          <TypeBadge type="string" />
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="140px">
                            scheduled_date
                          </Text>
                          <Flex flex={1} align="center" bg="gray.50" borderRadius="md" px={2} h="32px">
                            <Input
                              variant="unstyled"
                              size="sm"
                              placeholder="e.g. 01, EOM"
                              value={configData.scheduled_dt || ''}
                              onChange={(e) => setConfigData(prev => ({...prev, scheduled_dt: e.target.value}))}
                              color="gray.700"
                            />
                          </Flex>
                          <IconButton
                            aria-label="clear"
                            icon={<CloseIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setConfigData(prev => ({...prev, scheduled_dt: ''}))}
                          />
                        </HStack>

                        {/* Cutoff Time */}
                        <HStack w="full" bg="white" p={2} pl={4} spacing={3} borderRadius="md" mb={2} border="1px solid transparent" _hover={{ borderColor: 'purple.200', shadow: 'sm' }}>
                          <Box w="6px" h="6px" borderRadius="full" bg="gray.200" ml={5} />
                          <TypeBadge type="string" />
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="140px">cutoff_time</Text>
                          <Select w="80px" size="xs" value={timeSymbol} onChange={(e: any) => setTimeSymbol(e.target.value)}>
                            <option value="">=</option>
                            <option value=">=">{'>='}</option>
                            <option value="<=">{'<='}</option>
                          </Select>
                          <Input variant="unstyled" size="sm" type="time" step="1" value={startCutoffTime} onChange={(e) => setStartCutoffTime(e.target.value)} />
                          {(timeSymbol === '>=' || !timeSymbol) && (
                            <>
                              <Text fontSize="xs">to</Text>
                              <Input variant="unstyled" size="sm" type="time" step="1" value={endCutoffTime} onChange={(e) => setEndCutoffTime(e.target.value)} />
                            </>
                          )}
                        </HStack>

                        {/* Dynamic Day List */}
                        {scheduledDayOptions.map((opt, idx) => (
                          <HStack key={idx} w="full" bg="white" p={2} pl={4} spacing={3} borderRadius="md" mb={2} ml={0}>
                            <Box w="6px" h="6px" borderRadius="full" bg="gray.200" ml={5} />
                            <TypeBadge type="object" />
                            <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="140px">day_config_{idx+1}</Text>
                            <Select size="xs" variant="filled" w="100px" placeholder="Day" value={opt.day} onChange={(e) => {
                              const newOpts = [...scheduledDayOptions];
                              newOpts[idx].day = e.target.value;
                              setScheduledDayOptions(newOpts);
                              const str = newOpts.filter(o=>o.day).map(o => o.week ? `${o.day}-${o.week}` : o.day).join(',');
                              setConfigData(prev => ({...prev, scheduled_day: str}));
                            }}>
                              <option value="Monday">Monday</option>
                              <option value="Friday">Friday</option>
                            </Select>
                            <Select size="xs" variant="filled" w="80px" placeholder="Week" value={opt.week} onChange={(e) => {
                              const newOpts = [...scheduledDayOptions];
                              newOpts[idx].week = e.target.value;
                              setScheduledDayOptions(newOpts);
                              const str = newOpts.filter(o=>o.day).map(o => o.week ? `${o.day}-${o.week}` : o.day).join(',');
                              setConfigData(prev => ({...prev, scheduled_day: str}));
                            }}>
                              <option value="01">1st</option>
                              <option value="EOM">Last</option>
                            </Select>
                            <IconButton aria-label="add" icon={<CopyIcon/>} size="xs" onClick={() => setScheduledDayOptions([...scheduledDayOptions, {day:'', week:''}])} />
                          </HStack>
                        ))}
                      </Box>
                    )}

                    {/* System Group */}
                    <HStack
                      w="full"
                      bg="white"
                      p={2}
                      pl={4}
                      spacing={3}
                      borderRadius="md"
                      mb={2}
                      border="1px solid"
                      borderColor="transparent"
                      _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                      transition="all 0.2s"
                    >
                      <Box w="20px" cursor="pointer" onClick={() => toggleNode('system')}>
                        {expandedNodes.system ? <ChevronDownIcon color="gray.400" /> : <ChevronRightIcon color="gray.400" />}
                      </Box>
                      <TypeBadge type="object" />
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.600"
                        minW="140px"
                        cursor="pointer"
                        onClick={() => toggleNode('system')}
                      >
                        system_config
                      </Text>
                      <Text fontSize="xs" color="gray.400" fontStyle="italic">Object container</Text>
                    </HStack>

                    {expandedNodes.system && (
                      <Box pl={6} borderLeft="1px dashed" borderColor="gray.300" ml={3}>

                        {/* Check Window */}
                        <HStack
                          w="full"
                          bg="white"
                          p={2}
                          pl={4}
                          spacing={3}
                          borderRadius="md"
                          mb={2}
                          border="1px solid"
                          borderColor="transparent"
                          _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                          transition="all 0.2s"
                        >
                          <Box w="6px" h="6px" borderRadius="full" bg="gray.200" ml={5} />
                          <TypeBadge type="number" />
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="140px">
                            check_window
                          </Text>
                          <Flex flex={1} align="center" bg="gray.50" borderRadius="md" px={2} h="32px">
                            <Input
                              variant="unstyled"
                              size="sm"
                              placeholder="Days (e.g. 1)"
                              value={configData.dependency_check_window === 'na' ? '' : configData.dependency_check_window}
                              onChange={(e) => setConfigData(prev => ({...prev, dependency_check_window: e.target.value || 'na'}))}
                              color="gray.700"
                            />
                          </Flex>
                          <IconButton
                            aria-label="clear"
                            icon={<CloseIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setConfigData(prev => ({...prev, dependency_check_window: 'na'}))}
                          />
                        </HStack>

                        {/* Retry */}
                        <HStack
                          w="full"
                          bg="white"
                          p={2}
                          pl={4}
                          spacing={3}
                          borderRadius="md"
                          mb={2}
                          border="1px solid"
                          borderColor="transparent"
                          _hover={{ borderColor: 'purple.200', shadow: 'sm' }}
                          transition="all 0.2s"
                        >
                          <Box w="6px" h="6px" borderRadius="full" bg="gray.200" ml={5} />
                          <TypeBadge type="boolean" />
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="140px">
                            retry_enabled
                          </Text>
                          <Flex flex={1} align="center" bg="gray.50" borderRadius="md" px={2} h="32px">
                            <Select
                              variant="unstyled"
                              size="sm"
                              value={configData.retry || 'na'}
                              onChange={(e) => setConfigData(prev => ({...prev, retry: e.target.value}))}
                              color={configData.retry === 'na' ? 'gray.400' : 'gray.800'}
                            >
                              <option value="na">N/A</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </Select>
                          </Flex>
                          <IconButton
                            aria-label="clear"
                            icon={<CloseIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setConfigData(prev => ({...prev, retry: 'na'}))}
                          />
                        </HStack>

                      </Box>
                    )}
                  </Box>
                )}
              </Box>

            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VisualJsonEditor;