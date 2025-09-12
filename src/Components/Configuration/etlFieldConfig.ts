// etlFieldConfig.ts
import { ETLConfig } from './ETLWizard';

export interface ETLFieldConfig {
  key: keyof ETLConfig;
  label: string;
  type: 'input' | 'select' | 'textarea' | 'switch' | 'number';
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  rows?: number; // for textarea
  options?: string[]; // for select
  apiField?: string; // for API-driven options
  showCondition?: (config: ETLConfig) => boolean;
  validationCondition?: (config: ETLConfig) => boolean;
}

export interface ETLStepConfig {
  id: number;
  title: string;
  fields: ETLFieldConfig[];
  isComplete: (config: ETLConfig) => boolean;
}

// Define reusable component types
export const REUSABLE_COMPONENT_TYPES = [
  'Execute Py',
  'Email Notification'
];

// ETL field configurations - simple version that always shows all fields
export const ETL_FIELD_CONFIGS: ETLStepConfig[] = [
  {
    id: 1,
    title: "Component Type ",
    fields: [
      {
        key: 'is_reusable_component',
        label: 'Do you want reusable component?',
        type: 'switch',
        helperText: 'Enable to use predefined reusable components'
      },
      {
        key: 'reusable_component_type',
        label: 'Reusable Component Type',
        type: 'select',
        placeholder: 'Select component type',
        options: REUSABLE_COMPONENT_TYPES,
        helperText: 'Choose the type of component you want to create',
        showCondition: (cfg) => cfg.is_reusable_component === true
      },

    ],
    isComplete: (cfg) => {

      const reusableValid = cfg.is_reusable_component ? !!cfg.reusable_component_type?.trim() : true;
      return reusableValid;
    }
  },
    {
    id: 2,
    title: "Basic Information",
    fields: [
      {
        key: 'etl_stp_job_nm',
        label: 'ETL Step Job Name',
        type: 'input',
        required: true,
        placeholder: 'Enter ETL step job name',
        helperText: 'Unique identifier for this ETL step'
      },
      {
        key: 'etl_stp_desc',
        label: 'ETL Step Description',
        type: 'textarea',
        placeholder: 'Enter description for this ETL step',
        helperText: 'Detailed description of what this ETL step does',
        rows: 3
      },
      {
        key: 'etl_stp_sqnc_nbr',
        label: 'ETL Step Sequence Number',
        type: 'number',
        required: true,
        placeholder: 'Enter sequence number',
        helperText: 'Order in which this step should be executed'
      }
    ],
    isComplete: (cfg) => !!cfg.etl_stp_src_platfrm?.trim() && !!cfg.etl_stp_src_schma?.trim() || !!cfg.etl_stp_job_nm?.trim() ||  cfg.etl_stp_sqnc_nbr > 0
  },
  {
    id: 3,
    title: "Source Configuration",
    fields: [
      {
        key: 'etl_stp_src_platfrm',
        label: 'Source Platform',
        type: 'select',
        required: true,
        placeholder: 'Select source platform',
        options: ['Snowflake', 'Redshift', 'PostgreSQL', 'MySQL', 'Oracle', 'S3', 'MongoDB', 'Cassandra'],
        helperText: 'Platform where source data resides'
      },
      {
        key: 'etl_stp_src_schma',
        label: 'Source Schema',
        type: 'input',
        required: true,
        placeholder: 'Enter source schema name',
        helperText: 'Schema containing the source tables/objects'
      },
      {
        key: 'etl_stp_src_stg_schma',
        label: 'Source Stage Schema',
        type: 'input',
        placeholder: 'Enter source staging schema name',
        helperText: 'Optional staging schema for intermediate processing'
      }
    ],
    isComplete: (cfg) => !!cfg.etl_stp_src_platfrm?.trim() && !!cfg.etl_stp_src_schma?.trim()
  },
  {
    id: 4,
    title: "Target Configuration",
    fields: [
      {
        key: 'etl_stp_trgt_tbl_nm',
        label: 'Target Table Name',
        type: 'input',
        required: true,
        placeholder: 'Enter target table name',
        helperText: 'Name of the destination table'
      },
      {
        key: 'etl_stp_trgt_platfrm',
        label: 'Target Platform',
        type: 'select',
        required: true,
        placeholder: 'Select target platform',
        options: ['Snowflake', 'Redshift', 'PostgreSQL', 'MySQL', 'Oracle', 'S3', 'BigQuery', 'Databricks'],
        helperText: 'Platform where data will be loaded'
      },
      {
        key: 'etl_stp_trgt_schma',
        label: 'Target Schema',
        type: 'input',
        required: true,
        placeholder: 'Enter target schema name',
        helperText: 'Schema where target table resides'
      },
      {
        key: 'etl_stp_trgt_stg_schma',
        label: 'Target Stage Schema',
        type: 'input',
        placeholder: 'Enter target staging schema name',
        helperText: 'Optional staging schema for target processing'
      }
    ],
    isComplete: (cfg) => !!cfg.etl_stp_trgt_tbl_nm?.trim() && !!cfg.etl_stp_trgt_platfrm?.trim() && !!cfg.etl_stp_trgt_schma?.trim()
  },
  {
    id: 5,
    title: "Parameters and Code Configuration",
    fields: [
      {
        key: 'etl_stp_parms',
        label: 'ETL Step Parameters',
        type: 'textarea',
        placeholder: '{}',
        helperText: 'JSON format parameters for this ETL step',
        rows: 4
      },
      {
        key: 'etl_stp_s3_code_bkt',
        label: 'S3 Code Bucket',
        type: 'input',
        required: true,
        placeholder: 's3://your-code-bucket',
        helperText: 'S3 bucket containing the ETL code'
      },
      {
        key: 'etl_stp_s3_code_key',
        label: 'S3 Code Key',
        type: 'input',
        required: true,
        placeholder: 'path/to/your/etl-code.py',
        helperText: 'S3 object key (path) to the ETL script'
      }
    ],
    isComplete: (cfg) => !!cfg.etl_stp_s3_code_bkt?.trim() && !!cfg.etl_stp_s3_code_key?.trim()
  },
  {
    id: 6,
    title: "Logging and Status Configuration",
    fields: [
      {
        key: 'etl_stp_s3_log_bkt',
        label: 'S3 Log Bucket',
        type: 'input',
        required: true,
        placeholder: 's3://your-log-bucket',
        helperText: 'S3 bucket for storing ETL execution logs'
      },
      {
        key: 'actv_flag',
        label: 'Active Flag',
        type: 'switch',
        helperText: 'Enable or disable this ETL step'
      }
    ],
    isComplete: (cfg) => !!cfg.etl_stp_s3_log_bkt?.trim()
  }
];