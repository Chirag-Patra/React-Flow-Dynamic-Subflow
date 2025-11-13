// src/Components/Configuration/Universal/schemas/lamdaSchema.ts
import { DynamicFormSchema } from '../dynamicFormTypes';

export const LAMDA_SCHEMA: DynamicFormSchema = {
  formType: 'lamda_wizard',
  title: 'Lambda Configuration Wizard',
  steps: [
    {
      id: 1,
      title: 'Basic Configuration',
      description: 'Configure basic Lambda function settings',
      fields: [
        {
          key: 'etl_stp_job_nm',
          label: 'Lambda Function Name',
          type: 'input',
          required: true,
          placeholder: 'Enter Lambda function name',
          validation: {
            required: true
          }
        },
        {
          key: 'componentType',
          label: 'Component Type',
          type: 'select',
          required: true,
          placeholder: 'Select component type',
          options: ['data_transformation', 'api_integration', 'event_processing', 'scheduled_task'],
          helperText: 'Select the type of Lambda function'
        },
        {
          key: 'runtime',
          label: 'Runtime',
          type: 'select',
          required: true,
          placeholder: 'Select runtime',
          options: ['python3.9', 'python3.10', 'python3.11', 'nodejs18.x', 'nodejs20.x'],
          validation: {
            required: true
          }
        },
        {
          key: 'memory_size',
          label: 'Memory Size (MB)',
          type: 'select',
          required: true,
          placeholder: 'Select memory size',
          options: ['128', '256', '512', '1024', '2048', '3008'],
          defaultValue: '256'
        },
        {
          key: 'timeout',
          label: 'Timeout (seconds)',
          type: 'number',
          required: true,
          placeholder: 'Enter timeout in seconds',
          validation: {
            required: true,
            min: 1,
            max: 900
          },
          defaultValue: 300
        }
      ],
      completionLogic: {
        type: 'all_required_filled',
        requiredFields: ['etl_stp_job_nm', 'componentType', 'runtime', 'memory_size', 'timeout']
      },
      visibility: {
        type: 'always'
      }
    },
    {
      id: 2,
      title: 'Environment & Triggers',
      description: 'Configure environment variables and triggers',
      fields: [
        {
          key: 'environment_variables',
          label: 'Environment Variables',
          type: 'textarea',
          placeholder: '{"KEY": "value"}',
          helperText: 'Enter environment variables in JSON format',
          rows: 4
        },
        {
          key: 'trigger_type',
          label: 'Trigger Type',
          type: 'select',
          placeholder: 'Select trigger type',
          options: ['s3', 'api_gateway', 'eventbridge', 'sqs', 'sns', 'manual'],
          helperText: 'Select how this Lambda will be triggered'
        },
        {
          key: 'trigger_config',
          label: 'Trigger Configuration',
          type: 'textarea',
          placeholder: '{"bucket": "my-bucket", "prefix": "data/"}',
          helperText: 'Enter trigger-specific configuration in JSON format',
          rows: 3,
          visibility: {
            type: 'conditional',
            condition: {
              field: 'trigger_type',
              operator: 'not_equals',
              value: 'manual'
            }
          }
        }
      ],
      completionLogic: {
        type: 'all_required_filled',
        requiredFields: []
      },
      visibility: {
        type: 'always'
      }
    },
    {
      id: 3,
      title: 'IAM & Networking',
      description: 'Configure IAM roles and VPC settings',
      fields: [
        {
          key: 'iam_role',
          label: 'IAM Role ARN',
          type: 'input',
          placeholder: 'arn:aws:iam::account-id:role/role-name',
          helperText: 'Enter the IAM role ARN for Lambda execution'
        },
        {
          key: 'vpc_enabled',
          label: 'Enable VPC',
          type: 'switch',
          helperText: 'Enable if Lambda needs to access VPC resources'
        },
        {
          key: 'vpc_config',
          label: 'VPC Configuration',
          type: 'textarea',
          placeholder: '{"subnetIds": ["subnet-1", "subnet-2"], "securityGroupIds": ["sg-1"]}',
          helperText: 'Enter VPC configuration in JSON format',
          rows: 3,
          visibility: {
            type: 'conditional',
            condition: {
              field: 'vpc_enabled',
              operator: 'equals',
              value: true
            }
          }
        }
      ],
      completionLogic: {
        type: 'all_required_filled',
        requiredFields: []
      },
      visibility: {
        type: 'always'
      }
    }
  ],
  submitEndpoint: {
    url: 'https://aedl-/api/processing/lambda-config',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'hhhh'
    },
    payloadMapping: 'lambda_config_payload'
  }
};