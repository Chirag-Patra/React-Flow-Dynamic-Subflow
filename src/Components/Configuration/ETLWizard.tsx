// ETLWizard.tsx - Clean rewrite
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
  Progress,
  Text,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import DynamicFormField from './DynamicFormField';
import { ETL_FIELD_CONFIGS } from './etlFieldConfig';

// ETL configuration interface
export interface ETLConfig {
  // Component type selection
  is_reusable_component: boolean;
  reusable_component_type: string;

  // ETL fields
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
  [key: string]: any;
}

interface ETLWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ETLConfig) => void;
  initialConfig?: Partial<ETLConfig>;
}

const ETLWizard: React.FC<ETLWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig = {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<ETLConfig>({
    is_reusable_component: false,
    reusable_component_type: "",
    etl_stp_job_nm: "",
    etl_stp_desc: "",
    etl_stp_sqnc_nbr: 1,
    etl_stp_src_platfrm: "",
    etl_stp_src_schma: "",
    etl_stp_src_stg_schma: "",
    etl_stp_trgt_tbl_nm: "",
    etl_stp_trgt_platfrm: "",
    etl_stp_trgt_schma: "",
    etl_stp_trgt_stg_schma: "",
    etl_stp_parms: "{}",
    etl_stp_s3_code_bkt: "",
    etl_stp_s3_code_key: "",
    etl_stp_s3_log_bkt: "",
    actv_flag: true,
  });

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultConfig = {
        is_reusable_component: false,
        reusable_component_type: "",
        etl_stp_job_nm: "",
        etl_stp_desc: "",
        etl_stp_sqnc_nbr: 1,
        etl_stp_src_platfrm: "",
        etl_stp_src_schma: "",
        etl_stp_src_stg_schma: "",
        etl_stp_trgt_tbl_nm: "",
        etl_stp_trgt_platfrm: "",
        etl_stp_trgt_schma: "",
        etl_stp_trgt_stg_schma: "",
        etl_stp_parms: "{}",
        etl_stp_s3_code_bkt: "",
        etl_stp_s3_code_key: "",
        etl_stp_s3_log_bkt: "",
        actv_flag: true,
        ...initialConfig
      };
      setConfig(defaultConfig);
      setCurrentStep(1);
    }
  }, [isOpen, initialConfig]);

  const handleFieldChange = (field: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };

      // Clear reusable component type if switching off reusable component
      if (field === 'is_reusable_component' && !value) {
        newConfig.reusable_component_type = "";
      }

      return newConfig;
    });
  };

  const getCurrentStepConfig = () => {
    return ETL_FIELD_CONFIGS.find(step => step.id === currentStep) || ETL_FIELD_CONFIGS[0];
  };

  const isCurrentStepComplete = () => {
    const stepConfig = getCurrentStepConfig();
    return stepConfig.isComplete(config);
  };

  const handleNext = () => {
    if (isCurrentStepComplete() && currentStep < ETL_FIELD_CONFIGS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const configWithType = {
      ...config,
      componentType: config.is_reusable_component && config.reusable_component_type
        ? config.reusable_component_type
        : ''
    };
    onSave(configWithType);
    onClose();
  };

  const canSave = () => {
    return ETL_FIELD_CONFIGS.every(step => step.isComplete(config));
  };

  const currentStepConfig = getCurrentStepConfig();
  const progress = (currentStep / ETL_FIELD_CONFIGS.length) * 100;
  const isLastStep = currentStep === ETL_FIELD_CONFIGS.length;

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
            <Text>ETL Configuration Wizard</Text>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Step {currentStep} of {ETL_FIELD_CONFIGS.length}: {currentStepConfig.title}
              </Text>
              <Progress value={progress} colorScheme="green" size="sm" />
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
              {/* Warning alert for incomplete steps */}
              {!isCurrentStepComplete() && currentStep > 1 && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  Please fill in all required fields to proceed.
                </Alert>
              )}

              {/* Render current step fields */}
              {currentStepConfig.fields.map(fieldConfig => (
                <DynamicFormField
                  key={String(fieldConfig.key)}
                  fieldConfig={fieldConfig}
                  value={config[fieldConfig.key]}
                  onChange={handleFieldChange}
                  apiData={null}
                  config={config}
                />
              ))}

              {/* Step 1 info alert */}
              {currentStep === 1 && (
                <Alert status="info" size="sm">
                  <AlertIcon />
                  {config.is_reusable_component
                    ? config.reusable_component_type
                      ? `Using reusable component: "${config.reusable_component_type}"`
                      : 'Reusable component enabled. Please select a component type.'
                    : 'Creating ETL component.'
                  }
                </Alert>
              )}

              {/* Final step completion alert */}
              {isLastStep && canSave() && (
                <Alert status="success" size="sm">
                  <AlertIcon />
                  Configuration complete! Click Save to finalize your ETL setup.
                </Alert>
              )}
            </VStack>
          </Box>
        </ModalBody>

        <ModalFooter flexShrink={0} pt={2}>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handlePrevious}
              isDisabled={currentStep === 1}
            >
              Back
            </Button>

            {isLastStep ? (
              <Button
                colorScheme="green"
                onClick={handleSave}
                isDisabled={!canSave()}
              >
                Save Configuration
              </Button>
            ) : (
              <Button
                colorScheme="green"
                onClick={handleNext}
                isDisabled={!isCurrentStepComplete()}
              >
                Next
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ETLWizard;