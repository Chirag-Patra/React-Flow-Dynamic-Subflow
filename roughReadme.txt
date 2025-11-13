// mockJobFormSchema.json
// Example of what the backend API should return for GET /api/form-schema/job

{
  "success": true,
  "data": {
    "componentType": "job",
    "formTitle": "Job Configuration Wizard",
    "formDescription": "Configure your data processing job with step-by-step guidance",
    "submitEndpoint": "https://aedl-/api/processing/metadata-request",
    "submitMethod": "POST",
    "metadata": {
      "version": "1.0.0",
      "lastUpdated": "2025-10-29T00:00:00Z"
    },
    "steps": [
      {
        "id": 1,
        "title": "Processing Type Selection",
        "description": "Choose the type of processing for your job",
        "fields": [
          {
            "key": "processingType",
            "label": "Processing Type",
            "type": "select",
            "required": true,
            "placeholder": "Select processing type",
            "helperText": "Select the processing type for this job",
            "options": [
              { "label": "Ingest", "value": "ingest" },
              { "label": "ETL", "value": "etl" },
              { "label": "Ingest + ETL", "value": "ingest_etl" },
              { "label": "Stream", "value": "stream" },
              { "label": "Stream + ETL", "value": "stream_etl" }
            ]
          }
        ],
        "requiredFields": ["processingType"]
      },
      {
        "id": 2,
        "title": "Client & Domain Information",
        "description": "Provide client and domain details",
        "fields": [
          {
            "key": "clnt_id",
            "label": "Client ID",
            "type": "input",
            "required": true,
            "placeholder": "Enter client ID",
            "validation": {
              "pattern": "^[0-9]+$",
              "customMessage": "Client ID must be numeric"
            }
          },
          {
            "key": "domain_cd",
            "label": "Domain Code",
            "type": "input",
            "required": true,
            "placeholder": "Enter domain code"
          },
          {
            "key": "sor_cd",
            "label": "SOR Code",
            "type": "input",
            "required": true,
            "placeholder": "Enter SOR code"
          }
        ],
        "requiredFields": ["clnt_id", "domain_cd", "sor_cd"],
        "showCondition": {
          "field": "processingType",
          "operator": "includes",
          "value": "ingest"
        }
      },
      {
        "id": 3,
        "title": "Target Platform",
        "fields": [
          {
            "key": "trgt_pltfrm",
            "label": "Target Platform",
            "type": "select",
            "required": true,
            "placeholder": "Select target platform",
            "options": ["s3", "stream", "redshift", "snowflake", "rds"]
          }
        ],
        "requiredFields": ["trgt_pltfrm"],
        "showCondition": {
          "field": "processingType",
          "operator": "includes",
          "value": "ingest"
        }
      },
      {
        "id": 4,
        "title": "Table & Load Configuration",
        "fields": [
          {
            "key": "trgt_tbl_nm",
            "label": "Target Table Name",
            "type": "input",
            "required": true,
            "placeholder": "Enter target table name",
            "validation": {
              "pattern": "^[a-zA-Z0-9_]+$",
              "customMessage": "Table name can only contain letters, numbers, and underscores"
            }
          },
          {
            "key": "trgt_tbl_nm_desc",
            "label": "Target Table Description",
            "type": "input",
            "placeholder": "Enter table description"
          },
          {
            "key": "load_type",
            "label": "Load Type",
            "type": "select",
            "required": true,
            "placeholder": "Select load type",
            "options": [
              "full",
              "merge",
              "append",
              "distinct_merge",
              "delete_append",
              "distinct_append",
              "na"
            ]
          },
          {
            "key": "load_frmt_parms",
            "label": "Load Format Parameters",
            "type": "textarea",
            "placeholder": "{}",
            "helperText": "Optional - JSON format",
            "rows": 3,
            "defaultValue": "{}"
          },
          {
            "key": "pre_load_mthd",
            "label": "Pre-Load Method",
            "type": "input",
            "placeholder": "Enter pre-load method",
            "defaultValue": "na"
          }
        ],
        "requiredFields": ["trgt_tbl_nm", "load_type"],
        "showCondition": {
          "field": "processingType",
          "operator": "includes",
          "value": "ingest"
        }
      },
      {
        "id": 5,
        "title": "Additional Load Configuration",
        "fields": [
          {
            "key": "key_list",
            "label": "Key List",
            "type": "input",
            "required": true,
            "placeholder": "Enter key list (comma-separated)",
            "helperText": "Required for merge and distinct_merge load types",
            "showCondition": {
              "field": "load_type",
              "operator": "includes",
              "value": "merge"
            }
          },
          {
            "key": "del_key_list",
            "label": "Delete Key List",
            "type": "input",
            "required": true,
            "placeholder": "Enter delete key list (comma-separated)",
            "helperText": "Required for delete_append load type",
            "showCondition": {
              "field": "load_type",
              "operator": "equals",
              "value": "delete_append"
            }
          },
          {
            "key": "src_file_type",
            "label": "Source File Type",
            "type": "select",
            "required": true,
            "placeholder": "Select source file type",
            "options": ["gzip", "json", "parquet", "avro", "xml", "txt"]
          }
        ],
        "requiredFields": ["src_file_type"],
        "showCondition": {
          "field": "processingType",
          "operator": "includes",
          "value": "ingest"
        }
      },
      {
        "id": 6,
        "title": "Unload Configuration",
        "fields": [
          {
            "key": "need_unload_question",
            "label": "Need Unload?",
            "type": "switch",
            "defaultValue": false
          },
          {
            "key": "unld_file_type",
            "label": "Unload File Type",
            "type": "select",
            "required": true,
            "placeholder": "Select unload file type",
            "options": ["csv", "json", "parquet", "hudi", "gzip", "csv_zip", "na"],
            "showCondition": {
              "field": "need_unload_question",
              "operator": "equals",
              "value": true
            }
          },
          {
            "key": "unld_partn_key",
            "label": "Unload Partition Key",
            "type": "input",
            "placeholder": "Enter partition key",
            "showCondition": {
              "field": "need_unload_question",
              "operator": "equals",
              "value": true
            }
          },
          {
            "key": "unld_frqncy",
            "label": "Unload Frequency",
            "type": "select",
            "required": true,
            "placeholder": "Select frequency",
            "options": ["na", "daily", "weekly", "monthly", "yearly"],
            "showCondition": {
              "field": "need_unload_question",
              "operator": "equals",
              "value": true
            }
          },
          {
            "key": "unld_type",
            "label": "Unload Type",
            "type": "select",
            "required": true,
            "placeholder": "Select unload type",
            "options": ["na", "full", "append", "merge", "delete_append"],
            "showCondition": {
              "field": "need_unload_question",
              "operator": "equals",
              "value": true
            }
          },
          {
            "key": "unld_frmt_parms",
            "label": "Unload Format Parameters",
            "type": "textarea",
            "placeholder": "{}",
            "helperText": "JSON format",
            "rows": 2,
            "defaultValue": "{}",
            "showCondition": {
              "field": "need_unload_question",
              "operator": "equals",
              "value": true
            }
          },
          {
            "key": "unld_trgt_pltfrm",
            "label": "Unload Target Platform",
            "type": "select",
            "placeholder": "Select unload target platform",
            "options": ["na", "snowflake", "redshift-snowflake", "redshift"],
            "showCondition": {
              "field": "need_unload_question",
              "operator": "equals",
              "value": true
            }
          },
          {
            "key": "unld_zone_cd",
            "label": "Unload Zone Code",
            "type": "select",
            "placeholder": "Select zone code",
            "options": ["na", "cnfz", "rawz"],
            "showCondition": {
              "field": "need_unload_question",
              "operator": "equals",
              "value": true
            }
          },
          {
            "key": "unld_S3_bucket_set",
            "label": "Unload S3 Bucket Set",
            "type": "select",
            "placeholder": "Select S3 bucket set",
            "options": ["na", "-gbd-phi-", "-gbd-nophi-", "-nogbd-phi-", "-nogbd-nophi-"],
            "showCondition": {
              "field": "need_unload_question",
              "operator": "equals",
              "value": true
            }
          }
        ],
        "requiredFields": [],
        "showCondition": {
          "field": "processingType",
          "operator": "includes",
          "value": "ingest"
        }
      },
      {
        "id": 7,
        "title": "Processing & Platform Specific",
        "fields": [
          {
            "key": "dlmtr",
            "label": "Delimiter",
            "type": "select",
            "required": true,
            "placeholder": "Select delimiter",
            "options": ["na"],
            "defaultValue": "na"
          },
          {
            "key": "post_load_mthd",
            "label": "Post Load Method",
            "type": "select",
            "required": true,
            "placeholder": "Select post load method",
            "options": ["na"],
            "defaultValue": "na"
          },
          {
            "key": "job_type",
            "label": "Job Type",
            "type": "select",
            "required": true,
            "placeholder": "Select job type",
            "helperText": "Required when target platform is S3",
            "options": ["glue", "emr", "lambda", "s3", "sfn"],
            "showCondition": {
              "field": "trgt_pltfrm",
              "operator": "equals",
              "value": "s3"
            }
          },
          {
            "key": "etl_job_parms",
            "label": "ETL Job Parameters",
            "type": "textarea",
            "placeholder": "{}",
            "helperText": "Required when target platform is S3 - JSON format",
            "rows": 3,
            "defaultValue": "{}",
            "showCondition": {
              "field": "trgt_pltfrm",
              "operator": "equals",
              "value": "s3"
            }
          },
          {
            "key": "load_frqncy",
            "label": "Load Frequency",
            "type": "select",
            "required": true,
            "placeholder": "Select load frequency",
            "helperText": "Required when target platform is stream",
            "options": ["na", "daily", "weekly", "quarterly", "yearly", "monthly"],
            "showCondition": {
              "field": "trgt_pltfrm",
              "operator": "equals",
              "value": "stream"
            }
          }
        ],
        "requiredFields": ["dlmtr", "post_load_mthd"],
        "showCondition": {
          "field": "processingType",
          "operator": "includes",
          "value": "ingest"
        }
      },
      {
        "id": 8,
        "title": "Final Configuration",
        "fields": [
          {
            "key": "warehouse_size_suffix",
            "label": "Warehouse Size Suffix",
            "type": "input",
            "placeholder": "Enter warehouse size suffix",
            "defaultValue": "--BLANK--"
          },
          {
            "key": "actv_flag",
            "label": "Active Flag",
            "type": "select",
            "required": true,
            "placeholder": "Select active flag",
            "options": ["Y", "N"],
            "defaultValue": "N"
          },
          {
            "key": "ownrshp_team",
            "label": "Ownership Team",
            "type": "input",
            "required": true,
            "placeholder": "Enter ownership team",
            "defaultValue": "AEDL"
          }
        ],
        "requiredFields": ["actv_flag", "ownrshp_team"],
        "showCondition": {
          "field": "processingType",
          "operator": "includes",
          "value": "ingest"
        }
      }
    ]
  }
}






