// UniversalWizard.tsx
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
  useToast,
} from '@chakra-ui/react';
import { DynamicFormSchema, FormConfig, DynamicStep } from './dynamicFormTypes';
import { evaluateCondition, evaluateStepCompletion } from './formLogic';
import UniversalFormField from './UniversalFormField';
import { ApiService, JobParametersResponse } from '../../apiService';

interface UniversalWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: FormConfig) => void;
  initialConfig?: FormConfig;
  schema: DynamicFormSchema;
}

const UniversalWizard: React.FC<UniversalWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig = {},
  schema
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<FormConfig>(initialConfig);
  const [apiData, setApiData] = useState<JobParametersResponse | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicSchema, setDynamicSchema] = useState<DynamicFormSchema>(schema);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const toast = useToast();

  // Fetch schema from backend (COMMENTED OUT - Ready for backend integration)
  // useEffect(() => {
  //   if (isOpen && schema.formType) {
  //     setIsLoadingSchema(true);
  //
  //     fetch(`/api/wizard-schemas/${schema.formType}`)
  //       .then(res => {
  //         if (!res.ok) {
  //           throw new Error(`Failed to fetch schema: ${res.status}`);
  //         }
  //         return res.json();
  //       })
  //       .then(backendSchema => {
  //         // Replace with backend schema
  //         setDynamicSchema(backendSchema);
  //         console.log('Loaded schema from backend:', backendSchema);
  //       })
  //       .catch(error => {
  //         console.error('Error fetching schema from backend:', error);
  //         // Fall back to hardcoded schema
  //         setDynamicSchema(schema);
  //         toast({
  //           title: "Schema Load Warning",
  //           description: "Using local schema. Backend schema unavailable.",
  //           status: "warning",
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       })
  //       .finally(() => {
  //         setIsLoadingSchema(false);
  //       });
  //   }
  // }, [isOpen, schema.formType]);

  // For now, use the hardcoded schema passed as prop
  useEffect(() => {
    if (isOpen) {
      setDynamicSchema(schema);
    }
  }, [isOpen, schema]);

  // Fetch API data for dropdown options when modal opens
//   useEffect(() => {
//     if (isOpen && !apiData) {
//       setIsLoadingApi(true);
//       setApiError(null);

//       ApiService.fetchJobParameters()
//         .then((data) => {
//           setApiData(data);
//           if (!data) {
//             setApiError('Failed to load configuration options. Using default values.');
//           }
//         })
//         .catch((error) => {
//           console.error('Error fetching API data:', error);
//           setApiError('Failed to connect to configuration service. Using default values.');
//         })
//         .finally(() => {
//           setIsLoadingApi(false);
//         });
//     }
//   }, [isOpen, apiData]);

  // Filter visible steps based on current config
  const visibleSteps = useMemo(() => {
    return dynamicSchema.steps.filter(step => {
      if (step.visibility.type === 'always') return true;
      if (step.visibility.condition) {
        return evaluateCondition(config, step.visibility.condition);
      }
      return true;
    });
  }, [dynamicSchema.steps, config]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig);
      setCurrentStep(1);
    }
  }, [isOpen, initialConfig]);

  // Adjust current step if it exceeds visible steps
  useEffect(() => {
    if (currentStep > visibleSteps.length && visibleSteps.length > 0) {
      setCurrentStep(visibleSteps.length);
    }
  }, [visibleSteps.length, currentStep]);

  const handleFieldChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const canProceedToNext = () => {
    const currentStepConfig = visibleSteps.find(s => s.id === currentStep);
    if (!currentStepConfig) return false;
    return evaluateStepCompletion(config, currentStepConfig);
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < visibleSteps.length) {
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { url, method, headers } = dynamicSchema.submitEndpoint;

      // TODO: Implement payload mapping logic based on payloadMapping
      // For now, send the raw config
      const payload = config;

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Configuration submitted successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        onSave(config);
        onClose();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error submitting configuration:', error);
      toast({
        title: "Error",
        description: `Failed to submit configuration: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSave = () => {
    if (visibleSteps.length === 0) return false;
    const lastStep = visibleSteps[visibleSteps.length - 1];
    return evaluateStepCompletion(config, lastStep);
  };

  const currentStepConfig = visibleSteps.find(s => s.id === currentStep);
  const progress = (currentStep / visibleSteps.length) * 100;

  // Show loading state while fetching schema
  if (isLoadingSchema) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Loading Configuration...</ModalHeader>
          <ModalBody>
            <VStack spacing={4} py={8}>
              <Progress size="xs" isIndeterminate width="100%" colorScheme="blue" />
              <Text fontSize="sm" color="gray.600">
                Fetching wizard configuration from server...
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

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
            <Text>{dynamicSchema.title}</Text>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Step {currentStep} of {visibleSteps.length}: {currentStepConfig?.title}
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

              {currentStepConfig?.description && (
                <Text fontSize="sm" color="gray.600">
                  {currentStepConfig.description}
                </Text>
              )}

              {currentStepConfig?.fields.map(fieldConfig => (
                <UniversalFormField
                  key={fieldConfig.key}
                  fieldConfig={fieldConfig}
                  value={config[fieldConfig.key]}
                  onChange={handleFieldChange}
                  apiData={apiData}
                  config={config}
                />
              ))}
            </VStack>
          </Box>
        </ModalBody>

        <ModalFooter flexShrink={0} pt={2}>
          <HStack spacing={3}>
            {visibleSteps.length > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                isDisabled={currentStep === 1}
              >
                Back
              </Button>
            )}

            {currentStep < visibleSteps.length ? (
              <Button
                colorScheme="blue"
                onClick={handleNext}
                isDisabled={!canProceedToNext()}
              >
                Next
              </Button>
            ) : (
              <>
                <Button
                  colorScheme="green"
                  onClick={handleSave}
                  isDisabled={!canSave()}
                >
                  Save Configuration
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isDisabled={!canSave()}
                  isLoading={isSubmitting}
                  loadingText="Submitting..."
                >
                  Submit
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UniversalWizard;