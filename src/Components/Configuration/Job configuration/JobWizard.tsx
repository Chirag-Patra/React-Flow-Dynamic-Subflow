// JobWizard.tsx (Updated with Submit API)
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

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

  // Function to build the API payload
  const buildApiPayload = (config: JobConfig) => {
    return {
      "aplctn_cd": "ABCSRNL",
      "domain_cd": config.domain_cd || "acct",
      "clnt_id": config.clnt_id || "1",
      "sor_cd": config.sor_cd || "abacus",
      "trgt_tbl_nm": config.trgt_tbl_nm || "test_chirag_wf",
      "trgt_schma": "edl",
      "trgt_db_nm": "d01_edl",
      "prcsng_type": config.processingType || "ingest",
      "load_type": config.load_type || "full",
      "load_frmt_parms": config.load_frmt_parms || "{}",
      "pre_load_mthd": config.pre_load_mthd || "na",
      "s3_inbnd_bkt": "crln-313460006431-ssm-dev-filetransfer",
      "s3_bkup_bkt": "na",
      "trgt_pltfrm": config.trgt_pltfrm || "snowflake",
      "stg_schma": "edl_stg",
      "key_list": config.key_list || "{\"filter\":\"NA\",\"default\":[\"*\"],\"orderby\":[\"NA\"],\"partitionby\":[\"NA\"]}",
      "del_key_list": config.del_key_list || "na",
      "src_file_type": config.src_file_type || "gzip",
      "unld_file_type": config.unld_file_type || "gzip",
      "unld_partn_key": config.unld_partn_key || "na",
      "unld_frqncy": config.unld_frqncy || "na",
      "unld_type": config.unld_type || "na",
      "unld_frmt_parms": config.unld_frmt_parms || "{}",
      "unld_zone_cd": config.unld_zone_cd || "cnfz",
      "unld_trgt_pltfrm": config.unld_trgt_pltfrm || "snowflake",
      "vrnc_alwd_pct": "0.0",
      "dlmtr": config.dlmtr || "na",
      "post_load_mthd": config.post_load_mthd || "na",
      "job_type": config.job_type || "glue",
      "etl_job_parms": config.etl_job_parms || "{}",
      "sys_job_parms": "{}",
      "cfx_ftp_dtls": "{}",
      "kafka_dtls": "{}",
      "load_frqncy": config.load_frqncy || "daily",
      "dscvr_schma_flag": "n",
      "rqstr_id": "al84771",
      "ownrshp_team": config.ownrshp_team || "AEDL",
      "unld_S3_bucket_set": config.unld_S3_bucket_set || "-gbd-phi-",
      "warehouse_size_suffix": config.warehouse_size_suffix || "--BLANK--",
      "data_copy_flag": "n",
      "actv_flag": config.actv_flag || "n",
      "last_updt_userid": "SYSTEM",
      "s3_bkt_key_cmbntn": `crln-313460006431-ssm-dev-filetransfer/inbound/abcsrnl/${config.domain_cd || "acct"}/${config.sor_cd || "abacus"}/${config.trgt_tbl_nm || "test_chirag_wf"}`,
      "job_id": "221124101",
      "job_nm": `${config.processingType || "ingest"}-${config.trgt_tbl_nm || "test_chirag_wf"}`,
      "s3_inbnd_key": `inbound/abcsrnl/${config.domain_cd || "acct"}/${config.sor_cd || "abacus"}/${config.trgt_tbl_nm || "test_chirag_wf"}`,
      "s3_archv_key": `abcsrnl/${config.domain_cd || "acct"}/${config.sor_cd || "abacus"}/${config.trgt_tbl_nm || "test_chirag_wf"}`,
      "s3_bkup_key": `abcsrnl/${config.domain_cd || "acct"}/${config.sor_cd || "abacus"}/${config.trgt_tbl_nm || "test_chirag_wf"}`,
      "s3_app_key": `abcsrnl/${config.domain_cd || "acct"}/${config.sor_cd || "abacus"}/${config.trgt_tbl_nm || "test_chirag_wf"}`,
      "s3_cnsmptn_key": `${config.domain_cd || "acct"}/${config.sor_cd || "abacus"}/${config.trgt_tbl_nm || "test_chirag_wf"}`,
      "s3_archv_bkt": "crln-abcsrnl-dev-archz-gbd-phi-useast2",
      "s3_app_bkt": "crln-abcsrnl-dev-dataz-gbd-phi-useast2",
      "s3_cnsmptn_bkt": "crln-sf-dev-dataz-gbd-phi-useast2",
      "del_tbl_nm": `${config.trgt_tbl_nm || "test_chirag_wf"}_del`,
      "stg_tbl_nm": `${config.trgt_tbl_nm || "test_chirag_wf"}_stg`
    };
  };

  // Function to submit the configuration
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const payload = buildApiPayload(config);

      const response = await fetch('https://aedl-/api/processing/metadata-request?env=DEV', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'hhhh'
        },
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

        // Optionally call onSave as well
        onSave(config);
        onClose();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error submitting configuration:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error",
        description: `Failed to submit configuration: ${message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
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

export default JobWizard;