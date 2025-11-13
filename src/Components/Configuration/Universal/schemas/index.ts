// src/Components/Configuration/Universal/schemas/index.ts
import { DynamicFormSchema } from '../dynamicFormTypes';
import { JOB_WIZARD_SCHEMA } from './jobWizardSchema';
//import { ETL_WIZARD_SCHEMA } from './etlWizardSchema';
import { LAMDA_SCHEMA } from './lamdaSchema';
//import { GLUE_JOB_SCHEMA } from './glueJobSchema';
//import { STEP_FUNCTION_SCHEMA } from './stepFunctionSchema';
//import { EKS_SCHEMA } from './eksSchema';

export enum WizardType {
  JOB = 'job',
  ETL = 'etl',
  LAMDA = 'lamda',
  GLUE_JOB = 'glue_job',
  STEP_FUNCTION = 'step_function',
  EKS = 'eks'
}

export const WIZARD_SCHEMAS: Record<WizardType, DynamicFormSchema> = {
  [WizardType.JOB]: JOB_WIZARD_SCHEMA,
  [WizardType.ETL]: {} as DynamicFormSchema,
  [WizardType.LAMDA]: LAMDA_SCHEMA,
  [WizardType.GLUE_JOB]: {} as DynamicFormSchema,
  [WizardType.STEP_FUNCTION]: {} as DynamicFormSchema,
  [WizardType.EKS]: {} as DynamicFormSchema
};

export const getSchemaForComponent = (componentType: string): DynamicFormSchema | null => {
  switch (componentType) {
    case 'Job':
      return WIZARD_SCHEMAS[WizardType.JOB];
    case 'Run_Lamda':
      return WIZARD_SCHEMAS[WizardType.LAMDA];
    case 'Run_GlueJob':
      return WIZARD_SCHEMAS[WizardType.GLUE_JOB];
    case 'Run_StepFunction':
      return WIZARD_SCHEMAS[WizardType.STEP_FUNCTION];
    case 'Run_Eks':
      return WIZARD_SCHEMAS[WizardType.EKS];
    default:
      return null;
  }
};