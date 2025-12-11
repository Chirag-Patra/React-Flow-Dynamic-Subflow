// OrchConfigJsonEditor.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  RadioGroup,
  Radio,
  Stack,
  IconButton,
  Box,
  Text,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  Badge,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, CopyIcon } from '@chakra-ui/icons';

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

interface OrchConfigJsonEditorProps {
  isOpen: boolean;
  onClose: (data?: OrchConfigData) => void;
  initialData?: OrchConfigData;
}

const OrchConfigJsonEditor: React.FC<OrchConfigJsonEditorProps> = ({
  isOpen,
  onClose,
  initialData = {}
}) => {
  const toast = useToast();
  
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
  const [scheduledDateType, setScheduledDateType] = useState<'dd' | 'dd-mm' | 'EOM' | 'both'>('both');
  const [scheduledDayOptions, setScheduledDayOptions] = useState<ScheduledDayOption[]>([{ day: '', week: '' }]);
  const [startCutoffTime, setStartCutoffTime] = useState('');
  const [endCutoffTime, setEndCutoffTime] = useState('');
  const [timeSymbol, setTimeSymbol] = useState<'>=' | '<=' | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize data from props
  useEffect(() => {
    if (isOpen && initialData) {
      const parsedData = { ...defaultData, ...initialData };
      setConfigData(parsedData);
      
      // Parse scheduled_cutoff_time
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
      }
      
      // Parse scheduled_day
      if (parsedData.scheduled_day) {
        const dayOptions = parsedData.scheduled_day.split(',').map(item => {
          const [day, week] = item.split('-');
          return { day: day || '', week: week || '' };
        });
        setScheduledDayOptions(dayOptions.length > 0 ? dayOptions : [{ day: '', week: '' }]);
      }
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field: keyof OrchConfigData, value: any) => {
    setConfigData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateScheduledDate = (value: string) => {
    if (!value) return '';
    
    const dates = value.split(',');
    const ddRegex = /^\d{2}$/;
    const ddMmRegex = /^\d{2}-\d{2}$/;
    
    for (const date of dates) {
      const trimmed = date.trim();
      
      if (scheduledDateType === 'dd') {
        if (!ddRegex.test(trimmed) || parseInt(trimmed) > 31 || parseInt(trimmed) < 1) {
          return 'Date format should be dd (01-31)';
        }
      } else if (scheduledDateType === 'dd-mm') {
        if (!ddMmRegex.test(trimmed)) {
          return 'Date format should be dd-mm';
        }
        const [day, month] = trimmed.split('-').map(Number);
        if (day > 31 || day < 1 || month > 12 || month < 1) {
          return 'Invalid day or month';
        }
      } else if (scheduledDateType === 'EOM') {
        if (!trimmed.startsWith('EOM')) {
          return 'Date format should start with EOM';
        }
      } else if (scheduledDateType === 'both') {
        if (!trimmed.startsWith('EOM') && !trimmed.startsWith('na')) {
          if (trimmed.includes('-')) {
            if (!ddMmRegex.test(trimmed)) {
              return 'Invalid format for dd-mm';
            }
          } else {
            if (!ddRegex.test(trimmed)) {
              return 'Invalid format for dd';
            }
          }
        }
      }
    }
    return '';
  };

  const addScheduledDayOption = () => {
    setScheduledDayOptions(prev => [...prev, { day: '', week: '' }]);
  };

  const removeScheduledDayOption = (index: number) => {
    if (scheduledDayOptions.length > 1) {
      const updated = scheduledDayOptions.filter((_, i) => i !== index);
      setScheduledDayOptions(updated);
      updateScheduledDay(updated);
    }
  };

  const updateScheduledDayOption = (index: number, field: 'day' | 'week', value: string) => {
    const updated = [...scheduledDayOptions];
    updated[index] = { ...updated[index], [field]: value };
    setScheduledDayOptions(updated);
    updateScheduledDay(updated);
  };

  const updateScheduledDay = (options: ScheduledDayOption[]) => {
    const formatted = options
      .filter(opt => opt.day)
      .map(opt => opt.week ? `${opt.day}-${opt.week}` : opt.day)
      .join(',');
    setConfigData(prev => ({ ...prev, scheduled_day: formatted }));
  };

  const buildScheduledCutoffTime = () => {
    if (!startCutoffTime && !endCutoffTime) return '';
    
    let result = '';
    if (startCutoffTime && timeSymbol) {
      result = `${timeSymbol}${startCutoffTime}`;
    }
    if (endCutoffTime && (timeSymbol === '>=' || !timeSymbol)) {
      result += result ? `,<=${endCutoffTime}` : `<=${endCutoffTime}`;
    }
    return result;
  };

  const handleSave = () => {
    // Validate
    const newErrors: Record<string, string> = {};
    
    if (configData.scheduled_dt) {
      const dateError = validateScheduledDate(configData.scheduled_dt);
      if (dateError) newErrors.scheduled_dt = dateError;
    }

    if (endCutoffTime && !startCutoffTime && timeSymbol !== '<=') {
      newErrors.scheduled_cutoff_time = 'Start cutoff time cannot be empty when end time is set';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the validation errors before saving',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Build final data
    const finalData = {
      ...configData,
      scheduled_cutoff_time: buildScheduledCutoffTime(),
      dpndnt_job_id_lst: Array.isArray(configData.dpndnt_job_id_lst) 
        ? configData.dpndnt_job_id_lst 
        : configData.dpndnt_job_id_lst ? [configData.dpndnt_job_id_lst as any] : [],
      dpndnt_btch_id_lst: Array.isArray(configData.dpndnt_btch_id_lst)
        ? configData.dpndnt_btch_id_lst
        : configData.dpndnt_btch_id_lst ? [configData.dpndnt_btch_id_lst as any] : [],
    };

    // Remove empty or 'na' values
    Object.keys(finalData).forEach(key => {
      const value = finalData[key as keyof OrchConfigData];
      if (value === '' || value === 'na' || (Array.isArray(value) && value.length === 0)) {
        delete finalData[key as keyof OrchConfigData];
      }
    });

    onClose(finalData);
  };

  const handleCopyToClipboard = () => {
    const jsonString = JSON.stringify(configData, null, 2);
    navigator.clipboard.writeText(jsonString);
    toast({
      title: 'Copied!',
      description: 'JSON data copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Orchestrator Configuration Editor</Text>
            <Badge colorScheme="blue">JSON Editor</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            
            {/* Dependent Job Configuration */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3}>Dependency Configuration</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel>Dependent Job ID List</FormLabel>
                    <Textarea
                      placeholder="Enter job IDs (comma-separated or JSON array)"
                      value={Array.isArray(configData.dpndnt_job_id_lst) 
                        ? configData.dpndnt_job_id_lst.join(', ')
                        : configData.dpndnt_job_id_lst || ''}
                      onChange={(e) => handleInputChange('dpndnt_job_id_lst', e.target.value.split(', '))}
                      rows={3}
                    />
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl>
                    <FormLabel>Dependent Batch ID List</FormLabel>
                    <Textarea
                      placeholder="Enter batch IDs (comma-separated or JSON array)"
                      value={Array.isArray(configData.dpndnt_btch_id_lst)
                        ? configData.dpndnt_btch_id_lst.join(', ')
                        : configData.dpndnt_btch_id_lst || ''}
                      onChange={(e) => handleInputChange('dpndnt_btch_id_lst', e.target.value.split(', '))}
                      rows={3}
                    />
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl>
                    <FormLabel>Dependent Job Process Type</FormLabel>
                    <Select
                      value={configData.dpndnt_job_process_type || 'na'}
                      onChange={(e) => handleInputChange('dpndnt_job_process_type', e.target.value)}
                    >
                      <option value="na">N/A</option>
                      <option value="batch">Batch</option>
                      <option value="stream">Stream</option>
                      <option value="real-time">Real-time</option>
                    </Select>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl>
                    <FormLabel>Dependent Cutoff Date</FormLabel>
                    <Input
                      type="date"
                      value={configData.dpndnt_cutoff_dt || ''}
                      onChange={(e) => handleInputChange('dpndnt_cutoff_dt', e.target.value)}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Scheduling Configuration */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3}>Scheduling Configuration</Text>
              
              {/* Scheduled Cutoff Time */}
              <FormControl mb={4} isInvalid={!!errors.scheduled_cutoff_time}>
                <FormLabel>Scheduled Cutoff Time</FormLabel>
                <HStack spacing={3}>
                  <Select
                    value={timeSymbol}
                    onChange={(e) => setTimeSymbol(e.target.value as any)}
                    width="100px"
                  >
                    <option value="">None</option>
                    <option value=">=">{'>='}</option>
                    <option value="<=">{'<='}</option>
                  </Select>
                  
                  <Input
                    type="time"
                    step="1"
                    value={startCutoffTime}
                    onChange={(e) => setStartCutoffTime(e.target.value)}
                    placeholder="Start time"
                  />
                  
                  {(timeSymbol === '>=' || !timeSymbol) && (
                    <>
                      <Text>to</Text>
                      <Input
                        type="time"
                        step="1"
                        value={endCutoffTime}
                        onChange={(e) => setEndCutoffTime(e.target.value)}
                        placeholder="End time (optional)"
                      />
                    </>
                  )}
                </HStack>
                {errors.scheduled_cutoff_time && (
                  <Text color="red.500" fontSize="sm">{errors.scheduled_cutoff_time}</Text>
                )}
              </FormControl>

              {/* Scheduled Day */}
              <FormControl mb={4}>
                <FormLabel>Scheduled Day</FormLabel>
                <VStack align="stretch" spacing={2}>
                  <Input
                    value={configData.scheduled_day || ''}
                    placeholder="Generated from options below"
                    isReadOnly
                    bg="gray.50"
                  />
                  {scheduledDayOptions.map((option, index) => (
                    <HStack key={index} spacing={3}>
                      <Select
                        value={option.day}
                        onChange={(e) => updateScheduledDayOption(index, 'day', e.target.value)}
                        placeholder="Select day"
                        flex={2}
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </Select>
                      
                      <Select
                        value={option.week}
                        onChange={(e) => updateScheduledDayOption(index, 'week', e.target.value)}
                        placeholder="Week"
                        flex={1}
                      >
                        <option value="01">01</option>
                        <option value="02">02</option>
                        <option value="03">03</option>
                        <option value="04">04</option>
                        <option value="EOM">EOM</option>
                      </Select>
                      
                      <IconButton
                        aria-label="Add option"
                        icon={<AddIcon />}
                        onClick={addScheduledDayOption}
                        size="sm"
                      />
                      
                      {scheduledDayOptions.length > 1 && (
                        <IconButton
                          aria-label="Remove option"
                          icon={<DeleteIcon />}
                          onClick={() => removeScheduledDayOption(index)}
                          colorScheme="red"
                          size="sm"
                        />
                      )}
                    </HStack>
                  ))}
                </VStack>
              </FormControl>

              {/* Scheduled Date */}
              <FormControl mb={4} isInvalid={!!errors.scheduled_dt}>
                <FormLabel>Scheduled Date</FormLabel>
                <RadioGroup value={scheduledDateType} onChange={(value) => setScheduledDateType(value as any)}>
                  <Stack direction="row" mb={2}>
                    <Radio value="dd">DD</Radio>
                    <Radio value="dd-mm">DD-MM</Radio>
                    <Radio value="EOM">EOM</Radio>
                    <Radio value="both">All Formats</Radio>
                  </Stack>
                </RadioGroup>
                <Input
                  value={configData.scheduled_dt || ''}
                  onChange={(e) => handleInputChange('scheduled_dt', e.target.value)}
                  placeholder={`Enter dates in ${scheduledDateType} format (comma-separated)`}
                />
                {errors.scheduled_dt && (
                  <Text color="red.500" fontSize="sm">{errors.scheduled_dt}</Text>
                )}
              </FormControl>
            </Box>

            <Divider />

            {/* System Configuration */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3}>System Configuration</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel>Dependency Check Window (days)</FormLabel>
                    <Select
                      value={configData.dependency_check_window || 'na'}
                      onChange={(e) => handleInputChange('dependency_check_window', e.target.value)}
                    >
                      <option value="na">N/A</option>
                      {Array.from({ length: 91 }, (_, i) => (
                        <option key={i} value={i.toString()}>{i}</option>
                      ))}
                    </Select>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl>
                    <FormLabel>Keep Active (days)</FormLabel>
                    <Select
                      value={configData.keep_active_in_days || 'na'}
                      onChange={(e) => handleInputChange('keep_active_in_days', e.target.value)}
                    >
                      <option value="na">N/A</option>
                      {Array.from({ length: 91 }, (_, i) => (
                        <option key={i} value={i.toString()}>{i}</option>
                      ))}
                    </Select>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl>
                    <FormLabel>Check All Dependent Job Steps</FormLabel>
                    <RadioGroup
                      value={configData.check_all_dpndnt_job_steps || 'na'}
                      onChange={(value) => handleInputChange('check_all_dpndnt_job_steps', value)}
                    >
                      <Stack direction="row">
                        <Radio value="yes">Yes</Radio>
                        <Radio value="no">No</Radio>
                        <Radio value="na">N/A</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl>
                    <FormLabel>Retry</FormLabel>
                    <RadioGroup
                      value={configData.retry || 'na'}
                      onChange={(value) => handleInputChange('retry', value)}
                    >
                      <Stack direction="row">
                        <Radio value="yes">Yes</Radio>
                        <Radio value="no">No</Radio>
                        <Radio value="na">N/A</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            {/* JSON Preview */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3}>JSON Preview</Text>
              <Box position="relative">
                <Textarea
                  value={JSON.stringify({ ...configData, scheduled_cutoff_time: buildScheduledCutoffTime() }, null, 2)}
                  isReadOnly
                  bg="gray.50"
                  fontFamily="mono"
                  fontSize="sm"
                  rows={8}
                />
                <IconButton
                  aria-label="Copy JSON"
                  icon={<CopyIcon />}
                  onClick={handleCopyToClipboard}
                  position="absolute"
                  top={2}
                  right={2}
                  size="sm"
                />
              </Box>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={handleCopyToClipboard} leftIcon={<CopyIcon />}>
              Copy JSON
            </Button>
            <Button variant="outline" onClick={() => onClose()}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              Save Configuration
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OrchConfigJsonEditor;