// jobFieldConfig.ts
import { JobConfig } from './JobWizard';

export interface FieldConfig {
  key: keyof JobConfig;
  label: string;
  type: 'input' | 'select' | 'textarea' | 'switch';
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  rows?: number; // for textarea
  options?: string[]; // for select
  apiField?: string; // for API-driven options
  showCondition?: (config: JobConfig) => boolean;
  validationCondition?: (config: JobConfig) => boolean;
}

export interface StepConfig {
  id: number;
  title: string;
  fields: FieldConfig[];
  isComplete: (config: JobConfig) => boolean;
  showForProcessingType?: (processingType?: string) => boolean;
}

// Define which processing types should show the full ingestion configuration
export const PROCESSING_TYPES_WITH_FULL_CONFIG = ['ingest', 'ingest_etl'];

// Job field configurations
export const JOB_FIELD_CONFIGS: StepConfig[] = [
  {
    id: 1,
    title: "Processing Type Selection",
    fields: [
      {
        key: 'processingType',
        label: 'Processing Type',
        type: 'select',
        required: true,
        placeholder: 'Select processing type',
        apiField: 'processingType',
        options: ['ingest', 'etl', 'ingest_etl', 'stream', 'stream_etl'],
        helperText: 'Select the processing type for this job'
      }
    ],
    isComplete: (cfg) => !!cfg.processingType?.trim(),
    showForProcessingType: () => true
  },
  {
    id: 2,
    title: "Client & Domain Information",
    fields: [
      {
        key: 'clnt_id',
        label: 'Client ID',
        type: 'input',
        required: true,
        placeholder: 'Enter client ID'
      },
      {
        key: 'domain_cd',
        label: 'Domain Code',
        type: 'input',
        required: true,
        placeholder: 'Enter domain code'
      },
      {
        key: 'sor_cd',
        label: 'SOR Code',
        type: 'input',
        required: true,
        placeholder: 'Enter SOR code'
      }
    ],
    isComplete: (cfg) => !!cfg.clnt_id?.trim() && !!cfg.domain_cd?.trim() && !!cfg.sor_cd?.trim(),
    showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
  },
  {
    id: 3,
    title: "Target Platform",
    fields: [
      {
        key: 'trgt_pltfrm',
        label: 'Target Platform',
        type: 'select',
        required: true,
        placeholder: 'Select target platform',
        apiField: 'trgt_pltfrm',
        options: ['s3', 'stream', 'redshift', 'snowflake', 'rds']
      }
    ],
    isComplete: (cfg) => !!cfg.trgt_pltfrm?.trim(),
    showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
  },
  {
    id: 4,
    title: "Table & Load Configuration",
    fields: [
      {
        key: 'trgt_tbl_nm',
        label: 'Target Table Name',
        type: 'input',
        required: true,
        placeholder: 'Enter target table name'
      },
      {
        key: 'trgt_tbl_nm_desc',
        label: 'Target Table Description',
        type: 'input',
        placeholder: 'Enter table description'
      },
      {
        key: 'load_type',
        label: 'Load Type',
        type: 'select',
        required: true,
        placeholder: 'Select load type',
        apiField: 'load_type',
        options: ['full', 'merge', 'append', 'distinct_merge', 'delete_append', 'distinct_append', 'na']
      },
      {
        key: 'load_frmt_parms',
        label: 'Load Format Parameters',
        type: 'textarea',
        placeholder: '{}',
        helperText: 'Optional - JSON format',
        rows: 3
      },
      {
        key: 'pre_load_mthd',
        label: 'Pre-Load Method',
        type: 'input',
        placeholder: 'Enter pre-load method'
      }
    ],
    isComplete: (cfg) => !!cfg.trgt_tbl_nm?.trim() && !!cfg.load_type?.trim(),
    showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
  },
  {
    id: 5,
    title: "Additional Load Configuration",
    fields: [
      {
        key: 'key_list',
        label: 'Key List',
        type: 'input',
        required: true,
        placeholder: 'Enter key list (comma-separated)',
        helperText: 'Required for merge and distinct_merge load types',
        showCondition: (cfg) => cfg.load_type === 'merge' || cfg.load_type === 'distinct_merge'
      },
      {
        key: 'del_key_list',
        label: 'Delete Key List',
        type: 'input',
        required: true,
        placeholder: 'Enter delete key list (comma-separated)',
        helperText: 'Required for delete_append load type',
        showCondition: (cfg) => cfg.load_type === 'delete_append'
      },
      {
        key: 'src_file_type',
        label: 'Source File Type',
        type: 'select',
        required: true,
        placeholder: 'Select source file type',
        apiField: 'src_file_type',
        options: ['gzip', 'json', 'parquet', 'avro', 'xml', 'txt']
      }
    ],
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
    fields: [
      {
        key: 'need_unload_question',
        label: 'Need Unload?',
        type: 'switch'
      },
      {
        key: 'unld_file_type',
        label: 'Unload File Type',
        type: 'select',
        required: true,
        placeholder: 'Select unload file type',
        apiField: 'unld_file_type',
        options: ['csv', 'json', 'parquet', 'hudi', 'gzip', 'csv_zip', 'na'],
        showCondition: (cfg) => cfg.need_unload_question === true
      },
      {
        key: 'unld_partn_key',
        label: 'Unload Partition Key',
        type: 'input',
        placeholder: 'Enter partition key',
        showCondition: (cfg) => cfg.need_unload_question === true
      },
      {
        key: 'unld_frqncy',
        label: 'Unload Frequency',
        type: 'select',
        required: true,
        placeholder: 'Select frequency',
        apiField: 'unld_frqncy',
        options: ['na', 'daily', 'weekly', 'monthly', 'yearly'],
        showCondition: (cfg) => cfg.need_unload_question === true
      },
      {
        key: 'unld_type',
        label: 'Unload Type',
        type: 'select',
        required: true,
        placeholder: 'Select unload type',
        apiField: 'unld_type',
        options: ['na', 'full', 'append', 'merge', 'delete_append'],
        showCondition: (cfg) => cfg.need_unload_question === true
      },
      {
        key: 'unld_frmt_parms',
        label: 'Unload Format Parameters',
        type: 'textarea',
        placeholder: '{}',
        helperText: 'JSON format',
        rows: 2,
        showCondition: (cfg) => cfg.need_unload_question === true
      },
      {
        key: 'unld_trgt_pltfrm',
        label: 'Unload Target Platform',
        type: 'select',
        placeholder: 'Select unload target platform',
        apiField: 'unld_trgt_pltfrm',
        options: ['na', 'snowflake', 'redshift-snowflake', 'redshift'],
        showCondition: (cfg) => cfg.need_unload_question === true
      },
      {
        key: 'unld_zone_cd',
        label: 'Unload Zone Code',
        type: 'select',
        placeholder: 'Select zone code',
        apiField: 'unld_zone_cd',
        options: ['na', 'cnfz', 'rawz'],
        showCondition: (cfg) => cfg.need_unload_question === true
      },
      {
        key: 'unld_S3_bucket_set',
        label: 'Unload S3 Bucket Set',
        type: 'select',
        placeholder: 'Select S3 bucket set',
        apiField: 'unld_S3_bucket_set',
        options: ['na', '-gbd-phi-', '-gbd-nophi-', '-nogbd-phi-', '-nogbd-nophi-'],
        showCondition: (cfg) => cfg.need_unload_question === true
      }
    ],
    isComplete: (cfg) => {
      if (!cfg.need_unload_question) return true;
      return !!cfg.unld_file_type?.trim() && !!cfg.unld_frqncy?.trim() && !!cfg.unld_type?.trim();
    },
    showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
  },
  {
    id: 7,
    title: "Processing & Platform Specific",
    fields: [
      {
        key: 'dlmtr',
        label: 'Delimiter',
        type: 'select',
        required: true,
        placeholder: 'Select delimiter',
        apiField: 'dlmtr',
        options: ['na']
      },
      {
        key: 'post_load_mthd',
        label: 'Post Load Method',
        type: 'select',
        required: true,
        placeholder: 'Select post load method',
        apiField: 'post_load_mthd',
        options: ['na']
      },
      {
        key: 'job_type',
        label: 'Job Type',
        type: 'select',
        required: true,
        placeholder: 'Select job type',
        helperText: 'Required when target platform is S3',
        apiField: 'job_type',
        options: ['glue', 'emr', 'lambda', 's3', 'sfn'],
        showCondition: (cfg) => cfg.trgt_pltfrm === 's3'
      },
      {
        key: 'etl_job_parms',
        label: 'ETL Job Parameters',
        type: 'textarea',
        placeholder: '{}',
        helperText: 'Required when target platform is S3 - JSON format',
        rows: 3,
        showCondition: (cfg) => cfg.trgt_pltfrm === 's3'
      },
      {
        key: 'load_frqncy',
        label: 'Load Frequency',
        type: 'select',
        required: true,
        placeholder: 'Select load frequency',
        helperText: 'Required when target platform is stream',
        apiField: 'load_frqncy',
        options: ['na', 'daily', 'weekly', 'quarterly', 'yearly', 'monthly'],
        showCondition: (cfg) => cfg.trgt_pltfrm === 'stream'
      }
    ],
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
    fields: [
      {
        key: 'warehouse_size_suffix',
        label: 'Warehouse Size Suffix',
        type: 'input',
        placeholder: 'Enter warehouse size suffix'
      },
      {
        key: 'actv_flag',
        label: 'Active Flag',
        type: 'select',
        required: true,
        placeholder: 'Select active flag',
        options: ['Y', 'N']
      },
      {
        key: 'ownrshp_team',
        label: 'Ownership Team',
        type: 'input',
        required: true,
        placeholder: 'Enter ownership team'
      }
    ],
    isComplete: (cfg) => !!cfg.actv_flag?.trim() && !!cfg.ownrshp_team?.trim(),
    showForProcessingType: (type) => PROCESSING_TYPES_WITH_FULL_CONFIG.includes(type || '')
  }
];