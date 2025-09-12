// JobWizard.tsx (Refactored)
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
  VStack,
  HStack,
  Progress,
  Text,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ApiService, JobParametersResponse } from '../../apiService';
import DynamicFormField from '../DynamicFormField';
import { JOB_FIELD_CONFIGS, PROCESSING_TYPES_WITH_FULL_CONFIG } from './jobFieldConfig';

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

  // Filter steps based on selected processing type
  const steps = useMemo(() => {
    const processingType = config.processingType;
    return JOB_FIELD_CONFIGS.filter(step =>
      step.showForProcessingType?.(processingType) ?? true
    );
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

  const currentStepConfig = steps.find(s => s.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

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

              {apiError && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  {apiError}
                </Alert>
              )}

              {currentStepConfig?.fields.map(fieldConfig => (
                <DynamicFormField
                  key={fieldConfig.key}
                  fieldConfig={fieldConfig}
                  value={config[fieldConfig.key]}
                  onChange={handleFieldChange}
                  apiData={apiData}
                  config={config}
                />
              ))}

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
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobWizard;