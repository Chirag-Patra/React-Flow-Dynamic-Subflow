// dynamicFormTypes.ts

export type FieldType = 'input' | 'select' | 'textarea' | 'textJson' | 'jsonorch' | 'switch' | 'number';

export interface FieldVisibility {
  type: 'always' | 'conditional';
  condition?: {
    field: string;
    operator: 'equals' | 'in' | 'not_equals' | 'not_in';
    value: any;
  };
}

export interface FieldValidation {
  required?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

export interface DynamicField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  rows?: number;
  options?: string[];
  apiField?: string;
  validation?: FieldValidation;
  visibility?: FieldVisibility;
  defaultValue?: any;
}

export interface StepCompletionLogic {
  type: 'all_required_filled' | 'custom';
  requiredFields?: string[];
  logic?: string; // reference to custom logic function
}

export interface StepVisibility {
  type: 'always' | 'conditional';
  condition?: {
    field: string;
    operator: 'equals' | 'in' | 'not_equals' | 'not_in';
    value: any;
  };
}

export interface DynamicStep {
  id: number;
  title: string;
  description?: string;
  fields: DynamicField[];
  completionLogic: StepCompletionLogic;
  visibility: StepVisibility;
}

export interface SubmitEndpoint {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers: Record<string, string>;
  payloadMapping: string;
}

export interface DynamicFormSchema {
  formType: string;
  title: string;
  steps: DynamicStep[];
  submitEndpoint: SubmitEndpoint;
}

export type FormConfig = Record<string, any>;