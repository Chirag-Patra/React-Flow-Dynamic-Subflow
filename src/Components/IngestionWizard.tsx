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
} from '@chakra-ui/react';
import { IngestionConfig } from './IngestionConfiguration';

interface IngestionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: IngestionConfig) => void;
  initialConfig?: IngestionConfig;
}

interface StepConfig {
  id: number;
  title: string;
  fields: string[];
  isComplete: (config: IngestionConfig) => boolean;
}

const IngestionWizard: React.FC<IngestionWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig = {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<IngestionConfig>(initialConfig);

  // Define step configuration
  const steps: StepConfig[] = [
    {
      id: 1,
      title: "Processing Type",
      fields: ['prcsng_type'],
      isComplete: (cfg) => !!cfg.prcsng_type?.trim()
    },
    {
      id: 2,
      title: "Client & Domain Information",
      fields: ['clnt_id', 'domain_cd', 'sor_cd'],
      isComplete: (cfg) => !!cfg.clnt_id?.trim() && !!cfg.domain_cd?.trim() && !!cfg.sor_cd?.trim()
    },
    {
      id: 3,
      title: "Target Platform",
      fields: ['trgt_pltfrm'],
      isComplete: (cfg) => !!cfg.trgt_pltfrm?.trim()
    },
    {
      id: 4,
      title: "Table & Load Configuration",
      fields: ['trgt_tbl_nm', 'trgt_tbl_nm_desc', 'load_type', 'load_frmt_parms', 'pre_load_mthd'],
      isComplete: (cfg) => !!cfg.trgt_tbl_nm?.trim() && !!cfg.load_type?.trim() && !!cfg.pre_load_mthd?.trim()
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
      }
    },
    {
      id: 6,
      title: "Unload Configuration",
      fields: ['need_unload_question', 'unld_file_type', 'unld_partn_key', 'unld_frqncy', 'unld_type', 'unld_frmt_parms', 'unld_trgt_pltfrm', 'unld_zone_cd', 'unld_S3_bucket_set'],
      isComplete: (cfg) => {
        if (!cfg.need_unload_question) return true;
        return !!cfg.unld_file_type?.trim() && !!cfg.unld_frqncy?.trim() && !!cfg.unld_type?.trim();
      }
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
      }
    },
    {
      id: 8,
      title: "Final Configuration",
      fields: ['warehouse_size_suffix', 'actv_flag', 'ownrshp_team'],
      isComplete: (cfg) => !!cfg.actv_flag?.trim() && !!cfg.ownrshp_team?.trim()
    }
  ];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig);
      setCurrentStep(1);
    }
  }, [isOpen, initialConfig]);

  const handleFieldChange = (field: keyof IngestionConfig, value: any) => {
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

  const renderField = (field: string) => {
    if (!shouldShowField(field)) return null;

    const fieldValue = config[field as keyof IngestionConfig];

    switch (field) {
      case 'prcsng_type':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Processing Type</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('prcsng_type', e.target.value)}
              placeholder="Enter processing type"
            />
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
              <option value="s3">S3</option>
              <option value="stream">Stream</option>
              <option value="redshift">Redshift</option>
              <option value="snowflake">Snowflake</option>
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
              <option value="merge">Merge</option>
              <option value="distinct_merge">Distinct Merge</option>
              <option value="delete_append">Delete Append</option>
              <option value="append">Append</option>
              <option value="overwrite">Overwrite</option>
            </Select>
          </FormControl>
        );

      case 'load_frmt_parms':
        return (
          <FormControl key={field}>
            <FormLabel>Load Format Parameters</FormLabel>
            <FormHelperText>Optional</FormHelperText>
            <Textarea
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('load_frmt_parms', e.target.value)}
              placeholder="Enter load format parameters"
              rows={3}
            />
          </FormControl>
        );

      case 'pre_load_mthd':
        return (
          <FormControl key={field} isRequired>
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
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="parquet">Parquet</option>
              <option value="avro">Avro</option>
              <option value="orc">ORC</option>
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
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="parquet">Parquet</option>
              <option value="avro">Avro</option>
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
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="on-demand">On Demand</option>
            </Select>
          </FormControl>
        );

      case 'unld_type':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Unload Type</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_type', e.target.value)}
              placeholder="Enter unload type"
            />
          </FormControl>
        );

      case 'unld_frmt_parms':
        return (
          <FormControl key={field}>
            <FormLabel>Unload Format Parameters</FormLabel>
            <Textarea
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_frmt_parms', e.target.value)}
              placeholder="Enter unload format parameters"
              rows={2}
            />
          </FormControl>
        );

      case 'unld_trgt_pltfrm':
        return (
          <FormControl key={field}>
            <FormLabel>Unload Target Platform</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_trgt_pltfrm', e.target.value)}
              placeholder="Enter unload target platform"
            />
          </FormControl>
        );

      case 'unld_zone_cd':
        return (
          <FormControl key={field}>
            <FormLabel>Unload Zone Code</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_zone_cd', e.target.value)}
              placeholder="Enter zone code"
            />
          </FormControl>
        );

      case 'unld_S3_bucket_set':
        return (
          <FormControl key={field}>
            <FormLabel>Unload S3 Bucket Set</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('unld_S3_bucket_set', e.target.value)}
              placeholder="Enter S3 bucket set"
            />
          </FormControl>
        );

      case 'dlmtr':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Delimiter</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('dlmtr', e.target.value)}
              placeholder="Enter delimiter (e.g., comma, pipe)"
            />
          </FormControl>
        );

      case 'post_load_mthd':
        return (
          <FormControl key={field} isRequired>
            <FormLabel>Post Load Method</FormLabel>
            <Input
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('post_load_mthd', e.target.value)}
              placeholder="Enter post load method"
            />
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
              <option value="glue">Glue</option>
              <option value="emr">EMR</option>
              <option value="lambda">Lambda</option>
            </Select>
          </FormControl>
        );

      case 'etl_job_parms':
        return (
          <FormControl key={field}>
            <FormLabel>ETL Job Parameters</FormLabel>
            <Textarea
              value={fieldValue as string || ''}
              onChange={(e) => handleFieldChange('etl_job_parms', e.target.value)}
              placeholder="Enter ETL job parameters"
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
              <option value="real-time">Real-time</option>
              <option value="micro-batch">Micro-batch</option>
              <option value="batch">Batch</option>
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent maxWidth="600px">
        <ModalHeader>
          <VStack align="stretch" spacing={2}>
            <Text>Ingestion Configuration Wizard</Text>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Step {currentStep} of {steps.length}: {currentStepConfig?.title}
              </Text>
              <Progress value={progress} colorScheme="blue" size="sm" />
            </Box>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {!canProceedToNext() && currentStep > 1 && (
              <Alert status="warning" size="sm">
                <AlertIcon />
                Please fill in all required fields to proceed.
              </Alert>
            )}

            {currentStepConfig?.fields.map(field => renderField(field))}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handleBack}
              isDisabled={currentStep === 1}
            >
              Back
            </Button>

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
                isDisabled={!canProceedToNext()}
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

export default IngestionWizard;