// schemas/jobWizardSchema.ts
import { DynamicFormSchema } from '../dynamicFormTypes';

export const JOB_WIZARD_SCHEMA: DynamicFormSchema =
{

    "formType": "job_wizard",
    "title": "Job Configuration Wizard",
    "steps": [
        {
            "id": 1,
            "title": "Processing Type Selection",
            "description": "Select the processing type for this job",
            "fields": [
                {
                    "key": "processingType",
                    "label": "Processing Type",
                    "type": "select",
                    "required": true,
                    "placeholder": "Select processing type",
                    "options": ["ingest", "etl", "ingest_etl", "stream", "stream_etl"],
                    "helperText": "Select the processing type for this job",
                    "validation": {
                        "required": true
                    }
                }
            ],
            "completionLogic": {
                "type": "all_required_filled",
                "requiredFields": ["processingType"]
            },
            "visibility": {
                "type": "always"
            }
        },
        {
            "id": 2,
            "title": "Client & Domain Information",
            "fields": [
                {
                    "key": "clnt_id",
                    "label": "Client ID",
                    "type": "input",
                    "required": true,
                    "placeholder": "Enter client ID",
                    "validation": {
                        "required": true,
                        "pattern": "^[a-zA-Z0-9]+$"
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
            "completionLogic": {
                "type": "all_required_filled",
                "requiredFields": ["clnt_id", "domain_cd", "sor_cd"]
            },
            "visibility": {
                "type": "conditional",
                "condition": {
                    "field": "processingType",
                    "operator": "in",
                    "value": ["ingest", "ingest_etl"]
                }
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
                    "options": ["s3", "stream", "redshift", "snowflake", "rds"],
                    "apiField": "trgt_pltfrm"
                }
            ],
            "completionLogic": {
                "type": "all_required_filled",
                "requiredFields": ["trgt_pltfrm"]
            },
            "visibility": {
                "type": "conditional",
                "condition": {
                    "field": "processingType",
                    "operator": "in",
                    "value": ["ingest", "ingest_etl"]
                }
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
                    "placeholder": "Enter target table name"
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
                    "options": ["full", "merge", "append", "distinct_merge", "delete_append", "distinct_append", "na"],
                    "apiField": "load_type"
                },
                {
                    "key": "load_frmt_parms",
                    "label": "Load Format Parameters",
                    "type": "textarea",
                    "placeholder": "{}",
                    "helperText": "Optional - JSON format",
                    "rows": 3
                },
                {
                    "key": "pre_load_mthd",
                    "label": "Pre-Load Method",
                    "type": "input",
                    "placeholder": "Enter pre-load method"
                }
            ],
            "completionLogic": {
                "type": "all_required_filled",
                "requiredFields": ["trgt_tbl_nm", "load_type"]
            },
            "visibility": {
                "type": "conditional",
                "condition": {
                    "field": "processingType",
                    "operator": "in",
                    "value": ["ingest", "ingest_etl"]
                }
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
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "load_type",
                            "operator": "in",
                            "value": ["merge", "distinct_merge"]
                        }
                    }
                },
                {
                    "key": "del_key_list",
                    "label": "Delete Key List",
                    "type": "input",
                    "required": true,
                    "placeholder": "Enter delete key list (comma-separated)",
                    "helperText": "Required for delete_append load type",
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "load_type",
                            "operator": "equals",
                            "value": "delete_append"
                        }
                    }
                },
                {
                    "key": "src_file_type",
                    "label": "Source File Type",
                    "type": "select",
                    "required": true,
                    "placeholder": "Select source file type",
                    "options": ["gzip", "json", "parquet", "avro", "xml", "txt"],
                    "apiField": "src_file_type"
                }
            ],
            "completionLogic": {
                "type": "custom",
                "logic": "src_file_type_and_conditional_keys"
            },
            "visibility": {
                "type": "conditional",
                "condition": {
                    "field": "processingType",
                    "operator": "in",
                    "value": ["ingest", "ingest_etl"]
                }
            }
        },
        {
            "id": 6,
            "title": "Unload Configuration",
            "fields": [
                {
                    "key": "need_unload_question",
                    "label": "Need Unload?",
                    "type": "switch"
                },
                {
                    "key": "unld_file_type",
                    "label": "Unload File Type",
                    "type": "select",
                    "required": true,
                    "placeholder": "Select unload file type",
                    "options": ["csv", "json", "parquet", "hudi", "gzip", "csv_zip", "na"],
                    "apiField": "unld_file_type",
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "need_unload_question",
                            "operator": "equals",
                            "value": true
                        }
                    }
                },
                {
                    "key": "unld_partn_key",
                    "label": "Unload Partition Key",
                    "type": "input",
                    "placeholder": "Enter partition key",
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "need_unload_question",
                            "operator": "equals",
                            "value": true
                        }
                    }
                },
                {
                    "key": "unld_frqncy",
                    "label": "Unload Frequency",
                    "type": "select",
                    "required": true,
                    "placeholder": "Select frequency",
                    "options": ["na", "daily", "weekly", "monthly", "yearly"],
                    "apiField": "unld_frqncy",
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "need_unload_question",
                            "operator": "equals",
                            "value": true
                        }
                    }
                },
                {
                    "key": "unld_type",
                    "label": "Unload Type",
                    "type": "select",
                    "required": true,
                    "placeholder": "Select unload type",
                    "options": ["na", "full", "append", "merge", "delete_append"],
                    "apiField": "unld_type",
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "need_unload_question",
                            "operator": "equals",
                            "value": true
                        }
                    }
                },
                {
                    "key": "unld_frmt_parms",
                    "label": "Unload Format Parameters",
                    "type": "textarea",
                    "placeholder": "{}",
                    "helperText": "JSON format",
                    "rows": 2,
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "need_unload_question",
                            "operator": "equals",
                            "value": true
                        }
                    }
                },
                {
                    "key": "unld_trgt_pltfrm",
                    "label": "Unload Target Platform",
                    "type": "select",
                    "placeholder": "Select unload target platform",
                    "options": ["na", "snowflake", "redshift-snowflake", "redshift"],
                    "apiField": "unld_trgt_pltfrm",
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "need_unload_question",
                            "operator": "equals",
                            "value": true
                        }
                    }
                },
                {
                    "key": "unld_zone_cd",
                    "label": "Unload Zone Code",
                    "type": "select",
                    "placeholder": "Select zone code",
                    "options": ["na", "cnfz", "rawz"],
                    "apiField": "unld_zone_cd",
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "need_unload_question",
                            "operator": "equals",
                            "value": true
                        }
                    }
                },
                {
                    "key": "unld_S3_bucket_set",
                    "label": "Unload S3 Bucket Set",
                    "type": "select",
                    "placeholder": "Select S3 bucket set",
                    "options": ["na", "-gbd-phi-", "-gbd-nophi-", "-nogbd-phi-", "-nogbd-nophi-"],
                    "apiField": "unld_S3_bucket_set",
                    "visibility": {
                        "type": "conditional",
                        "condition": {
                            "field": "need_unload_question",
                            "operator": "equals",
                            "value": true
                        }
                    }
                }
            ],
            "completionLogic": {
                "type": "custom",
                "logic": "unload_conditional"
            },
            "visibility": {
                "type": "conditional",
                "condition": {
                    "field": "processingType",
                    "operator": "in",
                    "value": ["ingest", "ingest_etl"]
                }
            }
        }
    ],
    "submitEndpoint": {
        "url": "https://aedl-/api/processing/metadata-request",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "hhhh"
        },
        "payloadMapping": "job_wizard_payload"
    }
}
