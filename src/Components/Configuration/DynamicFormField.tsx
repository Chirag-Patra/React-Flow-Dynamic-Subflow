// DynamicFormField.tsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Textarea,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { JobConfig } from './Job configuration/JobWizard';
import { ETLConfig } from './ETLWizard';
import { FieldConfig } from './Job configuration/jobFieldConfig';
import { ETLFieldConfig } from './etlFieldConfig';
import { ApiService, JobParametersResponse } from '../apiService';

// Union type for both configurations
type FormConfig = JobConfig | ETLConfig;
type FormFieldConfig = FieldConfig | ETLFieldConfig;

interface DynamicFormFieldProps {
  fieldConfig: FormFieldConfig;
  value: any;
  onChange: (field: string, value: any) => void;
  apiData?: JobParametersResponse | null;
  config: FormConfig;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  fieldConfig,
  value,
  onChange,
  apiData = null,
  config
}) => {
  const {
    key,
    label,
    type,
    required,
    placeholder,
    helperText,
    rows,
    options,
    apiField,
    showCondition
  } = fieldConfig;

  // Check if field should be shown based on condition
  if (showCondition && !showCondition(config as any)) {
    return null;
  }

  // Helper function to render select options
  const renderSelectOptions = () => {
    // Only use API options for job configurations
    const apiOptions = apiField && apiData ? ApiService.getFieldOptions(apiData, apiField) : [];
    const finalOptions = apiOptions.length > 0 ? apiOptions : (options || []);

    return finalOptions.map((option) => (
      <option key={option} value={option}>
        {apiData ? ApiService.formatOptionValue(option) : option}
      </option>
    ));
  };

  const handleChange = (newValue: any) => {
    onChange(key as string, newValue);
  };

  const renderField = () => {
    switch (type) {
      case 'input':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
          />
        );

      case 'number':
        return (
          <NumberInput
            value={value || 1}
            onChange={(_, num) => handleChange(num || 1)}
            min={1}
          >
            <NumberInputField placeholder={placeholder} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
          >
            {renderSelectOptions()}
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            value={value || (typeof key === 'string' && key.includes('parms') ? '{}' : '')}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            rows={rows || 3}
          />
        );

      case 'switch':
        return (
          <Switch
            isChecked={value || false}
            onChange={(e) => handleChange(e.target.checked)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <FormControl
      key={key as string}
      isRequired={required}
      display={type === 'switch' ? 'flex' : 'block'}
      alignItems={type === 'switch' ? 'center' : 'initial'}
    >
      <FormLabel mb={type === 'switch' ? 0 : undefined}>
        {label}
      </FormLabel>
      {renderField()}
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default DynamicFormField;