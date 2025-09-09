import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Switch,
  Textarea,
  FormHelperText,
  Progress,
  Text,
  Box,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { ApiService, JobParametersResponse } from './apiService';

// Job configuration interface
export interface JobConfig {
  processingType?: string;
  clnt_id?: string;
  domain_cd?: string;
  sor_cd?: string;
  trgt_pltfrm?: string;
  trgt_tbl_nm?: string;
  trgt_tbl_nm_desc?: string;
  load_type?: string;
  load_frmt_parms?: string;
  pre_load_mthd?: string;
  key_list?: string;
  del_key_list?: string;
  src_file_type?: string;
  need_unload_question?: boolean;
  unld_file_type?: string;
  unld_partn_key?: string;
  unld_frqncy?: string;
  unld_type?: string;
  unld_frmt_parms?: string;
  unld_trgt_pltfrm?: string;
  unld_zone_cd?: string;
  unld_S3_bucket_set?: string;
  dlmtr?: string;
  post_load_mthd?: string;
  job_type?: string;
  etl_job_parms?: string;
  load_frqncy?: string;
  warehouse_size_suffix?: string;
  actv_flag?: string;
  ownrshp_team?: string;
  [key: string]: any;
}

interface JobWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: JobConfig) => void;
  initialConfig?: JobConfig;
}

interface StepConfig {
  id: number;
  title: string;
  fields: string[];
  isComplete: (config: JobConfig) => boolean;
  showForProcessingType?: (processingType?: string) => boolean;
}

// Define which processing types should show the full ingestion configuration
const PROCESSING_TYPES_WITH_FULL_CONFIG = ['ingest', 'ingest_etl', 'ingest-etl'];

// Define processing type specific configurations (can be extended in the future)
const PROCESSING_TYPE_CONFIGS: Record<string, {
  requiredSteps?: string[];
  customFields?: Record<string, string[]>;
}> = {
  ingest: {
    requiredSteps: ['all'] // Show all steps
  },
  'ingest_etl': {
    requiredSteps: ['all'] // Show all steps
  },
  'ingest-etl': {
    requiredSteps: ['all'] // Show all steps
  },
  etl: {
    requiredSteps: ['processing_type_only'] // Only show processing type selection
  },
  stream: {
    requiredSteps: ['processing_type_only'] // Only show processing type selection
  },
  'stream_etl': {
    requiredSteps: ['processing_type_only'] // Only show processing type selection
  },
  'stream-etl': {
    requiredSteps: ['processing_type_only'] // Only show processing type selection
  }
};

const JobWizard: React.FC<JobWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig = {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<JobConfig>(initialConfig);
  const [apiData, setApiData] = useState<JobParametersResponse | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch API data when modal opens
  useEffect(() => {
    if (isOpen && !apiData) {
      setIsLoadingApi(true);
      setApiError(null);

      ApiService.fetchJobParameters()
        .then((data) => {
          setApiData(data);
          if (!data) {
            setApiError('Failed to load configuration options. Using default values.');
          }
        })
        .catch((error) => {
          console.error('Error fetching API data:', error);
          setApiError('Failed to connect to configuration service. Using default values.');
        })
        .finally(() => {
          setIsLoadingApi(false);
        });
    }
  }, [isOpen, apiData]);

  // Define all possible steps
  const allSteps: StepConfig[] = [
    {
      id: 1,
      title: "Processing Type Selection",
      fields: ['processingType'],
      isComplete: (cfg) => !!cfg.processingType?.trim(),
      showForProcessingType: () => true // Always show this step
    },
    {
      id: 2,
      title: "Client & Domain Information",
      fields: ['clnt_id', 'domain_cd', 'sor_cd'],
      isComplete: (cfg) => !!cfg.clnt_id?.trim() && !!cfg.domain_cd?.trim() && !!cfg.sor_cd?.trim(),
      showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
    },
    {
      id: 3,
      title: "Target Platform",
      fields: ['trgt_pltfrm'],
      isComplete: (cfg) => !!cfg.trgt_pltfrm?.trim(),
      showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
    },
    {
      id: 4,
      title: "Table & Load Configuration",
      fields: ['trgt_tbl_nm', 'trgt_tbl_nm_desc', 'load_type', 'load_frmt_parms', 'pre_load_mthd'],
      isComplete: (cfg) => !!cfg.trgt_tbl_nm?.trim() && !!cfg.load_type?.trim(),
      showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
    },
    {
      id: 5,
      title: "Additional Load Configuration",
      fields: ['key_list', 'del_key_list', 'src_file_type'],
      isComplete: (cfg) => {
        const srcFileValid = !!cfg.src_file_type?.trim();
        const keyListValid = cfg.load_type === 'merge' || cfg.load_type === 'distinct_merge'
          ? !!cfg.key_list?.trim() : true;
        const delKeyValid = cfg.load_type === 'delete_append'
          ? !!cfg.del_key_list?.trim() : true;
        return srcFileValid && keyListValid && delKeyValid;
      },
      showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
    },
    {
      id: 6,
      title: "Unload Configuration",
      fields: ['need_unload_question', 'unld_file_type', 'unld_partn_key', 'unld_frqncy', 'unld_type', 'unld_frmt_parms', 'unld_trgt_pltfrm', 'unld_zone_cd', 'unld_S3_bucket_set'],
      isComplete: (cfg) => {
        if (!cfg.need_unload_question) return true;
        return !!cfg.unld_file_type?.trim() && !!cfg.unld_frqncy?.trim() && !!cfg.unld_type?.trim();
      },
      showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
    },
    {
      id: 7,
      title: "Processing & Platform Specific",
      fields: ['dlmtr', 'post_load_mthd', 'job_type', 'etl_job_parms', 'load_frqncy'],
      isComplete: (cfg) => {
        const basicValid = !!cfg.dlmtr?.trim() && !!cfg.post_load_mthd?.trim();
        const s3Valid = cfg.trgt_pltfrm === 's3' ? !!cfg.job_type?.trim() : true;
        const streamValid = cfg.trgt_pltfrm === 'stream' ? !!cfg.load_frqncy?.trim() : true;
        return basicValid && s3Valid && streamValid;
      },
      showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
    },
    {
      id: 8,
      title: "Final Configuration",
      fields: ['warehouse_size_suffix', 'actv_flag', 'ownrshp_team'],
      isComplete: (cfg) => !!cfg.actv_flag?.trim() && !!cfg.ownrshp_team?.trim(),
      showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
    }
  ];

  // Filter steps based on selected processing type
  const steps = useMemo(() => {
    const processingType = config.processingType;
    return allSteps.filter(step => step.showForProcessingType?.(processingType) ?? true);
  }, [config.processingType]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig);
      setCurrentStep(1);
    }
  }, [isOpen, initialConfig]);

  // Reset to step 1 when processing type changes (but only if we're past step 1)
  useEffect(() => {
    if (currentStep > 1 && steps.length === 1) {
      setCurrentStep(1);
    } else if (currentStep > steps.length) {
      setCurrentStep(steps.length);
    }
  }, [steps.length, currentStep]);

  const handleFieldChange = (field: keyof JobConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const canProceedToNext = () => {
    const currentStepConfig = steps.find(s => s.id === currentStep);
    return currentStepConfig ? currentStepConfig.isComplete(config) : false;
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const shouldShowField = (field: string): boolean => {
    switch (field) {
      case 'key_list':
        return config.load_type === 'merge' || config.load_type === 'distinct_merge';
      case 'del_key_list':
        return config.load_type === 'delete_append';
      case 'unld_file_type':
      case 'unld_partn_key':
      case 'unld_frqncy':
      case 'unld_type':
      case 'unld_frmt_parms':
      case 'unld_trgt_pltfrm':
      case 'unld_zone_cd':
      case 'unld_S3_bucket_set':
        return config.need_unload_question === true;
      case 'job_type':
      case 'etl_job_parms':
        return config.trgt_pltfrm === 's3';
      case 'load_frqncy':
        return config.trgt_pltfrm === 'stream';
      default:
        return true;
    }
  };

  // Helper function to render select options from API data or fallback
  const renderSelectOptions = (field: string, fallbackOptions: string[] = []) => {
    const apiOptions = ApiService.getFieldOptions(apiData, field);
    const options = apiOptions.length > 0 ? apiOptions : fallbackOptions;

    return options.map((option) => (
      <option key={option} value={option}>
        {ApiService.formatOptionValue(option)}
      </option>
    ));
  };

  const renderField = (field: string) => {
    if (!shouldShowField(field)) return null;

    const fieldValue = config[field as keyof JobConfig];

    switch (field) {
      case 'processingType':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Processing Type</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('processingType', e.target.value)}
              placeholder="Select processing type"
            >
              {renderSelectOptions('processingType', [
                'ingest', 'etl', 'ingest_etl', 'stream', 'stream_etl'
              ])}
            </Select>
            <FormHelperText>
              {PROCESSING_TYPES_WITH_FULL_CONFIG.includes(fieldValue as string)
                ? "Full configuration will be available for this processing type"
                : fieldValue
                  ? "Only processing type will be configured for this selection"
                  : "Select the processing type for this job"}
            </FormHelperText>
          </FormControl>
        );

      case 'clnt_id':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Client ID</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('clnt_id', e.target.value)}
              placeholder="Enter client ID"
            />
          </FormControl>
        );

      case 'domain_cd':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Domain Code</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('domain_cd', e.target.value)}
              placeholder="Enter domain code"
            />
          </FormControl>
        );

      case 'sor_cd':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>SOR Code</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('sor_cd', e.target.value)}
              placeholder="Enter SOR code"
            />
          </FormControl>
        );

      case 'trgt_pltfrm':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Target Platform</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('trgt_pltfrm', e.target.value)}
              placeholder="Select target platform"
            >
              {renderSelectOptions('trgt_pltfrm', [
                's3', 'stream', 'redshift', 'snowflake', 'rds'
              ])}
            </Select>
          </FormControl>
        );

      case 'trgt_tbl_nm':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Target Table Name</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('trgt_tbl_nm', e.target.value)}
              placeholder="Enter target table name"
            />
          </FormControl>
        );

      case 'trgt_tbl_nm_desc':
        return (
          <FormControl key={field}>
            <FormLabel>Target Table Description</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('trgt_tbl_nm_desc', e.target.value)}
              placeholder="Enter table description"
            />
          </FormControl>
        );

      case 'load_type':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Load Type</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('load_type', e.target.value)}
              placeholder="Select load type"
            >
              {renderSelectOptions('load_type', [
                'full', 'merge', 'append', 'distinct_merge', 'delete_append', 'distinct_append', 'na'
              ])}
            </Select>
          </FormControl>
        );

      case 'load_frmt_parms':
        return (
          <FormControl key={field}>
            <FormLabel>Load Format Parameters</FormLabel>
            <FormHelperText>Optional - JSON format</FormHelperText>
            <Textarea
              value={fieldValue as string || '{}'}
              onChange={(e) => handleFieldChange('load_frmt_parms', e.target.value)}
              placeholder="{}"
              rows={3}
            />
          </FormControl>
        );

      case 'pre_load_mthd':
        return (
          <FormControl key={field}>
            <FormLabel>Pre-Load Method</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('pre_load_mthd', e.target.value)}
              placeholder="Enter pre-load method"
            />
          </FormControl>
        );

      case 'key_list':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Key List</FormLabel>
            <FormHelperText>Required for merge and distinct_merge load types</FormHelperText>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('key_list', e.target.value)}
              placeholder="Enter key list (comma-separated)"
            />
          </FormControl>
        );

      case 'del_key_list':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Delete Key List</FormLabel>
            <FormHelperText>Required for delete_append load type</FormHelperText>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('del_key_list', e.target.value)}
              placeholder="Enter delete key list (comma-separated)"
            />
          </FormControl>
        );

      case 'src_file_type':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Source File Type</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('src_file_type', e.target.value)}
              placeholder="Select source file type"
            >
              {renderSelectOptions('src_file_type', [
                'gzip', 'json', 'parquet', 'avro', 'xml', 'txt'
              ])}
            </Select>
          </FormControl>
        );

      case 'need_unload_question':
        return (
          <FormControl key={field} display="flex" alignItems="center">
            <FormLabel mb={0}>Need Unload?</FormLabel>
            <Switch
              isChecked={fieldValue as boolean || false}
              onChange={(e) => handleFieldChange('need_unload_question', e.target.checked)}
            />
          </FormControl>
        );

      case 'unld_file_type':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Unload File Type</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_file_type', e.target.value)}
              placeholder="Select unload file type"
            >
              {renderSelectOptions('unld_file_type', [
                'csv', 'json', 'parquet', 'hudi', 'gzip', 'csv_zip', 'na'
              ])}
            </Select>
          </FormControl>
        );

      case 'unld_partn_key':
        return (
          <FormControl key={field}>
            <FormLabel>Unload Partition Key</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_partn_key', e.target.value)}
              placeholder="Enter partition key"
            />
          </FormControl>
        );

      case 'unld_frqncy':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Unload Frequency</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_frqncy', e.target.value)}
              placeholder="Select frequency"
            >
              {renderSelectOptions('unld_frqncy', [
                'na', 'daily', 'weekly', 'monthly', 'yearly'
              ])}
            </Select>
          </FormControl>
        );

      case 'unld_type':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Unload Type</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_type', e.target.value)}
              placeholder="Select unload type"
            >
              {renderSelectOptions('unld_type', [
                'na', 'full', 'append', 'merge', 'delete_append'
              ])}
            </Select>
          </FormControl>
        );

      case 'unld_frmt_parms':
        return (
          <FormControl key={field}>
            <FormLabel>Unload Format Parameters</FormLabel>
            <FormHelperText>JSON format</FormHelperText>
            <Textarea
              value={fieldValue as string || '{}'}
              onChange={(e) => handleFieldChange('unld_frmt_parms', e.target.value)}
              placeholder="{}"
              rows={2}
            />
          </FormControl>
        );

      case 'unld_trgt_pltfrm':
        return (
          <FormControl key={field}>
            <FormLabel>Unload Target Platform</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_trgt_pltfrm', e.target.value)}
              placeholder="Select unload target platform"
            >
              {renderSelectOptions('unld_trgt_pltfrm', [
                'na', 'snowflake', 'redshift-snowflake', 'redshift'
              ])}
            </Select>
          </FormControl>
        );

      case 'unld_zone_cd':
        return (
          <FormControl key={field}>
            <FormLabel>Unload Zone Code</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_zone_cd', e.target.value)}
              placeholder="Select zone code"
            >
              {renderSelectOptions('unld_zone_cd', [
                'na', 'cnfz', 'rawz'
              ])}
            </Select>
          </FormControl>
        );

      case 'unld_S3_bucket_set':
        return (
          <FormControl key={field}>
            <FormLabel>Unload S3 Bucket Set</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_S3_bucket_set', e.target.value)}
              placeholder="Select S3 bucket set"
            >
              {renderSelectOptions('unld_S3_bucket_set', [
                'na', '-gbd-phi-', '-gbd-nophi-', '-nogbd-phi-', '-nogbd-nophi-'
              ])}
            </Select>
          </FormControl>
        );

      case 'dlmtr':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Delimiter</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('dlmtr', e.target.value)}
              placeholder="Select delimiter"
            >
              {renderSelectOptions('dlmtr', ['na'])}
            </Select>
          </FormControl>
        );

      case 'post_load_mthd':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Post Load Method</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('post_load_mthd', e.target.value)}
              placeholder="Select post load method"
            >
              {renderSelectOptions('post_load_mthd', ['na'])}
            </Select>
          </FormControl>
        );

      case 'job_type':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Job Type</FormLabel>
            <FormHelperText>Required when target platform is S3</FormHelperText>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('job_type', e.target.value)}
              placeholder="Select job type"
            >
              {renderSelectOptions('job_type', [
                'glue', 'emr', 'lambda', 's3', 'sfn'
              ])}
            </Select>
          </FormControl>
        );

      case 'etl_job_parms':
        return (
          <FormControl key={field}>
            <FormLabel>ETL Job Parameters</FormLabel>
            <FormHelperText>Required when target platform is S3 - JSON format</FormHelperText>
            <Textarea
              value={fieldValue as string || '{}'}
              onChange={(e) => handleFieldChange('etl_job_parms', e.target.value)}
              placeholder="{}"
              rows={3}
            />
          </FormControl>
        );

      case 'load_frqncy':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Load Frequency</FormLabel>
            <FormHelperText>Required when target platform is stream</FormHelperText>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('load_frqncy', e.target.value)}
              placeholder="Select load frequency"
            >
              {renderSelectOptions('load_frqncy', [
                'na', 'daily', 'weekly', 'quarterly', 'yearly', 'monthly'
              ])}
            </Select>
              </FormControl>
        );

      case 'warehouse_size_suffix':
        return (
          <FormControl key={field}>
            <FormLabel>Warehouse Size Suffix</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('warehouse_size_suffix', e.target.value)}
              placeholder="Enter warehouse size suffix"
            />
          </FormControl>
        );

      case 'actv_flag':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Active Flag</FormLabel>
            <Select
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('actv_flag', e.target.value)}
              placeholder="Select active flag"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </Select>
          </FormControl>
        );

      case 'ownrshp_team':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Ownership Team</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('ownrshp_team', e.target.value)}
              placeholder="Enter ownership team"
            />
          </FormControl>
        );

      default:
        return null;
    }
  };

  const currentStepConfig = steps.find(s => s.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  // Check if we can save (depends on processing type)
  const canSave = () => {
    if (steps.length === 1) {
      // Only processing type selection, check if it's selected
      return !!config.processingType?.trim();
    } else {
      // Full configuration, check if all steps are complete
      return canProceedToNext();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent
        width="700px"
        height="600px"
        maxWidth="700px"
        maxHeight="600px"
        display="flex"
        flexDirection="column"
      >
        <ModalHeader flexShrink={0} pb={2}>
          <VStack align="stretch" spacing={2}>
            <Text>Job Configuration Wizard</Text>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Step {currentStep} of {steps.length}: {currentStepConfig?.title}
              </Text>
              <Progress value={progress} colorScheme="blue" size="sm" />
            </Box>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody
          flex="1"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          py={0}
        >
          <Box
            flex="1"
            overflowY="auto"
            pr={2}
            css={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a8a8a8',
              },
            }}
          >
            <VStack spacing={4} align="stretch" py={4}>
              {!canProceedToNext() && currentStep > 1 && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  Please fill in all required fields to proceed.
                </Alert>
              )}

              {currentStepConfig?.fields.map(field => renderField(field))}

              {currentStep === 1 && config.processingType && (
                <Alert
                  status={PROCESSING_TYPES_WITH_FULL_CONFIG.includes(config.processingType) ? "info" : "success"}
                  size="sm"
                >
                  <AlertIcon />
                  {PROCESSING_TYPES_WITH_FULL_CONFIG.includes(config.processingType)
                    ? `You selected "${config.processingType}". Additional configuration steps will be available.`
                    : `You selected "${config.processingType}". Click Save to complete the configuration.`}
                </Alert>
              )}
            </VStack>
          </Box>
        </ModalBody>

        <ModalFooter flexShrink={0} pt={2}>
          <HStack spacing={3}>
            {steps.length > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                isDisabled={currentStep === 1}
              >
                Back
              </Button>
            )}

            {currentStep < steps.length ? (
              <Button
                colorScheme="blue"
                onClick={handleNext}
                isDisabled={!canProceedToNext()}
              >
                Next
              </Button>
            ) : (
              <Button
                colorScheme="green"
                onClick={handleSave}
                isDisabled={!canSave()}
              >
                Save Configuration
              </Button>
            )}
          </HStack>
        </ModalFooter>load_frqncy
      </ModalContent>
    </Modal>
  );
};

export default JobWizard;