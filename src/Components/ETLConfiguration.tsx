import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Switch,
  Divider,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';

export interface ETLConfig {
  aplctn_cd?: string;
  job_id?: string;
  etl_job_type?: string;
  etl_stp_desc?: string;
  etl_stp_trgt_tbl_nm?: string;
  etl_stp_src_platfrm?: string;
  etl_stp_trgt_platfrm?: string;
  etl_stp_src_schma?: string;
  etl_stp_src_stg_schma?: string;
  etl_stp_trgt_schma?: string;
  etl_stp_trgt_stg_schma?: string;
  etl_stp_sqnc_nbr?: string;
  etl_stp_parms?: string;
  etl_stp_s3_code_bkt?: string;
  etl_stp_s3_code_key?: string;
  etl_stp_job_nm?: string;
  etl_stp_s3_log_bkt?: string;
  actv_flag?: boolean;
  rqstr_id?: string;
  ownrshp_team?: string;
}

interface ETLConfigurationProps {
  value: ETLConfig;
  onChange: (config: ETLConfig) => void;
}

const ETLConfiguration: React.FC<ETLConfigurationProps> = ({ value, onChange }) => {
  const [config, setConfig] = useState<ETLConfig>(value || {});

  useEffect(() => {
    setConfig(value || {});
  }, [value]);

  const handleInputChange = (field: keyof ETLConfig, newValue: string | boolean) => {
    const updatedConfig = {
      ...config,
      [field]: newValue,
    };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

  const platformOptions = [
    { value: 'S3', label: 'Amazon S3' },
    { value: 'RDS', label: 'Amazon RDS' },
    { value: 'Redshift', label: 'Amazon Redshift' },
    { value: 'DynamoDB', label: 'Amazon DynamoDB' },
    { value: 'Snowflake', label: 'Snowflake' },
    { value: 'PostgreSQL', label: 'PostgreSQL' },
    { value: 'MySQL', label: 'MySQL' },
    { value: 'Oracle', label: 'Oracle' },
    { value: 'MongoDB', label: 'MongoDB' },
  ];

  const jobTypeOptions = [
    { value: 'extract', label: 'Extract' },
    { value: 'transform', label: 'Transform' },
    { value: 'load', label: 'Load' },
    { value: 'etl', label: 'ETL' },
    { value: 'elt', label: 'ELT' },
  ];

  return (
    <Box mt={4}>
      <Accordion allowMultiple >
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontSize="sm" fontWeight="semibold">
                  ETL Configuration
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <VStack spacing={3} align="stretch">
              {/* Basic Information */}
              <FormControl size="sm">
                <FormLabel fontSize="xs">Application Code</FormLabel>
                <Input
                  size="sm"
                  value={config.aplctn_cd || ''}
                  onChange={(e) => handleInputChange('aplctn_cd', e.target.value)}
                  placeholder="Enter application code"
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Job ID</FormLabel>
                <Input
                  size="sm"
                  value={config.job_id || ''}
                  onChange={(e) => handleInputChange('job_id', e.target.value)}
                  placeholder="Enter job ID"
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">ETL Job Type</FormLabel>
                <Select
                  size="sm"
                  value={config.etl_job_type || ''}
                  onChange={(e) => handleInputChange('etl_job_type', e.target.value)}
                  placeholder="Select job type"
                >
                  {jobTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Step Description</FormLabel>
                <Textarea
                  size="sm"
                  value={config.etl_stp_desc || ''}
                  onChange={(e) => handleInputChange('etl_stp_desc', e.target.value)}
                  placeholder="Describe the ETL step"
                  rows={2}
                />
              </FormControl>

              <Divider />

              {/* Source Configuration */}
              <Text fontSize="xs" fontWeight="bold" color="blue.600">
                Source Configuration
              </Text>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Source Platform</FormLabel>
                <Select
                  size="sm"
                  value={config.etl_stp_src_platfrm || ''}
                  onChange={(e) => handleInputChange('etl_stp_src_platfrm', e.target.value)}
                  placeholder="Select source platform"
                >
                  {platformOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Source Schema</FormLabel>
                <Input
                  size="sm"
                  value={config.etl_stp_src_schma || ''}
                  onChange={(e) => handleInputChange('etl_stp_src_schma', e.target.value)}
                  placeholder="Source schema name"
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Source Staging Schema</FormLabel>
                <Input
                  size="sm"
                  value={config.etl_stp_src_stg_schma || ''}
                  onChange={(e) => handleInputChange('etl_stp_src_stg_schma', e.target.value)}
                  placeholder="Source staging schema"
                />
              </FormControl>

              <Divider />

              {/* Target Configuration */}
              <Text fontSize="xs" fontWeight="bold" color="green.600">
                Target Configuration
              </Text>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Target Platform</FormLabel>
                <Select
                  size="sm"
                  value={config.etl_stp_trgt_platfrm || ''}
                  onChange={(e) => handleInputChange('etl_stp_trgt_platfrm', e.target.value)}
                  placeholder="Select target platform"
                >
                  {platformOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Target Table Name</FormLabel>
                <Input
                  size="sm"
                  value={config.etl_stp_trgt_tbl_nm || ''}
                  onChange={(e) => handleInputChange('etl_stp_trgt_tbl_nm', e.target.value)}
                  placeholder="Target table name"
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Target Schema</FormLabel>
                <Input
                  size="sm"
                  value={config.etl_stp_trgt_schma || ''}
                  onChange={(e) => handleInputChange('etl_stp_trgt_schma', e.target.value)}
                  placeholder="Target schema name"
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Target Staging Schema</FormLabel>
                <Input
                  size="sm"
                  value={config.etl_stp_trgt_stg_schma || ''}
                  onChange={(e) => handleInputChange('etl_stp_trgt_stg_schma', e.target.value)}
                  placeholder="Target staging schema"
                />
              </FormControl>

              <Divider />

              {/* Execution Configuration */}
              <Text fontSize="xs" fontWeight="bold" color="purple.600">
                Execution Configuration
              </Text>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Sequence Number</FormLabel>
                <Input
                  size="sm"
                  type="number"
                  value={config.etl_stp_sqnc_nbr || ''}
                  onChange={(e) => handleInputChange('etl_stp_sqnc_nbr', e.target.value)}
                  placeholder="Execution sequence"
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Step Parameters</FormLabel>
                <Textarea
                  size="sm"
                  value={config.etl_stp_parms || ''}
                  onChange={(e) => handleInputChange('etl_stp_parms', e.target.value)}
                  placeholder="JSON parameters for the step"
                  rows={2}
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Job Name</FormLabel>
                <Input
                  size="sm"
                  value={config.etl_stp_job_nm || ''}
                  onChange={(e) => handleInputChange('etl_stp_job_nm', e.target.value)}
                  placeholder="ETL job name"
                />
              </FormControl>

              <Divider />

              {/* S3 Configuration */}
              <Text fontSize="xs" fontWeight="bold" color="orange.600">
                S3 Configuration
              </Text>

              <FormControl size="sm">
                <FormLabel fontSize="xs">S3 Code Bucket</FormLabel>
                <Input
                  size="sm"
                  value={config.etl_stp_s3_code_bkt || ''}
                  onChange={(e) => handleInputChange('etl_stp_s3_code_bkt', e.target.value)}
                  placeholder="S3 bucket for code"
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">S3 Code Key</FormLabel>
                <Input
                  size="sm"
                  value={config.etl_stp_s3_code_key || ''}
                  onChange={(e) => handleInputChange('etl_stp_s3_code_key', e.target.value)}
                  placeholder="S3 key/path for code"
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">S3 Log Bucket</FormLabel>
                <Input
                  size="sm"
                  value={config.etl_stp_s3_log_bkt || ''}
                  onChange={(e) => handleInputChange('etl_stp_s3_log_bkt', e.target.value)}
                  placeholder="S3 bucket for logs"
                />
              </FormControl>

              <Divider />

              {/* Metadata */}
              <Text fontSize="xs" fontWeight="bold" color="gray.600">
                Metadata
              </Text>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Requester ID</FormLabel>
                <Input
                  size="sm"
                  value={config.rqstr_id || ''}
                  onChange={(e) => handleInputChange('rqstr_id', e.target.value)}
                  placeholder="Requester identifier"
                />
              </FormControl>

              <FormControl size="sm">
                <FormLabel fontSize="xs">Ownership Team</FormLabel>
                <Input
                  size="sm"
                  value={config.ownrshp_team || ''}
                  onChange={(e) => handleInputChange('ownrshp_team', e.target.value)}
                  placeholder="Team responsible for this job"
                />
              </FormControl>

              <FormControl size="sm" display="flex" alignItems="center">
                <FormLabel fontSize="xs" mb="0">
                  Active Flag
                </FormLabel>
                <Switch
                  size="sm"
                  isChecked={config.actv_flag || false}
                  onChange={(e) => handleInputChange('actv_flag', e.target.checked)}
                />
              </FormControl>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default ETLConfiguration;